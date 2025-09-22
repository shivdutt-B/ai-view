const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const heimdall = require('heimdall-nodejs-sdk');

const audioRoutes = require('./routes/audioRoutes');

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true
};

// Add Heimdall ping endpoint
heimdall.ping(app);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for audio files
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Make upload middleware available to routes
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// Routes
app.use('/api/audio', audioRoutes);

// Enhanced health check endpoint with detailed service status
app.get('/health', (req, res) => {
  try {
    const assemblyAIConfigured = !!process.env.ASSEMBLYAI_API_KEY;
    const memoryUsage = process.memoryUsage();
    
    const healthData = { 
      status: 'OK', 
      service: 'Audio Analysis Service - STRICT EVALUATION MODE',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      configuration: {
        assemblyAIConfigured,
        port: process.env.AUDIO_ANALYSIS_PORT || 4003,
        environment: process.env.NODE_ENV || 'development',
        evaluationMode: 'EXTREMELY_STRICT'
      },
      capabilities: [
        'audio_transcription',
        'strict_sentiment_analysis',
        'enhanced_hesitation_detection',
        'strict_pause_analysis',
        'rigorous_communication_scoring',
        'strict_tone_analysis'
      ],
      strictness_features: [
        'reduced_confidence_thresholds',
        'enhanced_hesitation_penalties',
        'stricter_tone_evaluation',
        'comprehensive_pause_analysis',
        '25%_score_reduction_applied'
      ],
      performance: {
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB'
        },
        uptime_formatted: `${Math.floor(process.uptime() / 60)}m ${Math.floor(process.uptime() % 60)}s`
      }
    };
    
    res.json(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      service: 'Audio Analysis Service',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Enhanced error handling middleware with detailed logging
app.use((err, req, res, next) => {
  console.error('❌ Audio Analysis Service Error:', err.stack);
  console.error(`❌ Request details: ${req.method} ${req.path}`);
  console.error(`❌ Error time: ${new Date().toISOString()}`);
  
  // Return extremely low fallback scores for any service errors
  const fallbackResponse = {
    error: 'Audio analysis service error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    service: 'Audio Analysis Service',
    timestamp: new Date().toISOString(),
    fallback_analysis: {
      communication_analysis: {
        overall_score: 5, // Extremely low score for service errors
        tone: { score: 5, assessment: 'service error - analysis unavailable' },
        confidence: { score: 5, assessment: 'service error - analysis unavailable' },
        summary: 'Service error prevented proper analysis. Extremely low score reflects technical failure.'
      }
    }
  };
  
  res.status(500).json(fallbackResponse);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.AUDIO_ANALYSIS_PORT || 4003;

app.listen(PORT, () => {
  console.log(`🎵 Audio Analysis Service running on port ${PORT}`);
});

module.exports = { app };
