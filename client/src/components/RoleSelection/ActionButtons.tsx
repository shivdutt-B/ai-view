import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';

interface ActionButtonsProps {
  selectedRole: string | null;
  onStartInterview?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ selectedRole, onStartInterview }) => {
  const navigate = useNavigate();

  const handleStartInterview = () => {
    if (onStartInterview) {
      onStartInterview();
    } else if (selectedRole) {
      navigate(`/interview/${selectedRole}`);
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="text-center"
    >
      <Button
        size="lg"
        className="shadow-lg m-2"
        onClick={() => navigate('/')}
      >
        Back Home
      </Button> 
      <Button
        size="lg"
        onClick={handleStartInterview}
        disabled={!selectedRole}
        className="shadow-lg m-2"
      >
        {selectedRole ? 'Start Interview' : 'Select Role'}
      </Button>
    </motion.div>
  );
};

export default ActionButtons;
