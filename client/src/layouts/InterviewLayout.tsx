import React, { useState, useEffect } from "react";
import {
  Mic,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  Brain,
  Server,
  Zap,
} from "lucide-react";
// import useSocket from "../hooks/useSocket";
import InterviewHeader from "../components/Interview/InterviewHeader";
import ChatInterface, { Message } from "../components/Interview/ChatInterface";
import RecordingPanel from "../components/Interview/RecordingPanel";

interface Question {
  id: number;
  text: string;
  category: string;
}

interface InterviewLayoutProps {
  isLoading: boolean;
  isSubmitting: boolean; // Add isSubmitting prop
  questions: Question[];
  currentQuestionIndex: number;
  messages: Message[];
  questionAnswers: Array<{
    questionId: number;
    question: string;
    category: string;
    textResponse: string;
    audioData?: {
      data: string; // base64 encoded audio
      type: string;
      size: number;
    };
    timestamp: string;
  }>;
  interviewCompleted: boolean;
  error: string | null;
  role: string;
  currentQuestion: Question | null;
  hasNextQuestion: boolean;
  isRecordingAnswer: boolean;
  isRecording: boolean;
  currentAnswerText: string;
  alreadyRecordedMessage: string | null;
  hasRecognitionSupport: boolean;
  isCurrentQuestionAnswered: boolean;
  onNextQuestion: () => void;
  onStartAnswer: () => void;
  onEndAnswer: () => void;
  onReportGenerated: () => void;
  onRetryGeneration: () => void;
  onCompleteInterview: () => Promise<{ success: boolean; sessionId: string; }>;
  onResetInterview?: () => void; // Callback to reset all interview states to defaults
}

