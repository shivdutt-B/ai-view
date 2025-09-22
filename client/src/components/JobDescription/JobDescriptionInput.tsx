import React from 'react';
import { motion } from 'framer-motion';
import { FileText, X } from 'lucide-react';
import Card from '../Card/Card';

interface JobDescriptionInputProps {
  jobDescription: string;
  onJobDescriptionChange: (description: string) => void;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  jobDescription,
  onJobDescriptionChange
}) => {
  const clearJobDescription = () => {
    onJobDescriptionChange('');
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-8"
    >
      <Card>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Job Description
        </h3>
        
        {/* Text Area */}
        <div className="mb-6">
          <div className="relative">
            <textarea
              value={jobDescription}
              onChange={(e) => onJobDescriptionChange(e.target.value)}
              placeholder="Paste or type the job description here..."
              className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {jobDescription && (
              <button
                onClick={clearJobDescription}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {jobDescription && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Job description added ({jobDescription.length} characters)
              </span>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default JobDescriptionInput;
