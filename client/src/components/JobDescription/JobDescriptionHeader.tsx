import React from 'react';
import { motion } from 'framer-motion';

interface JobDescriptionHeaderProps {
  role: string;
}

const JobDescriptionHeader: React.FC<JobDescriptionHeaderProps> = ({ role }) => {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <h1 className="text-4xl font-bold text-gray-900 mb-4 font-heading calistoga-regular">
        Job Description
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Add a job description to get more targeted questions for your {role} interview.
        This is optional - you can start the interview without providing a job description.
      </p>
    </motion.div>
  );
};

export default JobDescriptionHeader;
