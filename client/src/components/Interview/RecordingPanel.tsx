import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Waves } from 'lucide-react';

interface RecordingPanelProps {
  isRecording: boolean;
  isRecordingAnswer: boolean;
  interviewCompleted: boolean;
  error: string | null;
  currentAnswerText: string;
  hasRecognitionSupport: boolean;
  isCurrentQuestionAnswered: boolean;
  alreadyRecordedMessage: string | null;
  onStartAnswer: () => void;
  onEndAnswer: () => void;
}

const RecordingPanel: React.FC<RecordingPanelProps> = ({
  isRecording,
  isRecordingAnswer,
  interviewCompleted,
  error,
  currentAnswerText,
  hasRecognitionSupport,
  isCurrentQuestionAnswered,
  alreadyRecordedMessage,
  onStartAnswer,
  onEndAnswer
}) => {
  return (
    <div className="text-center h-full">
      {/* Recording Button with Enhanced Design - Responsive */}
      <div className="relative mb-4 sm:mb-6 flex justify-center align-middle">
        {isRecording && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 bg-red-400 rounded-full opacity-30"
          />
        )}
        
        <motion.button
          whileHover={{ scale: (interviewCompleted || isCurrentQuestionAnswered) ? 1 : 1.05 }}
          whileTap={{ scale: (interviewCompleted || isCurrentQuestionAnswered) ? 1 : 0.95 }}
          onClick={isRecordingAnswer ? onEndAnswer : onStartAnswer}
          disabled={interviewCompleted || isCurrentQuestionAnswered || (!hasRecognitionSupport && !isRecordingAnswer)}
          className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-glow mic-button focus-ring ${
            isCurrentQuestionAnswered
              ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-200'
              : isRecordingAnswer 
                ? 'bg-gradient-to-r from-red-500 to-red-600 recording-pulse shadow-red-200 shadow-2xl' 
                : hasRecognitionSupport
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-200'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 shadow-gray-200'
          } ${(interviewCompleted || isCurrentQuestionAnswered || (!hasRecognitionSupport && !isRecordingAnswer)) ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-xl active:scale-95'}`}
        >
          {isCurrentQuestionAnswered ? (
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : isRecordingAnswer ? (
            <MicOff className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          ) : (
            <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          )}
        </motion.button>
      </div>

      {/* Action Button Text */}
      <div className="mb-4">
        <motion.button
          whileHover={{ scale: (interviewCompleted || isCurrentQuestionAnswered) ? 1 : 1.02 }}
          whileTap={{ scale: (interviewCompleted || isCurrentQuestionAnswered) ? 1 : 0.98 }}
          onClick={isRecordingAnswer ? onEndAnswer : onStartAnswer}
          disabled={interviewCompleted || isCurrentQuestionAnswered || (!hasRecognitionSupport && !isRecordingAnswer)}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
            interviewCompleted
              ? 'bg-gray-400 cursor-not-allowed'
              : isCurrentQuestionAnswered
                ? 'bg-green-500 cursor-not-allowed'
                : !hasRecognitionSupport && !isRecordingAnswer
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isRecordingAnswer
                    ? 'bg-red-500 hover:bg-red-600 shadow-lg'
                    : 'bg-blue-500 hover:bg-blue-600 shadow-lg'
          }`}
        >
          {interviewCompleted 
            ? 'Interview Completed'
            : isCurrentQuestionAnswered
              ? 'Answer Recorded ✓'
              : !hasRecognitionSupport && !isRecordingAnswer
                ? 'Speech Recognition Unavailable'
                : isRecordingAnswer 
                  ? 'End Answer' 
                  : 'Start Answer'
          }
        </motion.button>
      </div>

      {/* Status Text - Enhanced Responsive */}
      <div className="space-y-2">
        <p className={`text-xs sm:text-sm font-medium ${
          interviewCompleted 
            ? 'text-gray-500'
            : !hasRecognitionSupport
              ? 'text-orange-600'
              : isRecordingAnswer 
                ? 'text-red-600' 
                : 'text-blue-600'
        }`}>
          {interviewCompleted 
            ? 'Thank you for your responses'
            : !hasRecognitionSupport
              ? 'Speech recognition not available - audio recording only'
              : isRecordingAnswer 
                ? 'Recording your answer...' 
                : 'Click to begin your response'
          }
        </p>
        
        {isRecordingAnswer && (
          <motion.div 
            className="flex items-center justify-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Waves className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
            <span className="text-xs text-red-500">Listening...</span>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
          </motion.div>
        )}

        {/* Display current answer text while recording */}
        {isRecordingAnswer && currentAnswerText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <p className="text-sm text-blue-800">
              <span className="font-medium">Live transcription: </span>
              {currentAnswerText}
            </p>
          </motion.div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-sm text-red-600">{error}</p>
        </motion.div>
      )}

      {/* Already Recorded Message */}
      {alreadyRecordedMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-yellow-800 font-medium">{alreadyRecordedMessage}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RecordingPanel;
