import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star } from 'lucide-react';

interface StrengthsCardProps {
  strengths: string[];
}

const StrengthsCard: React.FC<StrengthsCardProps> = ({ strengths }) => {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg h-full">
        <div className="flex items-center mb-4">
          <div className="bg-green-100 p-2 rounded-lg mr-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Strengths
          </h3>
        </div>
        <ul className="space-y-3">
          {strengths.map((strength, index) => (
            <motion.li 
              key={index} 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start"
            >
              <Star className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700 leading-relaxed">{strength}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default StrengthsCard;
