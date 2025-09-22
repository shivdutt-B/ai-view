declare module 'react-speech-recognition' {
  export interface SpeechRecognitionResult {
    transcript: string;
    interimTranscript: string;
    finalTranscript: string;
    listening: boolean;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
    isMicrophoneAvailable: boolean;
  }

  export interface StartListeningOptions {
    continuous?: boolean;
    language?: string;
    interimResults?: boolean;
  }

  export function useSpeechRecognition(): SpeechRecognitionResult;

  interface SpeechRecognitionAPI {
    startListening: (options?: StartListeningOptions) => void;
    stopListening: () => void;
    abortListening: () => void;
  }

  const SpeechRecognition: SpeechRecognitionAPI;
  export default SpeechRecognition;
}
