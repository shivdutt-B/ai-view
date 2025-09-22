import React, { useEffect } from 'react';

interface KeyboardHandlerProps {
  isRecording: boolean;
  interviewCompleted: boolean;
  onRecordToggle: () => void;
  onNextQuestion?: () => void;
  onPreviousQuestion?: () => void;
  children: React.ReactNode;
}

const KeyboardHandler: React.FC<KeyboardHandlerProps> = ({
  isRecording,
  interviewCompleted,
  onRecordToggle,
  onNextQuestion,
  onPreviousQuestion,
  children
}) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Space bar to toggle recording
      if (event.code === 'Space' && !interviewCompleted) {
        event.preventDefault();
        onRecordToggle();
      }

      // Arrow keys for navigation (if functions are provided)
      if (event.code === 'ArrowRight' && onNextQuestion) {
        event.preventDefault();
        onNextQuestion();
      }

      if (event.code === 'ArrowLeft' && onPreviousQuestion) {
        event.preventDefault();
        onPreviousQuestion();
      }

      // ESC to stop recording
      if (event.code === 'Escape' && isRecording) {
        event.preventDefault();
        onRecordToggle();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isRecording, interviewCompleted, onRecordToggle, onNextQuestion, onPreviousQuestion]);

  return <>{children}</>;
};

export default KeyboardHandler;
