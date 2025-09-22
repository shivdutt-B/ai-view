const axios = require('axios');
const fs = require('fs-extra');

const BASE_URL = 'https://api.assemblyai.com';

/**
 * AssemblyAI service for audio analysis
 */
class AssemblyAIService {
  constructor() {
    this.apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!this.apiKey) {
      throw new Error('ASSEMBLYAI_API_KEY environment variable is required');
    }
    
    this.headers = {
      authorization: this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Upload audio file to AssemblyAI
   * @param {Buffer} audioBuffer - Audio file buffer
   * @returns {Promise<string>} Upload URL
   */
  async uploadAudio(audioBuffer) {
    try {
      console.log('📤 Uploading audio to AssemblyAI...');
      
      const uploadResponse = await axios.post(
        `${BASE_URL}/v2/upload`,
        audioBuffer,
        {
          headers: {
            authorization: this.apiKey,
            'Content-Type': 'application/octet-stream'
          }
        }
      );
      
      const audioUrl = uploadResponse.data.upload_url;
      console.log('✅ Audio uploaded successfully');
      return audioUrl;
      
    } catch (error) {
      console.error('❌ Failed to upload audio:', error.message);
      throw new Error(`Audio upload failed: ${error.message}`);
    }
  }

  /**
   * Start transcription with sentiment analysis
   * @param {string} audioUrl - URL of uploaded audio
   * @returns {Promise<string>} Transcript ID
   */
  async startTranscription(audioUrl) {
    try {
      console.log('🎯 Starting transcription with sentiment analysis...');
      
      const data = {
        audio_url: audioUrl,
        speech_model: 'universal',
        sentiment_analysis: true,
        punctuate: true,
        format_text: true,
        speaker_labels: false,
        disfluencies: true // This helps detect "um", "uh", etc.
      };

      const response = await axios.post(
        `${BASE_URL}/v2/transcript`,
        data,
        { headers: this.headers }
      );

      const transcriptId = response.data.id;
      console.log('✅ Transcription started with ID:', transcriptId);
      return transcriptId;
      
    } catch (error) {
      console.error('❌ Failed to start transcription:', error.message);
      throw new Error(`Transcription start failed: ${error.message}`);
    }
  }

  /**
   * Poll for transcription completion
   * @param {string} transcriptId - Transcript ID
   * @returns {Promise<Object>} Transcription result
   */
  async pollTranscription(transcriptId) {
    try {
      console.log('⏳ Polling for transcription completion...');
      const pollingEndpoint = `${BASE_URL}/v2/transcript/${transcriptId}`;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max (5 second intervals)

      while (attempts < maxAttempts) {
        const pollingResponse = await axios.get(pollingEndpoint, {
          headers: this.headers
        });
        
        const transcriptionResult = pollingResponse.data;
        
        if (transcriptionResult.status === 'completed') {
          console.log('✅ Transcription completed successfully');
          return transcriptionResult;
        } else if (transcriptionResult.status === 'error') {
          throw new Error(`Transcription failed: ${transcriptionResult.error}`);
        } else {
          console.log(`⏳ Status: ${transcriptionResult.status}, attempt ${attempts + 1}/${maxAttempts}`);
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          attempts++;
        }
      }
      
      throw new Error('Transcription polling timeout');
      
    } catch (error) {
      console.error('❌ Transcription polling failed:', error.message);
      throw error;
    }
  }

  /**
   * Analyze audio file and return speech analysis
   * @param {Buffer} audioBuffer - Audio file buffer
   * @returns {Promise<Object>} Speech analysis
   */
  async analyzeAudio(audioBuffer) {
    try {
      console.log('\n=== STARTING ASSEMBLYAI ANALYSIS ===');
      
      // Step 1: Upload audio
      const audioUrl = await this.uploadAudio(audioBuffer);
      
      // Step 2: Start transcription
      const transcriptId = await this.startTranscription(audioUrl);
      
      // Step 3: Poll for completion
      const transcriptionResult = await this.pollTranscription(transcriptId);
      
      // Step 4: Analyze the results
      const analysis = this.analyzeSpeechPatterns(transcriptionResult);
      
      console.log('=== ASSEMBLYAI ANALYSIS COMPLETE ===\n');
      return analysis;
      
    } catch (error) {
      console.error('❌ AssemblyAI analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Analyze speech patterns from transcription result
   * @param {Object} transcriptionResult - AssemblyAI transcription result
   * @returns {Object} Speech analysis
   */
  analyzeSpeechPatterns(transcriptionResult) {
    const text = transcriptionResult.text || '';
    const words = transcriptionResult.words || [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Calculate basic metrics
    const totalWords = words.length;
    const totalDuration = transcriptionResult.audio_duration || 1;
    const wordsPerMinute = Math.round((totalWords / totalDuration) * 60);
    
    // Analyze hesitation markers - MORE COMPREHENSIVE AND STRICT
    const hesitationWords = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually', 'sort of', 'kind of', 'I mean', 'well'];
    const hesitations = words.filter(word => {
      const cleanWord = word.text.toLowerCase().replace(/[^\w\s]/g, '');
      return hesitationWords.some(hw => cleanWord.includes(hw));
    });
    
    // Much stricter hesitation rate calculation
    const hesitationRate = totalWords > 0 ? (hesitations.length / totalWords) * 100 : 0;
    
    // Analyze pauses (using confidence and timing)
    let pauseAnalysis = this.analyzePauses(words);
    
    // Analyze confidence from word-level confidence scores - MUCH STRICTER
    const confidenceScores = words
      .filter(word => word.confidence !== undefined)
      .map(word => word.confidence);
    
    let averageConfidence = confidenceScores.length > 0 
      ? confidenceScores.reduce((sum, conf) => sum + conf, 0) / confidenceScores.length 
      : 0.3; // Lower default for no confidence data
    
    // Apply strict penalties for low confidence words
    const lowConfidenceWords = confidenceScores.filter(conf => conf < 0.8).length;
    const lowConfidenceRatio = confidenceScores.length > 0 ? lowConfidenceWords / confidenceScores.length : 0.5;
    
    // Severe penalty for many low confidence words
    if (lowConfidenceRatio > 0.3) {
      averageConfidence *= 0.7;
    } else if (lowConfidenceRatio > 0.2) {
      averageConfidence *= 0.85;
    }
    
    // Analyze tone using sentiment analysis
    const sentiments = transcriptionResult.sentiment_analysis_results || [];
    const toneAnalysis = this.analyzeTone(sentiments, text);
    
    return {
      transcription: {
        text: text,
        duration: totalDuration,
        wordCount: totalWords,
        wordsPerMinute: wordsPerMinute
      },
      metrics: {
        hesitationRate: Math.round(hesitationRate * 100) / 100,
        hesitationCount: hesitations.length,
        averageConfidence: Math.round(averageConfidence * 100),
        pauseQuality: pauseAnalysis.quality,
        toneScore: toneAnalysis.score
      },
      details: {
        hesitations: hesitations.map(h => h.text),
        pauses: pauseAnalysis.details,
        sentiment: toneAnalysis.details,
        wordTimings: words.slice(0, 10) // First 10 words for debugging
      }
    };
  }

  /**
   * Analyze pause patterns - MUCH STRICTER EVALUATION
   * @param {Array} words - Word-level transcription data
   * @returns {Object} Pause analysis
   */
  analyzePauses(words) {
    if (words.length < 2) {
      return { quality: 30, details: 'Insufficient data for pause analysis' };
    }

    const gaps = [];
    for (let i = 1; i < words.length; i++) {
      const prevEnd = words[i - 1].end;
      const currentStart = words[i].start;
      const gap = currentStart - prevEnd;
      if (gap > 50) { // Lower threshold for detecting pauses
        gaps.push(gap);
      }
    }

    const averageGap = gaps.length > 0 
      ? gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length 
      : 200;

    // Much stricter scoring based on natural pause patterns (200-400ms is ideal)
    let score = 60; // Start lower
    
    // Optimal range is tighter
    if (averageGap >= 200 && averageGap <= 400) {
      score = 85;
    } else if (averageGap >= 150 && averageGap <= 500) {
      score = 70;
    } else if (averageGap < 100) {
      score = 30; // Too rushed
    } else if (averageGap > 600) {
      score = 25; // Too hesitant
    } else {
      score = 45; // Suboptimal timing
    }
    
    // Additional penalties
    if (gaps.length === 0) score = 20; // No natural pauses is very bad
    if (gaps.length < words.length * 0.1) score *= 0.8; // Too few pauses
    
    // Penalty for inconsistent pauses
    if (gaps.length > 0) {
      const gapVariance = gaps.reduce((sum, gap) => sum + Math.pow(gap - averageGap, 2), 0) / gaps.length;
      if (gapVariance > 10000) score *= 0.9; // High variance is bad
    }

    return {
      quality: Math.max(10, Math.min(100, score)),
      details: `Average pause: ${Math.round(averageGap)}ms, Total pauses: ${gaps.length}, Variance: ${gaps.length > 0 ? Math.round(Math.sqrt(gaps.reduce((sum, gap) => sum + Math.pow(gap - averageGap, 2), 0) / gaps.length)) : 0}ms`
    };
  }

  /**
   * Analyze tone from sentiment data - MUCH STRICTER EVALUATION
   * @param {Array} sentiments - Sentiment analysis results
   * @param {string} text - Full transcription text
   * @returns {Object} Tone analysis
   */
  analyzeTone(sentiments, text) {
    if (!sentiments || sentiments.length === 0) {
      // Much stricter fallback analysis based on text patterns
      const confidenceKeywords = ['definitely', 'certainly', 'absolutely', 'clearly', 'confident', 'sure', 'exactly'];
      const uncertainKeywords = ['maybe', 'perhaps', 'I think', 'probably', 'possibly', 'not sure', 'I guess', 'kind of', 'sort of'];
      const weakWords = ['just', 'only', 'a little', 'somewhat', 'rather', 'quite'];
      
      const hasConfidentWords = confidenceKeywords.some(word => 
        text.toLowerCase().includes(word)
      );
      const hasUncertainWords = uncertainKeywords.some(word => 
        text.toLowerCase().includes(word)
      );
      const hasWeakWords = weakWords.some(word => 
        text.toLowerCase().includes(word)
      );
      
      let score = 50; // Start lower for stricter evaluation
      if (hasConfidentWords) score += 20;
      if (hasUncertainWords) score -= 25;
      if (hasWeakWords) score -= 15;
      
      // Additional penalty for short responses
      if (text.length < 100) score -= 20;
      
      return {
        score: Math.max(10, Math.min(100, score)),
        details: 'Analyzed based on word choice patterns - stricter evaluation'
      };
    }

    // Much stricter sentiment distribution analysis
    const positiveCount = sentiments.filter(s => s.sentiment === 'POSITIVE').length;
    const neutralCount = sentiments.filter(s => s.sentiment === 'NEUTRAL').length;
    const negativeCount = sentiments.filter(s => s.sentiment === 'NEGATIVE').length;
    
    const total = sentiments.length;
    const positiveRatio = total > 0 ? positiveCount / total : 0.3;
    const negativeRatio = total > 0 ? negativeCount / total : 0.3;
    const neutralRatio = total > 0 ? neutralCount / total : 0.4;
    
    // Much stricter tone score calculation
    let score = 30 + (positiveRatio * 35) - (negativeRatio * 30) - (neutralRatio * 10);
    
    // Additional penalties for poor sentiment patterns
    if (negativeRatio > 0.2) score -= 20;
    if (neutralRatio > 0.6) score -= 15; // Too much neutral can indicate lack of enthusiasm
    if (positiveRatio < 0.3) score -= 10;
    
    score = Math.max(10, Math.min(100, Math.round(score)));
    
    return {
      score: score,
      details: `Positive: ${positiveCount} (${Math.round(positiveRatio*100)}%), Neutral: ${neutralCount} (${Math.round(neutralRatio*100)}%), Negative: ${negativeCount} (${Math.round(negativeRatio*100)}%)`
    };
  }
}

module.exports = AssemblyAIService;
