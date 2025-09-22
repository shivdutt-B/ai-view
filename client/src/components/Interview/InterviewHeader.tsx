import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface InterviewHeaderProps {
  role: string;
  currentQuestionIndex: number;
  totalQuestions: number;
}

const InterviewHeader: React.FC<InterviewHeaderProps> = ({ 
  role, 
  currentQuestionIndex, 
  totalQuestions 
}) => {
  const [_, setSessionTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const progressPercentage = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mb-8"
    >
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-heading">
              {role?.charAt(0).toUpperCase() + (role?.slice(1) || '')} Interview
            </h1>
            <p className="text-gray-600">Let's explore your skills and experience</p>
          </div>
        </div>

        
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Interview Progress</span>
          <span className="font-medium">{currentQuestionIndex + 1} of {totalQuestions} questions</span>
        </div>
        <div className="w-full bg-gray-200/60 rounded-full h-3 overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default InterviewHeader;
