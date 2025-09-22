import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-20 pb-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-heading calistoga-regular">
            Master Your Next
            <span className="text-primary-600 block">Interview</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Practice with our AI-powered interview simulator. Get instant feedback, 
            improve your skills, and boost your confidence for the real thing.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/roles')}
            className="shadow-lg"
          >
            Start Interview Practice
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