const InterviewLayout: React.FC<InterviewLayoutProps> = ({
  isLoading,
  isSubmitting,
  questions,
  currentQuestionIndex,
  messages,
  questionAnswers,
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
  onNextQuestion,
  onStartAnswer,
  onEndAnswer,
  onReportGenerated,
  onRetryGeneration,
  onCompleteInterview,
  onResetInterview,
}) => {
  // State for animated loading messages
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const loadingMessages = [
    { text: "Generating your report...", icon: Brain },
    { text: "Interview response reached backend", icon: Server },
    { text: "Sending data to analysis microservices", icon: Zap },
    { text: "Processing audio responses", icon: Mic },
    { text: "Analyzing text responses", icon: Brain }, 
    { text: "Evaluating performance metrics", icon: TrendingUp },
    { text: "Generating insights and recommendations", icon: Brain },
    { text: "Finalizing your personalized report", icon: Zap }
  ];

  // Cycle through loading messages every 10 seconds when interview is completed
  useEffect(() => {
    if (interviewCompleted) {
      const messageInterval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => 
          (prevIndex + 1) % loadingMessages.length
        );
      }, 10000);

      // Timer for elapsed time
      const timeInterval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);

      return () => {
        clearInterval(messageInterval);
        clearInterval(timeInterval);
      };
    } else {
      // Reset local states when interview is not completed
      setCurrentMessageIndex(0);
      setElapsedTime(0);
    }
  }, [interviewCompleted, loadingMessages.length]);

  // const { connected } = useSocket(); // Only keep connected status for UI

  const handleCompleteInterview = async () => {
    try {
      // First mark interview as complete in Redux
      onNextQuestion();
      
      // Then submit the data to backend
      const result = await onCompleteInterview();
      
      // Reset interview states to defaults after successful submission
      if (result.success && onResetInterview) {
        
        // Call parent component to reset all interview-related states:
        // - currentQuestionIndex: 0
        // - messages: []
        // - questionAnswers: []
        // - interviewCompleted: false
        // - currentQuestion: null
        // - hasNextQuestion: false
        // - isRecordingAnswer: false
        // - isRecording: false
        // - currentAnswerText: ""
        // - alreadyRecordedMessage: null
        // - isCurrentQuestionAnswered: false
        // - questions: [] (or keep if reusing)
        // - role: "" (or keep if reusing)
        onResetInterview();
        
        // Reset local animation states
        setCurrentMessageIndex(0);
        setElapsedTime(0);
      }
      
      // Navigate to report
      onReportGenerated();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // No Socket.IO setup needed - using REST API only

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium mb-2">Generating interview questions...</p>
          <p className="text-sm text-gray-500 mb-4">
            Using AI to create personalized questions for {role}
          </p>
          
          {/* Time estimate for question generation */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-left">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Preparation Time
              </span>
            </div>
            <p className="text-sm text-blue-700">
              Question generation typically takes <strong>30-60 seconds</strong>. 
              After completion, analysis and report generation will take an additional <strong>2-5 minutes</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Generate Questions
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onRetryGeneration}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-x-hidden min-h-screen">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <InterviewHeader
          role={role || ""}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
        />

        <div className="mt-4 space-y-4 w-full pb-8">
          {/* Chat Interface */}
          <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200">
            <ChatInterface
              messages={messages}
              isAiTyping={false}
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              isRecording={isRecordingAnswer}
              liveTranscription={currentAnswerText}
              questionAnswers={questionAnswers}
            />
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 w-full ">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                    Voice Recording
                  </h3>
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      isRecordingAnswer
                        ? "bg-red-500 animate-pulse shadow-lg shadow-red-200"
                        : "bg-gray-300"
                    }`}
                  ></div>
                </div>
                <div className="w-full">
                  <RecordingPanel
                    isRecording={isRecording}
                    isRecordingAnswer={isRecordingAnswer}
                    interviewCompleted={interviewCompleted}
                    error={error}
                    currentAnswerText={currentAnswerText}
                    hasRecognitionSupport={hasRecognitionSupport}
                    isCurrentQuestionAnswered={isCurrentQuestionAnswered}
                    alreadyRecordedMessage={alreadyRecordedMessage}
                    onStartAnswer={onStartAnswer}
                    onEndAnswer={onEndAnswer}
                  />

                  {/* Next Question Button */}
                  {!interviewCompleted && hasNextQuestion && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={onNextQuestion}
                        disabled={isRecordingAnswer}
                        className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                          isRecordingAnswer 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
                        }`}
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      {isRecordingAnswer && (
                        <p className="text-xs text-gray-500 text-center mt-2">
                          Finish recording to continue
                        </p>
                      )}
                    </div>
                  )}

                  {!interviewCompleted &&
                    !hasNextQuestion &&
                    currentQuestionIndex === questions.length - 1 && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <button
                          onClick={handleCompleteInterview}
                          disabled={isSubmitting || isRecordingAnswer}
                          className={`w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                            (isSubmitting || isRecordingAnswer) 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:from-green-700 hover:to-emerald-700 hover:shadow-xl'
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Submitting Interview...</span>
                            </>
                          ) : (
                            <>
                              <span>Complete Interview</span>
                              <ChevronRight className="w-5 h-5" />
                            </>
                          )}
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-2">
                          {isSubmitting ? (
                            <span>
                              Sending data to server... Analysis and report generation will take 2-5 minutes.
                            </span>
                          ) : isRecordingAnswer ? (
                            'Finish recording to complete'
                          ) : (
                            'Final question completed'
                          )}
                        </p>
                        
                        {isSubmitting && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <AlertCircle className="w-3 h-3 text-blue-600" />
                              <span className="text-xs font-medium text-blue-800">
                                Processing Notice
                              </span>
                            </div>
                            <p className="text-xs text-blue-700">
                              Please keep this page open. Your interview will be analyzed by our AI systems, 
                              which typically takes <strong>2-5 minutes</strong>.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>

            <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 w-full">
                <div className="space-y-4 sm:space-y-6 w-full">
                  {questions.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-700 text-xl">
                            Progress
                          </span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                          {currentQuestionIndex + 1}/{questions.length}
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round(
                              ((currentQuestionIndex + 1) / questions.length) *
                                100
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Questions completed</span>
                        <span className="font-semibold">
                          {Math.round(
                            ((currentQuestionIndex + 1) / questions.length) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  )}

                  {interviewCompleted ? (
                    <div className="space-y-4">
                      {/* Time estimate note */}
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-800">
                            Processing Time
                          </span>
                        </div>
                        <p className="text-sm text-amber-700">
                          Analysis and report generation typically takes <strong>2-5 minutes</strong>. 
                          Our AI systems are thoroughly analyzing your responses to provide detailed insights.
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          Please keep this page open while we process your interview.
                        </p>
                      </div>

                      {/* Main loading animation */}
                      <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 shadow-lg animate-pulse">
                        <div className="flex items-center space-x-4">
                          {/* Animated loading icon */}
                          <div className="relative">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center animate-bounce">
                              {/* Dynamic icon based on current message */}
                              {React.createElement(loadingMessages[currentMessageIndex].icon, {
                                className: "w-4 h-4 text-white"
                              })}
                            </div>
                            {/* Pulse effect */}
                            <div className="absolute inset-0 w-8 h-8 bg-purple-400 rounded-full animate-ping opacity-30"></div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="font-semibold text-purple-900 mb-1">
                              Interview Complete!
                            </div>
                            <div className="text-sm text-purple-700 relative overflow-hidden h-6">
                              {/* Animated message with enhanced transition */}
                              <div 
                                key={currentMessageIndex}
                                className="absolute inset-0 transition-all duration-700 ease-in-out transform opacity-100 animate-in slide-in-from-bottom-2 fade-in"
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                                  <span>{loadingMessages[currentMessageIndex].text}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Progress dots */}
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex space-x-1">
                                {loadingMessages.map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                      index === currentMessageIndex
                                        ? 'bg-purple-500 scale-125'
                                        : index < currentMessageIndex
                                        ? 'bg-purple-300'
                                        : 'bg-purple-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              
                              {/* Elapsed time */}
                              <div className="text-xs text-purple-600 font-mono">
                                {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    currentQuestion && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-blue-800">
                            Current Topic
                          </span>
                        </div>
                        <span className="text-blue-900 font-semibold">
                          {currentQuestion.category}
                        </span>
                        <p className="text-xs text-blue-700 mt-1">
                          Question {currentQuestionIndex + 1} of{" "}
                          {questions.length}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewLayout;
