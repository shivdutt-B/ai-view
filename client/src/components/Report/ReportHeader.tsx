import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Briefcase, Trophy, Sparkles } from 'lucide-react';
import Button from '../Button/Button';
import { ReportData } from './types';

interface ReportHeaderProps {
  reportData: ReportData;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ reportData }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-12"
    >
      {/* Clean header card */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            {/* Badge */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg mb-4"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Interview Complete
            </motion.div>
            
            {/* Title */}
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
            >
              Performance Report
            </motion.h1>
            
            {/* Meta info */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-6 text-gray-600"
            >
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                <span className="text-lg font-medium">{reportData.role}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                <span className="text-lg">{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
                <span className="text-lg">AI Analyzed</span>
              </div>
            </motion.div>
          </div>
          
          {/* Action buttons */}
          <motion.div 
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors duration-200"
            >
              New Interview
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportHeader;
