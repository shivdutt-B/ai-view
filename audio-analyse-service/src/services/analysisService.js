const AssemblyAIService = require('./assemblyAIService');

class AnalysisService {
  constructor() {
    this.assemblyAIService = new AssemblyAIService();
  }

  /**
   * Analyze audio file and return structured results
   * @param {Buffer} audioBuffer - Audio file buffer
   * @param {string} filename - Original filename
   * @param {Object} metadata - Additional metadata (question, etc.)
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeAudio(audioBuffer, filename, metadata = {}) {
    try {
      console.log(`🔍 Starting audio analysis for: ${filename}`);
      
      // Validate input
      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('Invalid audio buffer provided');
      }

      // Perform AssemblyAI analysis
      const assemblyAIResults = await this.assemblyAIService.analyzeAudio(audioBuffer);
      
      // Structure the response according to our API format
      const analysis = {
        transcription: {
          text: assemblyAIResults.transcription.text,
          duration: assemblyAIResults.transcription.duration,
          word_count: assemblyAIResults.transcription.wordCount,
          words_per_minute: assemblyAIResults.transcription.wordsPerMinute
        },
        communication_analysis: {
          tone: {
            score: assemblyAIResults.metrics.toneScore,
            assessment: this.assessTone(assemblyAIResults.metrics.toneScore),
            details: assemblyAIResults.details.sentiment
          },
          confidence: {
            score: assemblyAIResults.metrics.averageConfidence,
            assessment: this.assessConfidence(assemblyAIResults.metrics.averageConfidence)
          },
          hesitation: {
            level: this.assessHesitation(assemblyAIResults.metrics.hesitationRate),
            count: assemblyAIResults.metrics.hesitationCount,
            rate: assemblyAIResults.metrics.hesitationRate,
            details: assemblyAIResults.details.hesitations
          },
          pauses: {
            quality: assemblyAIResults.metrics.pauseQuality,
            assessment: this.assessPauses(assemblyAIResults.metrics.pauseQuality),
            details: assemblyAIResults.details.pauses
          },
          overall_score: this.calculateOverallScore(assemblyAIResults.metrics),
          summary: this.generateSummary(assemblyAIResults.metrics)
        },
        metadata: {
          filename,
          analysis_timestamp: new Date().toISOString(),
          service_version: '1.0.0',
          provider: 'AssemblyAI',
          ...metadata
        }
      };

      console.log(`✅ Audio analysis completed for: ${filename}`);
      return analysis;

    } catch (error) {
      console.error(`❌ Audio analysis failed for ${filename}:`, error);
      throw new Error(`Audio analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze multiple audio files in batch
   * @param {Array} audioFiles - Array of {buffer, filename, metadata}
   * @returns {Promise<Array>} Array of analysis results
   */
  async analyzeBatch(audioFiles) {
    try {
      console.log(`🔄 Starting batch analysis for ${audioFiles.length} files`);
      
      const results = await Promise.all(
        audioFiles.map(async (file, index) => {
          try {
            return await this.analyzeAudio(file.buffer, file.filename, file.metadata);
          } catch (error) {
            console.error(`Failed to analyze file ${index + 1}:`, error);
            return {
              error: error.message,
              filename: file.filename,
              metadata: file.metadata
            };
          }
        })
      );

      console.log(`✅ Batch analysis completed: ${results.length} results`);
      return results;

    } catch (error) {
      console.error('Batch analysis failed:', error);
      throw new Error(`Batch analysis failed: ${error.message}`);
    }
  }

  /**
   * Validate audio file format and size
   * @param {Buffer} audioBuffer 
   * @param {string} mimetype 
   * @returns {Object} Validation result
   */
  validateAudioFile(audioBuffer, mimetype) {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/mp4',
      'audio/m4a',
      'audio/aac',
      'audio/webm',
      'audio/ogg'
    ];

    const validation = {
      isValid: true,
      errors: []
    };

