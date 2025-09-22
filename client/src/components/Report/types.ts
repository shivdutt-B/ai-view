export interface TextAnalysisResult {
  score: number;
  comment: string;
}

export interface AIAnalysis {
  relevance: TextAnalysisResult;
  structureAndClarity: TextAnalysisResult;
  completeness: TextAnalysisResult;
  technicalCorrectness: TextAnalysisResult;
  overallSummary: string;
  overallScore: number;
}

export interface QuestionAnalysis {
  questionId: number;
  question: string;
  category: string;
  response: string;
  wordCount: number;
  aiAnalysis: AIAnalysis;
}

export interface TextAnalysis {
  success: boolean;
  interviewId: string;
  sessionId: string;
  totalQuestions: number;
  analysisMetadata: {
    analyzedAt: string;
    averageScore: number;
    totalAnalyzed: number;
    failedAnalyses: number;
  };
  analysis: QuestionAnalysis[];
}

export interface CommunicationAnalysis {
  tone: {
    score: number;
    assessment: string;
    details: string;
  };
  confidence: {
    score: number;
    assessment: string;
  };
  hesitation: {
    level: string;
    count: number;
    rate: number;
    details: string[];
  };
  pauses: {
    quality: number;
    assessment: string;
    details: string;
  };
  overall_score: number;
  summary: string;
}

export interface SpeechAnalysisResult {
  questionId: number;
  transcription?: {
    text: string;
    duration: number;
    word_count: number;
    words_per_minute: number;
  };
  communication_analysis?: CommunicationAnalysis;
  metadata?: any;
  error?: string;
}

export interface SpeechAnalysis {
  success: boolean;
  interviewId: string;
  sessionId: string;
  totalAudioQuestions: number;
  analysisMetadata: {
    analyzedAt: string;
    successfulAnalyses: number;
    failedAnalyses: number;
  };
  analysis: SpeechAnalysisResult[];
}

export interface InterviewResponse {
  success: boolean;
  sessionId: string;
  interviewId: string;
  questionsProcessed: number;
  audioUrlsReceived: number;
  message: string;
  questionAnswers: Array<{
    questionId: number;
    question: string;
    category: string;
    textResponse: string;
    timestamp: string;
    audioUrl?: string;
  }>;
  analysis: {
    text_analysis: TextAnalysis;
    speech_analysis: SpeechAnalysis;
  };
}

export interface ReportData {
  technicalKnowledge: number;
  communicationSkills: number;
  attitude: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  role: string;
  overallScore: number;
  // New fields for detailed analysis
  interviewResponse?: InterviewResponse;
  textAnalysisScore?: number;
  speechAnalysisScore?: number;
}
