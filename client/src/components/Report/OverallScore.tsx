import React from 'react';
import { motion } from 'framer-motion';
import { ReportData } from './types';

interface OverallScoreProps {
  reportData: ReportData;
}

const OverallScore: React.FC<OverallScoreProps> = ({ reportData }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // green
    if (score >= 60) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="mb-8"
    >
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#E5E7EB"
                strokeWidth="12"
                fill="none"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                stroke={getScoreColor(reportData.overallScore)}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${reportData.overallScore * 3.51} 351`}
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 351" }}
                animate={{ strokeDasharray: `${reportData.overallScore * 3.51} 351` }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                className="text-4xl font-bold text-gray-900"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              >
                {reportData.overallScore}
              </motion.span>
              <span className="text-gray-500 text-sm">out of 100</span>
            </div>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Overall Performance
        </h2>
        <p className="text-xl text-gray-600 mb-4">
          {getScoreText(reportData.overallScore)} performance
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: getScoreColor(reportData.overallScore) }}
          ></div>
          <span className="text-gray-700 font-medium">
            {getScoreText(reportData.overallScore)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default OverallScore;
