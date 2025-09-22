import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../hooks/useInterview';
import InterviewLayout from '../layouts/InterviewLayout';

const InterviewPage: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    questions,
    currentQuestionIndex,
    messages,
    questionAnswers,
    isLoading,
    isSubmitting,
    interviewCompleted,
    error,
    role,
    currentQuestion,
    hasNextQuestion,
    isRecordingAnswer,
    isRecording,
    currentAnswerText,
    alreadyRecordedMessage,
    hasRecognitionSupport,
    isCurrentQuestionAnswered,
    handleNextQuestion,
    handleStartAnswer,
    handleEndAnswer,
    submitCompleteInterviewData,
    retryQuestionGeneration,
    resetInterview // Add resetInterview if available from useInterview
  } = useInterview();

  // Reset all interview states to default when starting a new session
  useEffect(() => {
    if (typeof resetInterview === 'function') {
      resetInterview();
    }
    // If no resetInterview, manually reset states here if needed
    // ...existing code...
  }, []);

  const handleReportGenerated = async () => {
    navigate('/report');
  };

  return (
    <InterviewLayout
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      questions={questions}
      currentQuestionIndex={currentQuestionIndex}
      messages={messages}
      questionAnswers={questionAnswers}
      interviewCompleted={interviewCompleted}
      error={error}
      role={role || ''}
      currentQuestion={currentQuestion}
      hasNextQuestion={hasNextQuestion}
      isRecordingAnswer={isRecordingAnswer}
      isRecording={isRecording}
      currentAnswerText={currentAnswerText}
      alreadyRecordedMessage={alreadyRecordedMessage}
      hasRecognitionSupport={hasRecognitionSupport}
      isCurrentQuestionAnswered={isCurrentQuestionAnswered}
      onNextQuestion={handleNextQuestion}
      onStartAnswer={handleStartAnswer}
      onEndAnswer={handleEndAnswer}
      onReportGenerated={handleReportGenerated}
      onRetryGeneration={retryQuestionGeneration}
      onCompleteInterview={submitCompleteInterviewData}
    />
  );
};

export default InterviewPage;
