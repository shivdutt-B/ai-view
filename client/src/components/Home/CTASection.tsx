import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';
import Card from '../Card/Card';

const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-primary-50 border-primary-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading calistoga-regular">
              Ready to Ace Your Interview?
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Join thousands of job seekers who have improved their interview 
              skills with our AI-powered platform.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/roles')}
            >
              Get Started Now
            </Button>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
