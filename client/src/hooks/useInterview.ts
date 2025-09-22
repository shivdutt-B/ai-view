import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { 
  generateQuestions, 
  setRole, 
  nextQuestion,
  addMessage,
  addQuestionAnswer,
  completeInterview,
  resetInterview,
  setInterviewId,
  setSubmitting,
  setInterviewResults
} from '../store/slices/interviewSlice';
import { submitCompleteInterview } from '../store/services/aiService';
import useAudioRecorder from './useAudioRecorder';
import useSpeechRecognitionHook from './useSpeechRecognition';
import { generateInterviewId } from '../utils/s3Utils';

export const useInterview = () => {
  const { role } = useParams<{ role: string }>();
  const dispatch = useAppDispatch();
  const [isRecordingAnswer, setIsRecordingAnswer] = useState(false);
  const [currentAnswerText, setCurrentAnswerText] = useState('');
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [alreadyRecordedMessage, setAlreadyRecordedMessage] = useState<string | null>(null);
  
  // Store audio blobs separately from Redux to avoid serialization issues
  const audioBlobs = useRef<Map<number, Blob>>(new Map());
  
  const {
    questions,
    currentQuestionIndex,
    messages,
    questionAnswers,
    isLoading,
    isSubmitting,
    interviewCompleted,
    error,
    jobDescription,
    sessionId,
    interviewId
  } = useAppSelector((state) => state.interview);

  const { 
    isRecording, 
    audioBlob, 
    startRecording, 
    stopRecording, 
    error: audioError 
  } = useAudioRecorder();

  const {
    transcript,
    finalTranscript,
    isListening,
    hasRecognitionSupport,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError
  } = useSpeechRecognitionHook();

  // Update current answer text with live transcript
  useEffect(() => {
    if (isRecordingAnswer && transcript) {
      setCurrentAnswerText(transcript);
    }
  }, [transcript, isRecordingAnswer]);

  // Handle final transcript when user stops speaking
  useEffect(() => {
    if (finalTranscript && isRecordingAnswer) {
      setCurrentAnswerText(finalTranscript);
    }
  }, [finalTranscript, isRecordingAnswer]);
  useEffect(() => {
    if (role) {
      dispatch(setRole(role));
      
      // Generate unique interview ID if not already set
      if (!interviewId) {
        const newInterviewId = generateInterviewId();
        dispatch(setInterviewId(newInterviewId));
      }
      
      // Generate questions if not already loaded or if role changed
      if (questions.length === 0) {
        dispatch(generateQuestions({ role, jobDescription }));
      }
    }
  }, [role, dispatch, jobDescription, interviewId, questions.length]);

  // Reset interview when component unmounts or role changes
  useEffect(() => {
    return () => {
      // Only reset if we're navigating away from interview AND not to the report page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/interview/') && !currentPath.includes('/report')) {
        dispatch(resetInterview());
        audioBlobs.current.clear();
      }
    };
  }, [dispatch]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Simply move to the next question
      dispatch(nextQuestion());
    } else {
      // Complete interview
      dispatch(completeInterview());
      const completion = {
        id: messages.length + 1,
        sender: 'ai' as const,
        text: "Thank you for completing the interview! I'm now analyzing your responses to generate your performance report.",
        timestamp: new Date().toISOString() // Convert to ISO string
      };
      dispatch(addMessage(completion));
    }
  };

  const handleTranscription = (text: string) => {
    setCurrentAnswerText(text);
    const userMessage = {
      id: messages.length + 1,
      sender: 'user' as const,
      text: text,
      timestamp: new Date().toISOString() // Convert to ISO string
    };
    
    dispatch(addMessage(userMessage));
  };

  const handleStartAnswer = async () => {
    const currentQuestion = getCurrentQuestion();
    
    // Clear any previous message
    setAlreadyRecordedMessage(null);
    
    // Check if this question has already been answered
    if (currentQuestion && answeredQuestions.has(currentQuestion.id)) {
      // Show message to user
      setAlreadyRecordedMessage('This question has already been answered and cannot be re-recorded.');
      
      // Clear the message after 3 seconds
      setTimeout(() => {
        setAlreadyRecordedMessage(null);
      }, 3000);
      
      return;
    }
    setIsRecordingAnswer(true);
    setCurrentAnswerText('');
    
    try {
      // Start audio recording
      await startRecording();
      
      // Start speech recognition
      if (hasRecognitionSupport) {
        startListening();
      } else {
        console.warn('Speech recognition not supported');
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecordingAnswer(false);
    }
  };

  const handleEndAnswer = async () => {
    setIsRecordingAnswer(false);
    
    // Stop audio recording
    stopRecording();
    
    // Stop speech recognition
    stopListening();
    
    // Use finalTranscript if available, otherwise use current transcript
    const finalAnswerText = finalTranscript || transcript || currentAnswerText;
    
    // Wait for audioBlob to be available after stopping recording
    const waitForAudioBlob = () => {
      return new Promise<Blob | null>((resolve) => {
        let attempts = 0;
        const maxAttempts = 10; // Wait up to 1 second
        
        const checkForBlob = () => {
          attempts++;
          if (audioBlob) {
            resolve(audioBlob);
          } else if (attempts >= maxAttempts) {
            resolve(null);
          } else {
            setTimeout(checkForBlob, 100);
          }
        };
        
        checkForBlob();
      });
    };
    
    // Wait for audio blob to be ready
    const finalAudioBlob = await waitForAudioBlob();
    
    // Save the question-answer pair
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion && finalAnswerText.trim()) {
      // Mark this question as answered (prevent re-recording)
      setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.id));
      
      // Store audio blob separately if available
      if (finalAudioBlob) {
        audioBlobs.current.set(currentQuestion.id, finalAudioBlob);
      } else {
        console.log(`No audio blob for question ${currentQuestion.id}`);
      }
      
      // Store only serializable data in Redux (no Blob)
      const questionAnswer = {
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        category: currentQuestion.category,
        textResponse: finalAnswerText.trim(),
        hasAudio: !!finalAudioBlob, // Boolean flag instead of storing the blob
        timestamp: new Date().toISOString()
      };
      
      dispatch(addQuestionAnswer(questionAnswer));
      
      // Add user message to chat
      const userMessage = {
        id: messages.length + 1,
        sender: 'user' as const,
        text: finalAnswerText.trim(),
        timestamp: new Date().toISOString()
      };
      dispatch(addMessage(userMessage));
    } else {
      console.log('No answer text to save');
    }
    
    // Reset transcripts and clear current answer text
    resetTranscript();
    setCurrentAnswerText('');
  };

  const submitCompleteInterviewData = async () => {
    try {
      // Set loading state to true
      dispatch(setSubmitting(true));
      
      // Combine Redux data with audio blobs
      const questionAnswersWithAudio = questionAnswers.map(qa => ({
        questionId: qa.questionId,
        question: qa.question,
        category: qa.category,
        textResponse: qa.textResponse,
        timestamp: qa.timestamp,
        audioBlob: audioBlobs.current.get(qa.questionId) // Attach audio blob if available
      }));
      
      const interviewData = {
        sessionId,
        role: role || '',
        interviewId,
        questionAnswers: questionAnswersWithAudio
      };
      
      const result = await submitCompleteInterview(interviewData);
      
      // Store the results in Redux for the report page
      dispatch(setInterviewResults(result));
      
      return result;
    } catch (error) {
      console.error('\n❌ INTERVIEW SUBMISSION FAILED:');
      console.error('=================================');
      console.error('Error Object:', error);
      console.error('Error Message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error Stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    } finally {
      // Reset loading state
      dispatch(setSubmitting(false));
    }
  };

  const retryQuestionGeneration = () => {
    if (role) {
      dispatch(generateQuestions({ role, jobDescription }));
    }
  };

  const getCurrentQuestion = () => {
    return questions[currentQuestionIndex] || null;
  };

  const isCurrentQuestionAnswered = () => {
    const currentQuestion = getCurrentQuestion();
    return currentQuestion ? answeredQuestions.has(currentQuestion.id) : false;
  };

  const getProgress = () => {
    if (questions.length === 0) return 0;
    return Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
  };

  const hasNextQuestion = () => {
    return currentQuestionIndex < questions.length - 1;
  };

  // Add resetInterview function to reset all local and global interview state
  const resetInterviewState = () => {
    // Reset Redux state
    dispatch(resetInterview());
    // Reset local state
    setIsRecordingAnswer(false);
    setCurrentAnswerText('');
    setAnsweredQuestions(new Set());
    setAlreadyRecordedMessage(null);
    // Reset refs
    audioBlobs.current.clear();
    // Reset transcript
    resetTranscript();
  };

  return {
    // State
    questions,
    currentQuestionIndex,
    messages,
    questionAnswers,
    isLoading,
    isSubmitting,
    interviewCompleted,
    error: error || audioError || speechError,
    role,
    
    // Recording state
    isRecordingAnswer,
    isRecording,
    currentAnswerText,
    alreadyRecordedMessage,
    
    // Speech recognition state
    isListening,
    hasRecognitionSupport,
    
    // Question state
    isCurrentQuestionAnswered: isCurrentQuestionAnswered(),
    
    // Derived state
    currentQuestion: getCurrentQuestion(),
    progress: getProgress(),
    hasNextQuestion: hasNextQuestion(),
    
    // Actions
    handleNextQuestion,
    handleTranscription,
    handleStartAnswer,
    handleEndAnswer,
    submitCompleteInterviewData,
    retryQuestionGeneration,
    resetInterview: resetInterviewState // Return the correct resetInterview function
  };
};
