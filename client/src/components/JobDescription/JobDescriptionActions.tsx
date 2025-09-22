import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { generateQuestions } from '../../store/slices/interviewSlice';
import Button from '../Button/Button';

interface JobDescriptionActionsProps {
  role: string;
  hasJobDescription: boolean;
  jobDescription: string;
}

const JobDescriptionActions: React.FC<JobDescriptionActionsProps> = ({ 
  role, 
  hasJobDescription, 
  jobDescription 
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStartInterview = async () => {
    setIsGenerating(true);
    
    try {
      // Generate questions using AI
      await dispatch(generateQuestions({ 
        role, 
        jobDescription: hasJobDescription ? jobDescription : undefined 
      })).unwrap();
      
      // Navigate to interview page
      navigate(`/interview/${role}`);
    } catch (error) {
      console.error('Failed to generate questions:', error);
      // Still navigate to interview page with fallback questions
      navigate(`/interview/${role}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGoBack = () => {
    navigate('/roles');
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="text-center"
    >
      <Button
        size="lg"
        variant="primary"
        className="shadow-lg m-2"
        onClick={handleGoBack}
      >
        Back to Roles
      </Button>
      
      <Button
        size="lg"
        className="shadow-lg m-2"
        onClick={handleStartInterview}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating Questions...' : hasJobDescription ? 'Start Interview with Job Description' : 'Start Interview'}
      </Button>
      
      {!hasJobDescription && (
        <p className="text-sm text-gray-500 mt-3">
          You can start the interview without a job description and get general questions
        </p>
      )}
    </motion.div>
  );
};

export default JobDescriptionActions;
