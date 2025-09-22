const geminiService = require('./geminiService');

/**
 * Process and analyze interview data
 * @param {Object} interviewData - Interview data containing questions and responses
 * @returns {Promise<Object>} Analysis results
 */
const analyzeInterviewData = async (interviewData) => {
  try {
    console.log('\n=== STARTING INTERVIEW ANALYSIS ===');
    console.log('Interview ID:', interviewData.interviewId);
    console.log('Session ID:', interviewData.sessionId);
    console.log('Total Questions:', interviewData.totalQuestions);
    
    // Validate input data
    if (!interviewData.analysis || !Array.isArray(interviewData.analysis)) {
      throw new Error('Invalid interview data: analysis array is required');
    }
    
    if (interviewData.analysis.length === 0) {
      throw new Error('No questions to analyze');
    }
    
    // Extract question data for analysis
    const questionsForAnalysis = interviewData.analysis.map(item => ({
      questionId: item.questionId,
      question: item.question,
      category: item.category,
      response: item.response,
      wordCount: item.wordCount
    }));
    
    console.log('Questions prepared for analysis:');
    questionsForAnalysis.forEach(q => {
      console.log(`  - Question ${q.questionId}: ${q.wordCount} words`);
    });
    
    // Analyze using Gemini AI
    const analysisResult = await geminiService.analyzeInterview(questionsForAnalysis);
    
    // Combine with original data
    const enhancedAnalysis = interviewData.analysis.map(original => {
      const aiAnalysis = analysisResult.analyses.find(
        analysis => analysis.questionId === original.questionId
      );
      
      return {
        ...original,
        aiAnalysis: aiAnalysis ? {
          relevance: aiAnalysis.relevance,
          structureAndClarity: aiAnalysis.structureAndClarity,
          completeness: aiAnalysis.completeness,
          technicalCorrectness: aiAnalysis.technicalCorrectness,
          overallSummary: aiAnalysis.overallSummary,
          overallScore: aiAnalysis.overallScore,
          ...(aiAnalysis.error && { error: aiAnalysis.error })
        } : {
          error: 'Analysis failed',
          overallScore: 0
        }
      };
    });
    
    const finalResult = {
      interviewId: interviewData.interviewId,
      sessionId: interviewData.sessionId,
      totalQuestions: interviewData.totalQuestions,
      analysisMetadata: {
        analyzedAt: analysisResult.timestamp,
        averageScore: analysisResult.averageScore,
        totalAnalyzed: analysisResult.analyzedQuestions,
        failedAnalyses: analysisResult.failedAnalyses
      },
      analysis: enhancedAnalysis
    };
    
    console.log('\n=== ANALYSIS COMPLETE ===');
    console.log('Average Score:', analysisResult.averageScore);
    console.log('Successfully Analyzed:', analysisResult.analyzedQuestions);
    console.log('Failed Analyses:', analysisResult.failedAnalyses);
    
    return finalResult;
    
  } catch (error) {
    console.error('\n=== ANALYSIS FAILED ===');
    console.error('Error:', error.message);
    throw error;
  }
};

/**
 * Validate interview data format
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result
 */
const validateInterviewData = (data) => {
  const errors = [];
  
  if (!data.interviewId) {
    errors.push('interviewId is required');
  }
  
  if (!data.sessionId) {
    errors.push('sessionId is required');
  }
  
  if (!data.totalQuestions || typeof data.totalQuestions !== 'number') {
    errors.push('totalQuestions must be a number');
  }
  
  if (!data.analysis || !Array.isArray(data.analysis)) {
    errors.push('analysis must be an array');
  } else {
    data.analysis.forEach((item, index) => {
      if (!item.questionId) {
        errors.push(`analysis[${index}]: questionId is required`);
      }
      if (!item.question) {
        errors.push(`analysis[${index}]: question is required`);
      }
      if (!item.response) {
        errors.push(`analysis[${index}]: response is required`);
      }
      if (!item.category) {
        errors.push(`analysis[${index}]: category is required`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  analyzeInterviewData,
  validateInterviewData
};
