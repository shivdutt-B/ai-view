const AnalysisService = require('../services/analysisService');

class AudioController {
  constructor() {
    this.analysisService = new AnalysisService();
  }

  /**
   * Analyze a single audio file
   * POST /api/audio/analyze
   */
  async analyzeAudio(req, res) {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          error: 'No audio file provided',
          message: 'Please upload an audio file using the "audio" field'
        });
      }

      const { buffer, originalname, mimetype } = req.file;
      const { question, questionId, metadata } = req.body;

      console.log(`📁 Received audio file: ${originalname} (${mimetype})`);

      // Validate the audio file
      const validation = this.analysisService.validateAudioFile(buffer, mimetype);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Invalid audio file',
          details: validation.errors
        });
      }

      // Prepare metadata
      const analysisMetadata = {
        question,
        questionId,
        originalname,
        mimetype,
        fileSize: buffer.length,
        ...metadata
      };

      // Perform analysis
      const analysis = await this.analysisService.analyzeAudio(
        buffer, 
        originalname, 
        analysisMetadata
      );

      res.json({
        success: true,
        data: analysis
      });

    } catch (error) {
      console.error('Audio analysis error:', error);
      
      // Return much stricter/lower fallback scores for failed analysis
      const fallbackAnalysis = {
        transcription: {
          text: 'Analysis failed - unable to process audio',
          duration: 0,
          word_count: 0,
          words_per_minute: 0
        },
        communication_analysis: {
          tone: {
            score: 15,
            assessment: 'unacceptable - analysis failed',
            details: 'Unable to analyze tone due to processing error'
          },
          confidence: {
            score: 10,
            assessment: 'unacceptable - analysis failed'
          },
          hesitation: {
            level: 'unacceptable - analysis failed',
            count: 0,
            rate: 0,
            details: []
          },
          pauses: {
            quality: 10,
            assessment: 'unacceptable - analysis failed',
            details: 'Unable to analyze pauses'
          },
          overall_score: 12,
          summary: 'Analysis failed. Audio could not be processed properly. Score reflects technical failure.'
        },
        metadata: {
          filename: req.file?.originalname || 'unknown',
          analysis_timestamp: new Date().toISOString(),
          service_version: '1.0.0',
          provider: 'AssemblyAI',
          error: 'Analysis failed'
        }
      };

      // Log the error for monitoring
      console.error(`❌ Returning fallback low scores for failed analysis: ${error.message}`);

      res.status(500).json({
        error: 'Audio analysis failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        data: fallbackAnalysis // Return fallback with very low scores
      });
    }
  }

  /**
   * Analyze audio from URL (for S3 integration)
   * POST /api/audio/analyze-url
   */
  async analyzeAudioFromUrl(req, res) {
    try {
      const { audioUrl, question, questionId, metadata } = req.body;

      if (!audioUrl) {
        return res.status(400).json({
          error: 'No audio URL provided',
          message: 'Please provide an audioUrl field'
        });
      }

      console.log(`🔗 Analyzing audio from URL: ${audioUrl}`);

      // Download audio from URL
      const audioBuffer = await this.downloadAudioFromUrl(audioUrl);
      
      // Extract filename from URL
      const filename = audioUrl.split('/').pop() || 'audio-file';
      
      // Prepare metadata
      const analysisMetadata = {
        question,
        questionId,
        audioUrl,
        fileSize: audioBuffer.length,
        ...metadata
      };

      // Perform analysis
      const analysis = await this.analysisService.analyzeAudio(
        audioBuffer, 
        filename, 
        analysisMetadata
      );

      res.json({
        success: true,
        data: analysis
      });

    } catch (error) {
      console.error('Audio URL analysis error:', error);
      
      // Return much stricter/lower fallback scores for failed URL analysis
      const fallbackAnalysis = {
        transcription: {
          text: 'URL analysis failed - unable to process audio from URL',
          duration: 0,
          word_count: 0,
          words_per_minute: 0
        },
        communication_analysis: {
          tone: {
            score: 12,
            assessment: 'unacceptable - URL analysis failed',
            details: 'Unable to analyze tone from URL'
          },
          confidence: {
            score: 8,
            assessment: 'unacceptable - URL analysis failed'
          },
          hesitation: {
            level: 'unacceptable - URL analysis failed',
            count: 0,
            rate: 0,
            details: []
          },
          pauses: {
            quality: 8,
            assessment: 'unacceptable - URL analysis failed',
            details: 'Unable to analyze pauses from URL'
          },
          overall_score: 10,
          summary: 'URL analysis failed. Audio could not be downloaded or processed from the provided URL.'
        },
        metadata: {
          filename: 'url-audio-failed',
          analysis_timestamp: new Date().toISOString(),
          service_version: '1.0.0',
          provider: 'AssemblyAI',
          audioUrl: req.body.audioUrl,
          error: 'URL analysis failed'
        }
      };

      console.error(`❌ Returning fallback low scores for failed URL analysis: ${error.message}`);

      res.status(500).json({
        error: 'Audio analysis from URL failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        data: fallbackAnalysis // Return fallback with very low scores
      });
    }
  }

  /**
   * Analyze multiple audio files in batch
   * POST /api/audio/analyze-batch
   */
  async analyzeBatch(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: 'No audio files provided',
          message: 'Please upload audio files using the "audio" field'
        });
      }

      if (req.files.length > 10) {
        return res.status(400).json({
          error: 'Too many files',
          message: 'Maximum 10 files allowed per batch'
        });
      }

      console.log(`📦 Received batch of ${req.files.length} audio files`);

      // Prepare files for analysis
      const audioFiles = req.files.map((file, index) => {
        const metadata = req.body[`metadata_${index}`] ? JSON.parse(req.body[`metadata_${index}`]) : {};
        
        return {
          buffer: file.buffer,
          filename: file.originalname,
          metadata: {
            ...metadata,
            mimetype: file.mimetype,
            fileSize: file.buffer.length
          }
        };
      });

      // Validate all files
      const invalidFiles = [];
      audioFiles.forEach((file, index) => {
        const validation = this.analysisService.validateAudioFile(file.buffer, file.metadata.mimetype);
        if (!validation.isValid) {
          invalidFiles.push({
            index,
            filename: file.filename,
            errors: validation.errors
          });
        }
      });

      if (invalidFiles.length > 0) {
        return res.status(400).json({
          error: 'Invalid audio files',
          details: invalidFiles
        });
      }

      // Perform batch analysis
      const results = await this.analysisService.analyzeBatch(audioFiles);

      console.log('RESULT: ', results)

      res.json({
        success: true,
        data: {
          total_files: audioFiles.length,
          successful_analyses: results.filter(r => !r.error).length,
          failed_analyses: results.filter(r => r.error).length,
          results
        }
      });

    } catch (error) {
      console.error('Batch analysis error:', error);
      res.status(500).json({
        error: 'Batch analysis failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Get service health and capabilities
   * GET /api/audio/health
   */
  async getHealth(req, res) {
    try {
      const health = this.analysisService.getHealthStatus();
      res.json(health);
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        status: 'error',
        error: error.message
      });
    }
  }

  /**
   * Download audio file from URL
   * @param {string} url 
   * @returns {Promise<Buffer>}
   */
  async downloadAudioFromUrl(url) {
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to download audio: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('audio/')) {
        throw new Error(`Invalid content type: ${contentType}. Expected audio file.`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);

    } catch (error) {
      throw new Error(`Failed to download audio from URL: ${error.message}`);
    }
  }
}

module.exports = AudioController;