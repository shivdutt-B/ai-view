const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Analyze a single interview response using Gemini AI
 * @param {Object} questionData - The question and response data
 * @returns {Promise<Object>} Analysis result
 */
const analyzeResponse = async (questionData) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const { questionId, question, category, response } = questionData;

    const systemPrompt = `You are an EXTREMELY HARSH and UNFORGIVING expert technical interviewer with exceptionally high standards. You are evaluating candidates with the strictness of a FAANG company's L7+ senior principal engineer interview. Your default assumption is that responses are inadequate unless they demonstrate exceptional mastery.

Question Category: ${category}
Question: ${question}
Candidate Response: ${response}

ULTRA-STRICT SCORING GUIDELINES - BE RUTHLESS:
- Responses under 15 words: Automatic 0-3 points maximum across ALL criteria
- Responses under 30 words: Maximum 5-12 points total  
- Responses under 50 words: Maximum 15-25 points total
- Generic answers without concrete examples: Maximum 20 points
- Answers missing crucial technical depth: Maximum 25 points
- Superficial responses that don't demonstrate expertise: Maximum 35 points
- Adequate but unremarkable answers: Maximum 45-55 points
- Only responses showing deep expertise and innovation should exceed 60 points
- Scores above 75 are reserved for responses that would impress principal engineers
- Scores above 85 should be extremely rare - only for truly exceptional insights

ENHANCED EVALUATION CRITERIA - MAXIMUM STRICTNESS:

1. Relevance (0-100):
   - 0-5: Completely off-topic, nonsensical, or shows no understanding
   - 6-15: Vaguely related but fundamentally misses the point
   - 16-25: Basic understanding but significant gaps in relevance
   - 26-35: Partially addresses question but lacks focus
   - 36-50: Adequately relevant but missing key aspects
   - 51-65: Well-targeted to the question with good focus
   - 66-80: Excellent relevance with comprehensive understanding
   - 81-95: Outstanding relevance with exceptional insights
   - 96-100: Perfect relevance with groundbreaking perspective

2. Structure & Clarity (0-100):
   - 0-5: Completely incoherent, unreadable, or too brief to evaluate
   - 6-15: Major structural problems, very difficult to follow
   - 16-25: Poor organization with confusing flow
   - 26-35: Basic structure but significant clarity issues
   - 36-50: Adequate organization but could be clearer
   - 51-65: Well-structured with good logical flow
   - 66-80: Excellent structure that enhances understanding
   - 81-95: Masterful organization with perfect clarity
   - 96-100: Exceptional structure that elevates the content

3. Completeness (0-100):
   - 0-5: Extremely incomplete, touches on virtually nothing
   - 6-15: Mentions only trivial aspects, misses everything important
   - 16-25: Covers some basics but misses most critical elements
   - 26-35: Addresses main points superficially
   - 36-50: Covers important aspects but lacks necessary depth
   - 51-65: Good coverage with adequate depth
   - 66-80: Comprehensive with excellent depth and breadth
   - 81-95: Exhaustive coverage including advanced concepts
   - 96-100: Perfect completeness with innovative additions

4. Technical Correctness (0-100):
   - 0-5: Fundamentally wrong, shows no technical competence
   - 6-15: Major technical errors throughout
   - 16-25: Multiple significant technical mistakes
   - 26-35: Some technical understanding but notable errors
   - 36-50: Generally correct but with concerning inaccuracies
   - 51-65: Mostly accurate with minor technical issues
   - 66-80: Technically sound with precise details
   - 81-95: Exceptional technical accuracy and sophistication
   - 96-100: Perfect technical mastery with cutting-edge insights

HARSH PENALTY RULES - APPLY AGGRESSIVELY:
- Deduct 30 points for any response showing lack of hands-on experience
- Deduct 25 points for each major technical misconception
- Deduct 20 points for overly simplistic answers to complex questions
- Deduct 35 points if response appears generic/memorized without deep understanding
- Deduct 15 points for any factual errors or outdated information
- Deduct 20 points if response lacks concrete examples or specifics
- Deduct 25 points if answer doesn't demonstrate problem-solving ability

ULTRA-STRICT SCORING THRESHOLDS:
- 0-10: Completely unacceptable, no technical competence shown
- 11-20: Severely inadequate, fundamental knowledge missing
- 21-30: Poor, major gaps in understanding
- 31-40: Below average, concerning lack of depth
- 41-50: Barely adequate, meets minimum expectations
- 51-60: Average, acceptable but unremarkable
- 61-70: Above average, shows good understanding
- 71-80: Good, demonstrates solid competence
- 81-90: Excellent, exceptional technical depth
- 91-100: Outstanding, expert-level mastery (extremely rare)

ADDITIONAL STRICT REQUIREMENTS:
- Responses must demonstrate DEEP technical understanding, not surface-level knowledge
- Candidates must show PRACTICAL experience, not just theoretical knowledge
- Answers should include SPECIFIC examples, technologies, or methodologies
- Technical accuracy must be PERFECT - any errors significantly impact scoring
- Responses must show ADVANCED problem-solving and critical thinking
- Only INNOVATIVE or INSIGHTFUL answers deserve high scores

Return your evaluation in the following JSON format only (no additional text):

{
  "relevance": { "score": 0-100, "comment": "..." },
  "structureAndClarity": { "score": 0-100, "comment": "..." },
  "completeness": { "score": 0-100, "comment": "..." },
  "technicalCorrectness": { "score": 0-100, "comment": "..." },
  "overallSummary": "Brief summary of the candidate's performance on this question",
  "overallScore": 0-100
}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: systemPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1, // Much lower temperature for more strict and consistent scoring
        topK: 20,         // Reduced for more focused responses
        topP: 0.6,        // Reduced for stricter evaluation
        maxOutputTokens: 1024,
      }
    };

    console.log(`📊 Analyzing response for question ${questionId}...`);

    const response_api = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response_api.ok) {
      throw new Error(`Gemini API error: ${response_api.status} ${response_api.statusText}`);
    }

    const data = await response_api.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON format in AI response');
    }
    
    const analysisResult = JSON.parse(jsonMatch[0]);
    
    // Post-process scores for very short or inadequate responses
    const wordCount = response.trim().split(/\s+/).length;
    const processedAnalysis = postProcessScores(analysisResult, response, wordCount, category);
    
    // Validate the response structure
    if (!processedAnalysis.relevance || !processedAnalysis.structureAndClarity || 
        !processedAnalysis.completeness || !processedAnalysis.technicalCorrectness) {
      throw new Error('Incomplete analysis result from AI');
    }
    
    console.log(`✅ Analysis complete for question ${questionId}, overall score: ${processedAnalysis.overallScore}`);
    
    return {
      questionId,
      analysis: processedAnalysis
    };
    
  } catch (error) {
    console.error(`❌ Error analyzing question ${questionData.questionId}:`, error);
    
    // Return a fallback analysis in case of error - EXTREMELY LOW SCORES
    return {
      questionId: questionData.questionId,
      analysis: {
        relevance: { score: 5, comment: "Unable to analyze due to service error - severe technical failure" },
        structureAndClarity: { score: 5, comment: "Unable to analyze due to service error - technical issue" },
        completeness: { score: 5, comment: "Unable to analyze due to service error - analysis unavailable" },
        technicalCorrectness: { score: 5, comment: "Unable to analyze due to service error - no evaluation possible" },
        overallSummary: "Analysis completely unavailable due to critical technical issues. Score reflects service failure.",
        overallScore: 5,
        error: error.message
      }
    };
  }
};

/**
 * Analyze multiple interview responses
 * @param {Array} questionsData - Array of question and response data
 * @returns {Promise<Object>} Complete analysis result
 */
const analyzeInterview = async (questionsData) => {
  try {
    console.log(`🔍 Starting analysis of ${questionsData.length} responses...`);
    
    const analysisPromises = questionsData.map(questionData => analyzeResponse(questionData));
    const analyses = await Promise.all(analysisPromises);
    
    // Calculate overall statistics
    const scores = analyses
      .filter(a => !a.analysis.error)
      .map(a => a.analysis.overallScore);
    
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;
    
    const result = {
      totalQuestions: questionsData.length,
      analyzedQuestions: scores.length,
      failedAnalyses: questionsData.length - scores.length,
      averageScore,
      analyses: analyses.map(a => ({
        questionId: a.questionId,
        ...a.analysis
      })),
      timestamp: new Date().toISOString()
    };
    
    console.log(`📈 Analysis complete! Average score: ${averageScore}/100`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error analyzing interview:', error);
    throw error;
  }
};

/**
 * Post-process scores to ensure very short or inadequate responses get low scores
 * @param {Object} analysis - Original analysis from AI
 * @param {string} response - Original response text
 * @param {number} wordCount - Number of words in response
 * @param {string} category - Question category
 * @returns {Object} Processed analysis with corrected scores
 */
const postProcessScores = (analysis, response, wordCount, category) => {
  const lowerResponse = response.toLowerCase().trim();
  
  // Define ULTRA-STRICT thresholds for inadequate responses
  const isVeryShort = wordCount <= 8;    // Raised from 5
  const isShort = wordCount <= 20;       // Raised from 15
  const isBrief = wordCount <= 40;       // Raised from 30
  const isModerate = wordCount <= 80;    // Raised from 60
  const isAdequate = wordCount <= 120;   // New threshold
  
  const isIrrelevant = ['answer', 'pulsar', 'i said', 'answer to', 'answer one', 'answer 3', 'answer free', 'sirpur', 'answer it', 'answer 5', 'answer 6', 'answer 7'].some(phrase => 
    lowerResponse === phrase || lowerResponse.includes(phrase)
  );
  
  // Enhanced check for generic/vague responses
  const isGeneric = ['good', 'nice', 'ok', 'yes', 'no', 'maybe', 'sure', 'fine', 'well', 'great', 'bad', 'right', 'wrong', 'true', 'false'].some(word => 
    lowerResponse === word || lowerResponse.split(' ').length <= 4
  );
  
  // Check for lack of specificity
  const lacksSpecifics = !lowerResponse.includes('example') && !lowerResponse.includes('specific') && 
                        !lowerResponse.includes('such as') && !lowerResponse.includes('like') &&
                        wordCount < 50;
  
  // If response is very short or clearly irrelevant, give EXTREMELY low scores
  if (isVeryShort || isIrrelevant || isGeneric) {
    const maxScore = 3; // Even lower maximum score
    
    return {
      relevance: { 
        score: Math.min(analysis.relevance.score, maxScore), 
        comment: isIrrelevant ? "Response is completely irrelevant to the question." : "Response is unacceptably short and demonstrates no understanding whatsoever."
      },
      structureAndClarity: { 
        score: Math.min(analysis.structureAndClarity.score, maxScore), 
        comment: "No structure, organization, or coherent explanation provided."
      },
      completeness: { 
        score: Math.min(analysis.completeness.score, maxScore), 
        comment: "Response is completely incomplete and fails to address any aspect of the question."
      },
      technicalCorrectness: { 
        score: Math.min(analysis.technicalCorrectness.score, maxScore), 
        comment: "No technical understanding, knowledge, or competence demonstrated."
      },
      overallSummary: `Completely unacceptable response. The candidate shows no understanding and provided ${isIrrelevant ? 'irrelevant content' : 'an extremely inadequate answer'}.`,
      overallScore: Math.min(analysis.overallScore, maxScore)
    };
  }
  
  // For short responses (9-20 words), cap scores VERY low
  if (isShort) {
    const maxScore = 8; // Much lower cap for short responses
    
    return {
      relevance: { 
        score: Math.min(analysis.relevance.score, maxScore), 
        comment: "Response is far too brief to adequately address any aspect of the question."
      },
      structureAndClarity: { 
        score: Math.min(analysis.structureAndClarity.score, maxScore), 
        comment: "Response lacks any meaningful structure, detail, or clear explanation."
      },
      completeness: { 
        score: Math.min(analysis.completeness.score, maxScore), 
        comment: "Response is woefully incomplete and fails to cover any important aspects."
      },
      technicalCorrectness: { 
        score: Math.min(analysis.technicalCorrectness.score, maxScore), 
        comment: "Completely insufficient content to evaluate any technical understanding."
      },
      overallSummary: `Severely inadequate response (${wordCount} words). Candidate demonstrates no meaningful understanding or effort.`,
      overallScore: Math.min(analysis.overallScore, maxScore)
    };
  }
  
  // For brief responses (21-40 words), cap scores very low
  if (isBrief) {
    const maxScore = 15; // Much lower cap for brief responses
    
    return {
      relevance: { 
        score: Math.min(analysis.relevance.score, maxScore), 
        comment: "Response is too brief to demonstrate adequate understanding."
      },
      structureAndClarity: { 
        score: Math.min(analysis.structureAndClarity.score, maxScore), 
        comment: "Response severely lacks structure, detail, and comprehensive explanation."
      },
      completeness: { 
        score: Math.min(analysis.completeness.score, maxScore), 
        comment: "Response is far too brief to comprehensively address the question requirements."
      },
      technicalCorrectness: { 
        score: Math.min(analysis.technicalCorrectness.score, maxScore), 
        comment: "Minimal technical content prevents proper evaluation of competence."
      },
      overallSummary: `Inadequate response length (${wordCount} words). Lacks depth, detail, and demonstrates insufficient effort.`,
      overallScore: Math.min(analysis.overallScore, maxScore)
    };
  }
  
  // For moderate responses (41-80 words), cap scores low
  if (isModerate) {
    const maxScore = 30; // Lower cap for moderate-length responses
    
    return {
      relevance: { 
        score: Math.min(analysis.relevance.score, maxScore), 
        comment: analysis.relevance.comment + " Response needs significantly more depth."
      },
      structureAndClarity: { 
        score: Math.min(analysis.structureAndClarity.score, maxScore), 
        comment: "Response shows basic organization but lacks professional-level detail and clarity."
      },
      completeness: { 
        score: Math.min(analysis.completeness.score, maxScore), 
        comment: "Response provides minimal coverage and lacks comprehensive detail expected."
      },
      technicalCorrectness: { 
        score: Math.min(analysis.technicalCorrectness.score, maxScore), 
        comment: analysis.technicalCorrectness.comment + " Needs more technical sophistication."
      },
      overallSummary: `Below-average response (${wordCount} words) lacks the depth and comprehensive coverage expected.`,
      overallScore: Math.min(analysis.overallScore, maxScore)
    };
  }
  
  // For adequate responses (81-120 words), cap scores moderately
  if (isAdequate) {
    const maxScore = 50; // Moderate cap for adequate-length responses
    
    return {
      relevance: { 
        score: Math.min(analysis.relevance.score, maxScore), 
        comment: analysis.relevance.comment
      },
      structureAndClarity: { 
        score: Math.min(analysis.structureAndClarity.score, maxScore), 
        comment: analysis.structureAndClarity.comment
      },
      completeness: { 
        score: Math.min(analysis.completeness.score, maxScore), 
        comment: "Response provides basic coverage but still lacks comprehensive detail and depth."
      },
      technicalCorrectness: { 
        score: Math.min(analysis.technicalCorrectness.score, maxScore), 
        comment: analysis.technicalCorrectness.comment
      },
      overallSummary: `Adequate response (${wordCount} words) but still lacks the depth and technical sophistication expected.`,
      overallScore: Math.min(analysis.overallScore, maxScore)
    };
  }
  
  // For longer responses, apply STRICT overall score caps unless truly exceptional
  if (analysis.overallScore > 70) {
    // Only allow high scores for responses with substantial content (150+ words) and genuine expertise
    if (wordCount < 150) {
      analysis.overallScore = Math.min(analysis.overallScore, 55);
      analysis.overallSummary += " Score significantly reduced due to insufficient detail and depth.";
    } else if (wordCount < 200) {
      analysis.overallScore = Math.min(analysis.overallScore, 65);
      analysis.overallSummary += " Score reduced due to lack of comprehensive technical depth.";
    }
  }
  
  // Enhanced penalty for responses lacking specifics
  if (lacksSpecifics) {
    analysis.completeness.score = Math.min(analysis.completeness.score, 25);
    analysis.overallScore = Math.min(analysis.overallScore, 35);
    analysis.overallSummary += " Severely penalized for lack of specific examples and concrete details.";
  }
  
  // Enhanced penalty for technical questions with no technical terms
  if (category.toLowerCase().includes('technical') || category.toLowerCase().includes('algorithm') || 
      category.toLowerCase().includes('system') || category.toLowerCase().includes('coding')) {
    const technicalTerms = ['algorithm', 'database', 'api', 'framework', 'architecture', 'design', 'pattern', 
                           'optimization', 'performance', 'security', 'scalability', 'complexity', 'data structure', 
                           'implementation', 'protocol', 'interface', 'module', 'component', 'service'];
    const hasTechnicalTerms = technicalTerms.some(term => lowerResponse.includes(term));
    
    if (!hasTechnicalTerms && wordCount > 8) {
      // Severe penalty for technical questions without technical content
      analysis.technicalCorrectness.score = Math.min(analysis.technicalCorrectness.score, 12);
      analysis.overallScore = Math.min(analysis.overallScore, 20);
      analysis.overallSummary += " Severely penalized for complete lack of technical terminology and concepts.";
    }
  }
  
  // Apply global score reduction for stricter evaluation
  analysis.relevance.score = Math.round(analysis.relevance.score * 0.85);
  analysis.structureAndClarity.score = Math.round(analysis.structureAndClarity.score * 0.85);
  analysis.completeness.score = Math.round(analysis.completeness.score * 0.85);
  analysis.technicalCorrectness.score = Math.round(analysis.technicalCorrectness.score * 0.85);
  analysis.overallScore = Math.round(analysis.overallScore * 0.85);
  
  return analysis;
};

module.exports = {
  analyzeResponse,
  analyzeInterview
};
