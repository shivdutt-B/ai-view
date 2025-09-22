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

  // Debug logs for browser and mic support
  console.log('[SpeechRecognition] browserSupportsSpeechRecognition:', browserSupportsSpeechRecognition);
  console.log('[SpeechRecognition] isMicrophoneAvailable:', isMicrophoneAvailable);

  const hasRecognitionSupport = browserSupportsSpeechRecognition && isMicrophoneAvailable;

  const startListening = () => {
    setError(null);
    console.log('[SpeechRecognition] startListening called');
    if (!hasRecognitionSupport) {
      setError('Speech recognition is not supported in this browser');
      console.error('[SpeechRecognition] Not supported');
      return;
    }
    SpeechRecognition.startListening({
      continuous: true,
      language: 'en-US',
      interimResults: true
    });
    console.log('[SpeechRecognition] Listening started');
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    console.log('[SpeechRecognition] Listening stopped');
    if (transcript.trim()) {
      setFinalTranscript(transcript.trim());
      console.log('[SpeechRecognition] Final transcript:', transcript.trim());
    }
  };

  const handleResetTranscript = () => {
    resetTranscript();
    setFinalTranscript('');
    setError(null);
    console.log('[SpeechRecognition] Transcript reset');
  };

  // Handle errors
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError('Your browser does not support speech recognition');
      console.error('[SpeechRecognition] Browser does not support speech recognition');
    } else if (!isMicrophoneAvailable) {
      setError('Microphone access is required for speech recognition');
      console.error('[SpeechRecognition] Microphone not available');
    }
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable]);

  // Debug log for transcript changes
  useEffect(() => {
    console.log('[SpeechRecognition] Transcript updated:', transcript);
  }, [transcript]);

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
