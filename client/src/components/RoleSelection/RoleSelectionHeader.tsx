import React from 'react';
import { motion } from 'framer-motion';

const RoleSelectionHeader: React.FC = () => {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <h1 className="text-4xl font-bold text-gray-900 mb-4 font-heading calistoga-regular">
        Choose Your Role
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Select the role you want to practice for. Our AI will generate 
        tailored questions based on your selection.
      </p>
    </motion.div>
  );
};

export default RoleSelectionHeader;
