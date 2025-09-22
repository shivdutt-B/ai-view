import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot, MessageCircle, Headphones, Mic } from 'lucide-react';

export interface Message {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string; // Changed from Date to string
  isTyping?: boolean;
}

interface Question {
  id: number;
  text: string;
  category: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  isAiTyping?: boolean;
  currentQuestion?: Question | null;
  currentQuestionIndex?: number;
  isRecording?: boolean;
  liveTranscription?: string;
  questionAnswers?: Array<{
    questionId: number;
    question: string;
    category: string;
    textResponse: string;
    audioData?: {
      data: string; // base64 encoded audio
      type: string;
      size: number;
    };
    timestamp: string;
  }>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  isAiTyping = false, 
  currentQuestion, 
  currentQuestionIndex = 0,
  isRecording = false,
  liveTranscription = "",
  questionAnswers = []
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create display messages for current question only
  const displayMessages: Message[] = [];
  
  // Add AI greeting only for the first question (when currentQuestionIndex is 0)
  const aiGreeting = messages.find(msg => msg.sender === 'ai' && !msg.text.includes('?'));
  if (aiGreeting && currentQuestionIndex === 0) {
    displayMessages.push(aiGreeting);
  }
  
  // Add current question as AI message if it exists
  if (currentQuestion) {
    displayMessages.push({
      id: currentQuestion.id + 1000, // Unique ID to avoid conflicts
      sender: 'ai',
      text: currentQuestion.text,
      timestamp: new Date().toISOString() // Convert to ISO string
    });
  }
  
  // Find and add the answer for the current question only
  if (currentQuestion) {
    const currentQuestionAnswer = questionAnswers.find(qa => qa.questionId === currentQuestion.id);
    
    if (currentQuestionAnswer) {
      displayMessages.push({
        id: currentQuestion.id + 2000, // Unique ID for the answer
        sender: 'user',
        text: currentQuestionAnswer.textResponse,
        timestamp: currentQuestionAnswer.timestamp
      });
    }
  }

  // Auto-scroll to bottom ONLY when displayMessages changes (not on live transcription or recording)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages.length]);

  // Live Transcription Indicator component
  const LiveTranscriptionIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-end"
    >
      <div className="flex items-center justify-center space-x-2 sm:space-x-3 max-w-[90%] sm:max-w-[85%] lg:max-w-4xl flex-row-reverse space-x-reverse bb">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 border animate-pulse">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md p-3 sm:p-4 shadow-md max-w-full transition-all duration-200 border-2 border-blue-300">
          <div className="flex items-center space-x-2 mb-1">
            <Mic className="w-3 h-3 text-white animate-pulse" />
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-blue-100">Speaking...</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words min-h-[1rem]">
            {liveTranscription || "Listening..."}
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Typing indicator component
  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start"
    >
      <div className="flex items-start space-x-3 max-w-4xl">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-r from-gray-600 to-gray-700">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-md p-4 shadow-md">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col min-h-[400px] max-h-[500px]">
      {/* Chat Header - Enhanced */}
      <div className="bg-[#0284C7] p-3 sm:p-4 rounded-t-xl sm:rounded-t-2xl flex-shrink-0">
        <div className="flex items-center justify-between w-full">
          <div className=  "flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-lg text-white">AI Interview Assistant</h3>
              <p className="text-blue-100 text-xs sm:text-sm">Ready to help with your interview</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container - Fixed to not interfere with main scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-gray-50 to-white chat-messages">
        {displayMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full w-full min-h-[200px]">
            <div className="text-center max-w-md mx-auto px-4">
              <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">Waiting for the interview to begin...</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">Your AI interviewer will start with the first question shortly</p>
            </div>
          </div>
        ) : (
          <>
            {displayMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} w-full`}
              >
                <div className={`flex items-center space-x-2 space-y-2 sm:space-x-3 max-w-[90%] sm:max-w-[85%] lg:max-w-4xl justify-center ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar - Responsive */}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                      : 'bg-gradient-to-r from-gray-600 to-gray-700'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </div>

                  {/* Message Bubble - Enhanced Responsive */}
                  <div className={`rounded-2xl sm:p-3 shadow-md max-w-full transition-all duration-200 hover:shadow-lg message-enter word-wrap break-words ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md hover:border-gray-300'
                  }`}>
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Live Transcription Indicator */}
            <AnimatePresence>
              {isRecording && <LiveTranscriptionIndicator />}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            <AnimatePresence>
              {isAiTyping && <TypingIndicator />}
            </AnimatePresence>
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Footer - Enhanced */}
      <div className="bg-gray-100 p-3 sm:p-4 rounded-b-xl sm:rounded-b-2xl border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between w-full">
          <div className="text-xs sm:text-sm text-gray-600 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="hidden sm:inline">Click the microphone to respond</span>
            <span className="sm:hidden">Tap mic to respond</span>
          </div>
          <div className="flex items-center space-x-2">
            <Headphones className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Audio</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;