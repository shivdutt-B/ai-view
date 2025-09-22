import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { generateInterviewQuestions } from '../services/aiService';
import { InterviewResponse } from '../../components/Report/types';

export interface Question {
  id: number;
  text: string;
  category: string;
}

export interface Message {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string; // Changed from Date to string for Redux serialization
  isTyping?: boolean;
}

export interface QuestionAnswer {
  questionId: number;
  question: string;
  category: string;
  textResponse: string;
  hasAudio: boolean; // Flag to indicate if audio was recorded
  timestamp: string; // Changed from Date to string for Redux serialization
}

interface InterviewState {
  questions: Question[];
  currentQuestionIndex: number;
  messages: Message[];
  questionAnswers: QuestionAnswer[];
  isLoading: boolean;
  isSubmitting: boolean; // Add loading state for interview submission
  interviewCompleted: boolean;
  error: string | null;
  role: string;
  jobDescription?: string;
  sessionId?: string;
  interviewId?: string; // Unique ID for this interview session
  interviewResults?: InterviewResponse; // Store the complete interview results
}

const initialState: InterviewState = {
  questions: [],
  currentQuestionIndex: 0,
  messages: [],
  questionAnswers: [],
  isLoading: false,
  isSubmitting: false,
  interviewCompleted: false,
  error: null,
  role: '',
  jobDescription: undefined,
  sessionId: undefined,
  interviewId: undefined,
  interviewResults: undefined
};

// Async thunk for generating interview questions
export const generateQuestions = createAsyncThunk(
  'interview/generateQuestions',
  async ({ role, jobDescription }: { role: string; jobDescription?: string }, { rejectWithValue }) => {
    try {
      const questions = await generateInterviewQuestions(role, jobDescription);
      return questions;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setRole: (state, action: PayloadAction<string>) => {
      state.role = action.payload;
    },
    setJobDescription: (state, action: PayloadAction<string>) => {
      state.jobDescription = action.payload;
    },
    setCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addQuestionAnswer: (state, action: PayloadAction<QuestionAnswer>) => {
      state.questionAnswers.push(action.payload);
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    setInterviewId: (state, action: PayloadAction<string>) => {
      state.interviewId = action.payload;
    },
    completeInterview: (state) => {
      state.interviewCompleted = true;
    },
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    setInterviewResults: (state, action: PayloadAction<InterviewResponse>) => {
      state.interviewResults = action.payload;
    },
    resetInterview: () => {
      return initialState;
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
      } else {
        state.interviewCompleted = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateQuestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.questions = action.payload;
        state.currentQuestionIndex = 0;
        // Add initial AI greeting without the first question
        const greeting: Message = {
          id: 0,
          sender: 'ai',
          text: `Hello! I'm your AI interviewer. I'll be asking you ${action.payload.length} questions about ${state.role} development. Please take your time to answer each question thoughtfully. Good luck!`,
          timestamp: new Date().toISOString() // Convert to ISO string
        };
        state.messages = [greeting];
      })
      .addCase(generateQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setRole,
  setJobDescription,
  setCurrentQuestionIndex,
  addMessage,
  setMessages,
  addQuestionAnswer,
  setSessionId,
  setInterviewId,
  completeInterview,
  setSubmitting,
  setInterviewResults,
  resetInterview,
  nextQuestion,
} = interviewSlice.actions;

export default interviewSlice.reducer;
