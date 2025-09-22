import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, MessageSquare, TrendingUp, Clock } from 'lucide-react';

interface InterviewStatusProps {
  connected: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
}

const InterviewStatus: React.FC<InterviewStatusProps> = ({
  connected,
  currentQuestionIndex,
  totalQuestions
}) => {
  const progressPercentage = totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
        Interview Status
      </h3>
      
      <div className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            {connected ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            <span className="text-sm font-medium text-gray-700">Connection</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`text-sm font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Question Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Questions</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {currentQuestionIndex + 1}/{totalQuestions}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span className="font-semibold">{progressPercentage}%</span>
          </div>
        </div>

        {/* Time Indicator */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Session Active</span>
          </div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>

        {/* Completion Status */}
        {progressPercentage === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-green-50 rounded-lg border border-green-200"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium text-green-800">Interview Complete!</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InterviewStatus;
