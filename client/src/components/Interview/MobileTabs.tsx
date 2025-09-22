import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mic, BarChart3, ChevronUp, ChevronDown } from 'lucide-react';

interface MobileTabsProps {
  children: {
    chat: React.ReactNode;
    recording: React.ReactNode;
    status: React.ReactNode;
    questions: React.ReactNode;
  };
}

const MobileTabs: React.FC<MobileTabsProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'recording' | 'status' | 'questions'>('chat');
  const [isExpanded, setIsExpanded] = useState(false);

  const tabs = [
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare, content: children.chat },
    { id: 'questions' as const, label: 'Questions', icon: MessageSquare, content: children.questions },
    { id: 'recording' as const, label: 'Record', icon: Mic, content: children.recording },
    { id: 'status' as const, label: 'Status', icon: BarChart3, content: children.status }
  ];

  return (
    <div className="lg:hidden">
      {/* Mobile Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-3 transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Content Area */}
      <div className="pb-20"> {/* Add padding to account for fixed bottom nav */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[calc(100vh-200px)]"
          >
            {tabs.find(tab => tab.id === activeTab)?.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Quick Access Panel (for important actions) */}
      {activeTab === 'chat' && (
        <div className="fixed bottom-20 right-4 z-40">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white"
            >
              {isExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
            </button>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64"
                >
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-900">Quick Actions</div>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => setActiveTab('recording')}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 text-left"
                      >
                        <Mic className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">Start Recording</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('status')}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 text-left"
                      >
                        <BarChart3 className="w-4 h-4 text-green-600" />
                        <span className="text-sm">View Progress</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MobileTabs;