    // Check file size
    if (audioBuffer.length > maxSize) {
      validation.isValid = false;
      validation.errors.push(`File size (${Math.round(audioBuffer.length / 1024 / 1024)}MB) exceeds maximum allowed size (50MB)`);
    }

    // Check MIME type
    if (!allowedTypes.includes(mimetype)) {
      validation.isValid = false;
      validation.errors.push(`Unsupported audio format: ${mimetype}. Allowed formats: ${allowedTypes.join(', ')}`);
    }

    // Check minimum file size (should be at least 1KB)
    if (audioBuffer.length < 1024) {
      validation.isValid = false;
      validation.errors.push('Audio file appears to be too small or corrupted');
    }

    return validation;
  }

  /**
   * Assess pause patterns - EXTREMELY STRICT EVALUATION
   * @param {number} pauseQuality 
   * @returns {string}
   */
  assessPauses(pauseQuality) {
    if (pauseQuality >= 98) {
      return 'excellent - natural rhythm';
    } else if (pauseQuality >= 92) {
      return 'good - appropriate pacing';
    } else if (pauseQuality >= 80) {
      return 'average - noticeable timing issues';
    } else if (pauseQuality >= 65) {
      return 'poor - significant pacing concerns';
    } else if (pauseQuality >= 40) {
      return 'very poor - major timing problems';
    } else {
      return 'unacceptable - severe communication issues';
    }
  }

  /**
   * Assess tone score - EXTREMELY STRICT EVALUATION
   * @param {number} toneScore 
   * @returns {string}
   */
  assessTone(toneScore) {
    if (toneScore >= 95) {
      return 'confident and positive';
    } else if (toneScore >= 88) {
      return 'generally positive';
    } else if (toneScore >= 78) {
      return 'neutral to slightly positive';
    } else if (toneScore >= 60) {
      return 'lacks confidence and enthusiasm';
    } else if (toneScore >= 40) {
      return 'poor tone and low confidence';
    } else {
      return 'unacceptable tone and delivery';
    }
  }

  /**
   * Assess confidence score - EXTREMELY STRICT EVALUATION
   * @param {number} confidenceScore 
   * @returns {string}
   */
  assessConfidence(confidenceScore) {
    if (confidenceScore >= 98) {
      return 'exceptional confidence and clarity';
    } else if (confidenceScore >= 92) {
      return 'very confident delivery';
    } else if (confidenceScore >= 85) {
      return 'confident delivery';
    } else if (confidenceScore >= 75) {
      return 'moderate confidence with some clarity issues';
    } else if (confidenceScore >= 60) {
      return 'low confidence with noticeable hesitation';
    } else if (confidenceScore >= 40) {
      return 'poor confidence and unclear delivery';
    } else {
      return 'unacceptable confidence and major clarity issues';
    }
  }

  /**
   * Assess hesitation level - EXTREMELY STRICT EVALUATION
   * @param {number} hesitationRate 
   * @returns {string}
   */
  assessHesitation(hesitationRate) {
    if (hesitationRate <= 0.5) {
      return 'minimal';
    } else if (hesitationRate <= 1.5) {
      return 'low';
    } else if (hesitationRate <= 3) {
      return 'moderate - noticeable';
    } else if (hesitationRate <= 6) {
      return 'high - concerning';
    } else if (hesitationRate <= 10) {
      return 'excessive - major issue';
    } else {
      return 'unacceptable - severe communication problem';
    }
  }

  /**
   * Calculate overall communication score - EXTREMELY STRICT EVALUATION
   * @param {Object} metrics 
   * @returns {number}
   */
  calculateOverallScore(metrics) {
    const weights = {
      confidence: 0.4,     // Increased weight for confidence
      tone: 0.25,
      hesitation: 0.35,    // Significantly increased weight for hesitation penalty
      pauses: 0.0          // Removed weight for pauses - focus on core metrics
    };

    // Much more severe hesitation penalty
    const hesitationScore = Math.max(0, 100 - (metrics.hesitationRate * 12));
    
    // Apply extremely strict quality thresholds
    let qualityPenalty = 1.0;
    
    // Very severe penalty for poor confidence
    if (metrics.averageConfidence < 60) {
      qualityPenalty *= 0.5;
    } else if (metrics.averageConfidence < 75) {
      qualityPenalty *= 0.7;
    } else if (metrics.averageConfidence < 85) {
      qualityPenalty *= 0.85;
    }
    
    // Extremely severe penalty for hesitation
    if (metrics.hesitationRate > 6) {
      qualityPenalty *= 0.4;
    } else if (metrics.hesitationRate > 3) {
      qualityPenalty *= 0.6;
    } else if (metrics.hesitationRate > 1.5) {
      qualityPenalty *= 0.8;
    }
    
    // Penalty for poor tone
    if (metrics.toneScore < 50) {
      qualityPenalty *= 0.6;
    } else if (metrics.toneScore < 70) {
      qualityPenalty *= 0.8;
    }
    
    // Penalty for poor pauses
    if (metrics.pauseQuality < 60) {
      qualityPenalty *= 0.8;
    } else if (metrics.pauseQuality < 80) {
      qualityPenalty *= 0.9;
    }

    const baseScore = (
      metrics.averageConfidence * weights.confidence +
      metrics.toneScore * weights.tone +
      hesitationScore * weights.hesitation +
      metrics.pauseQuality * weights.pauses
    );

    const finalScore = baseScore * qualityPenalty;
    
    // Apply additional extreme strictness - reduce scores significantly
    const strictnessReduction = finalScore * 0.75; // 25% reduction for much stricter evaluation

    return Math.round(Math.max(0, Math.min(100, strictnessReduction)));
  }

  /**
   * Generate analysis summary - EXTREMELY STRICT EVALUATION
   * @param {Object} metrics 
   * @returns {string}
   */
  generateSummary(metrics) {
    const overallScore = this.calculateOverallScore(metrics);
    const confidenceAssessment = this.assessConfidence(metrics.averageConfidence);
    const hesitationLevel = this.assessHesitation(metrics.hesitationRate);
    
    // Add performance level assessment based on extremely strict criteria
    let performanceLevel = '';
    if (overallScore >= 92) {
      performanceLevel = 'Excellent performance';
    } else if (overallScore >= 82) {
      performanceLevel = 'Good performance';
    } else if (overallScore >= 70) {
      performanceLevel = 'Average performance';
    } else if (overallScore >= 55) {
      performanceLevel = 'Below average performance';
    } else if (overallScore >= 35) {
      performanceLevel = 'Poor performance';
    } else {
      performanceLevel = 'Unacceptable performance';
    }
    
    // Add specific feedback based on metrics
    let feedback = '';
    if (metrics.hesitationRate > 3) {
      feedback += ' Excessive hesitation detected.';
    }
    if (metrics.averageConfidence < 75) {
      feedback += ' Low confidence and clarity.';
    }
    if (metrics.toneScore < 70) {
      feedback += ' Tone lacks professionalism.';
    }
    
    return `${performanceLevel}. Overall communication score: ${overallScore}/100. ${confidenceAssessment} with ${hesitationLevel} hesitation.${feedback}`;
  }

  /**
   * Get service health status
   * @returns {Object} Health check information
   */
  getHealthStatus() {
    try {
      const assemblyAIConfigured = !!process.env.ASSEMBLYAI_API_KEY;
      
      return {
        status: 'healthy',
        services: {
          assemblyai: {
            configured: assemblyAIConfigured,
            status: assemblyAIConfigured ? 'ready' : 'not_configured'
          }
        },
        capabilities: [
          'audio_transcription',
          'sentiment_analysis',
          'hesitation_detection',
          'pause_analysis',
          'communication_scoring',
          'tone_analysis'
        ],
        supported_formats: [
          'wav', 'mp3', 'mp4', 'm4a', 'aac', 'webm', 'ogg'
        ],
        limits: {
          max_file_size: '50MB',
          max_duration: '30 minutes',
          batch_size: '10 files'
        }
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}

module.exports = AnalysisService;
