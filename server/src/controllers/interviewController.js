// const aiService = require('../services/aiService');
// const asrService = require('../services/asrService');
const AWS = require('aws-sdk');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION
});

const BUCKET_NAME = process.env.S3_BUCKET;

// Submit complete interview with all Q&A
const submitCompleteInterview = async (req, res) => {
  try {
    const { role, sessionId, interviewId, questionAnswers } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    // Parse questionAnswers from JSON
    let parsedQuestionAnswers;
    try {
      parsedQuestionAnswers = JSON.parse(questionAnswers || '[]');
    } catch (error) {
      console.error('Failed to parse questionAnswers:', error);
      return res.status(400).json({ error: 'Invalid questionAnswers format' });
    }

    if (!Array.isArray(parsedQuestionAnswers)) {
      return res.status(400).json({ error: 'Question answers must be an array' });
    }
    
    // Process files and match them to questions
    const filesMap = new Map();
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Extract question ID from field name (audio_1, audio_2, etc.)
        const match = file.fieldname.match(/^audio_(\d+)$/);
        if (match) {
          const questionId = parseInt(match[1]);
          filesMap.set(questionId, file);
        }
      });
    }
    
    // Upload audio files to S3 and attach URLs to answers
    const processedAnswers = [];
    
    for (const qa of parsedQuestionAnswers) {
      const processedAnswer = { ...qa };
      
      // Check if there's an audio file for this question
      const audioFile = filesMap.get(qa.questionId);
      if (audioFile) {
        try {
          // Construct S3 key
          const fileName = `question_${qa.questionId}.wav`;
          const key = `interviews/${interviewId || 'unknown'}/${fileName}`;
          
          // Upload to S3
          const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: audioFile.buffer,
            ContentType: audioFile.mimetype || 'audio/wav',
            ContentLength: audioFile.size,
          };
          
          const uploadResult = await s3.upload(uploadParams).promise();
          processedAnswer.audioUrl = uploadResult.Location;
        } catch (error) {
          console.error('  Failed to upload audio:', error);
          // Continue without audio URL
        }
      } 
      
      processedAnswers.push(processedAnswer);
    }

    // Generate a session ID if not provided
    const finalSessionId = sessionId || `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log summary of processing
    console.log('Final Session ID:', finalSessionId);
    console.log('Interview ID:', interviewId);
    console.log('Role:', role);
    console.log('Total questions processed:', processedAnswers.length);
    console.log('Questions with audio URLs:', processedAnswers.filter(qa => qa.audioUrl).length);
    console.log('Questions with text only:', processedAnswers.filter(qa => !qa.audioUrl).length);
    
    // Log all audio URLs
    const audioQuestions = processedAnswers.filter(qa => qa.audioUrl);
    if (audioQuestions.length > 0) {
      console.log('\n--- Audio URLs ---');
      audioQuestions.forEach(qa => {
        console.log(`Question ${qa.questionId}: ${qa.audioUrl}`);
      });
    }
    
    // Perform both text and audio analysis
    let textAnalysisResult = null;
    let speechAnalysisResult = null;
    try {
      console.log('\n--- Checking Text Analysis Service Health ---');
      
      // Check if text analysis service is available
      try {
        const healthResponse = await fetch(`${process.env.TEXT_SERVER_BASE_URL}/api/analysis/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          console.log('✅ Text analysis service is available');
          console.log('Service status:', healthData.status);
        } else {
          console.error('⚠️ Text analysis service health check failed:', healthResponse.status);
        }
      } catch (healthError) {
        console.error('❌ Text analysis service is not reachable:', healthError.message);
      }
      
      console.log('\n--- Sending to Text Analysis Service ---');
      
      const textAnalysisData = {
        interviewId: interviewId,
        sessionId: finalSessionId,
        totalQuestions: processedAnswers.length,
        analysis: processedAnswers.map(qa => ({
          questionId: qa.questionId,
          question: qa.question,
          category: qa.category,
          response: qa.textResponse,
          wordCount: qa.textResponse.split(' ').length
        }))
      };
      
      // Add timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const textAnalysisResponse = await fetch(`${process.env.TEXT_SERVER_BASE_URL}/api/analysis/interview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(textAnalysisData),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (textAnalysisResponse.ok) {
          textAnalysisResult = await textAnalysisResponse.json();
          console.log('✅ Text analysis service response received');
          console.log('Response keys:', Object.keys(textAnalysisResult));
        } else {
          const errorText = await textAnalysisResponse.text();
          console.error('❌ Text analysis service failed with status:', textAnalysisResponse.status);
          console.error('❌ Error response:', errorText);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error('❌ Text analysis service connection error:', fetchError.message);
        if (fetchError.name === 'AbortError') {
          console.error('❌ Text analysis request timed out after 30 seconds');
        }
      }
      
      // Send audio files to audio analysis service
      console.log('\n--- Sending to Audio Analysis Service ---');
      
      const audioAnalysisResults = [];
      for (const qa of processedAnswers) {
        if (qa.audioUrl) {
          try {
            console.log(`Analyzing audio for question ${qa.questionId}...`);
            
            const audioAnalysisData = {
              audioUrl: qa.audioUrl,
              question: qa.question,
              questionId: qa.questionId,
              metadata: {
                category: qa.category,
                interviewId: interviewId,
                sessionId: finalSessionId
              }
            };
            
            const audioResponse = await fetch(`${process.env.AUDIO_SERVER_BASE_URL}/api/audio/analyze-url`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(audioAnalysisData)
            });
            
            if (audioResponse.ok) {
              const audioResult = await audioResponse.json();
              audioAnalysisResults.push({
                questionId: qa.questionId,
                ...audioResult.data
              });
              console.log(`✅ Audio analysis completed for question ${qa.questionId}`);
            } else {
              const errorText = await audioResponse.text();
              console.error(`❌ Audio analysis failed for question ${qa.questionId}:`, errorText);
              audioAnalysisResults.push({
                questionId: qa.questionId,
                error: `Audio analysis failed: ${errorText}`
              });
            }
          } catch (audioError) {
            console.error(`❌ Error analyzing audio for question ${qa.questionId}:`, audioError.message);
            audioAnalysisResults.push({
              questionId: qa.questionId,
              error: `Audio analysis error: ${audioError.message}`
            });
          }
        }
      }
      
      // Structure speech analysis result
      if (audioAnalysisResults.length > 0) {
        speechAnalysisResult = {
          success: true,
          interviewId: interviewId,
          sessionId: finalSessionId,
          totalAudioQuestions: audioAnalysisResults.length,
          analysisMetadata: {
            analyzedAt: new Date().toISOString(),
            successfulAnalyses: audioAnalysisResults.filter(r => !r.error).length,
            failedAnalyses: audioAnalysisResults.filter(r => r.error).length
          },
          analysis: audioAnalysisResults
        };
        console.log('✅ Speech analysis completed');
      }
      
    } catch (analysisError) {
      console.error('❌ Error calling analysis services:', analysisError.message);
    }
    
    const response = {
      success: true,
      sessionId: finalSessionId,
      interviewId: interviewId,
      questionsProcessed: processedAnswers.length,
      audioUrlsReceived: audioQuestions.length,
      message: 'Interview submitted successfully',
      questionAnswers: processedAnswers, // Include processed answers with S3 URLs
      analysis: {
        text_analysis: textAnalysisResult, // Text analysis results
        speech_analysis: speechAnalysisResult // Audio/speech analysis results
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('\n=== ERROR SUBMITTING INTERVIEW ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to submit interview',
      message: error.message 
    });
  }
};

module.exports = {
  // generateQuestions,
  submitCompleteInterview,
};
