import { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface UseSpeechRecognitionReturn {
  transcript: string;
  finalTranscript: string;
  isListening: boolean;
  hasRecognitionSupport: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

const useSpeechRecognitionHook = (): UseSpeechRecognitionReturn => {
  const [error, setError] = useState<string | null>(null);
  const [finalTranscript, setFinalTranscript] = useState<string>('');

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  const hasRecognitionSupport = browserSupportsSpeechRecognition && isMicrophoneAvailable;

  const startListening = () => {
    setError(null);
    if (!hasRecognitionSupport) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    SpeechRecognition.startListening({
      continuous: true,
      language: 'en-US',
      interimResults: true
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    if (transcript.trim()) {
      setFinalTranscript(transcript.trim());
    }
  };

  const handleResetTranscript = () => {
    resetTranscript();
    setFinalTranscript('');
    setError(null);
  };

  // Handle errors
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError('Your browser does not support speech recognition');
    } else if (!isMicrophoneAvailable) {
      setError('Microphone access is required for speech recognition');
    }
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable]);

  return {
    transcript,
    finalTranscript,
    isListening: listening,
    hasRecognitionSupport,
    startListening,
    stopListening,
    resetTranscript: handleResetTranscript,
    error
  };
};

export default useSpeechRecognitionHook;
