const analysisService = require('../services/analysisService');

/**
 * Analyze interview responses
 * POST /api/analysis/interview
 */
const analyzeInterview = async (req, res) => {
  try {
    console.log('\n=== RECEIVED ANALYSIS REQUEST ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Content-Type:', req.headers['content-type']);
    
    // Validate request data
    const validation = analysisService.validateInterviewData(req.body);
    
    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.errors);
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.errors
      });
    }
    
    console.log('✅ Request validation passed');
    console.log('Interview ID:', req.body.interviewId);
    console.log('Total questions:', req.body.totalQuestions);
    
    // Perform analysis
    const analysisResult = await analysisService.analyzeInterviewData(req.body);
    
    console.log('📊 Analysis completed successfully');
    console.log('Response keys:', Object.keys(analysisResult));
    
    res.json({
      success: true,
      ...analysisResult
    });
    
  } catch (error) {
    console.error('\n❌ ANALYSIS ERROR:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

/**
 * Health check for analysis service
 * GET /api/analysis/health
 */
const healthCheck = async (req, res) => {
  try {
    const geminiConfigured = !!process.env.GEMINI_API_KEY;
    
    res.json({
      status: 'OK',
      service: 'Text Analysis Service',
      timestamp: new Date().toISOString(),
      configuration: {
        geminiConfigured,
        port: process.env.TEXT_ANALYSIS_PORT || 4002,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
};

module.exports = {
  analyzeInterview,
  healthCheck
};
