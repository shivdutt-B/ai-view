import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { ReportData } from './types';

interface WeaknessesCardProps {
  reportData: ReportData;
}

const WeaknessesCard: React.FC<WeaknessesCardProps> = ({ reportData }) => {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg h-full">
        <div className="flex items-center mb-6">
          <div className="bg-red-100 p-2 rounded-lg mr-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Areas for Improvement</h3>
            <p className="text-gray-600 text-sm">Key weaknesses to address</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {reportData.weaknesses.map((weakness, index) => (
            <motion.div
              key={index}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              className="flex items-start"
            >
              <div className="bg-red-100 p-1.5 rounded-full mr-3 mt-0.5 flex-shrink-0">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{weakness}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default WeaknessesCard;
