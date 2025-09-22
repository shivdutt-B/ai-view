import React from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageCircle, Heart, Target } from 'lucide-react';
import { ReportData } from './types';

interface SkillsAssessmentProps {
  reportData: ReportData;
}

const SkillsAssessment: React.FC<SkillsAssessmentProps> = ({ reportData }) => {
  const skills = [
    {
      name: 'Technical Knowledge',
      value: reportData.technicalKnowledge,
      icon: Brain,
      color: '#3B82F6', // blue
      bgColor: '#DBEAFE' // blue-100
    },
    {
      name: 'Communication Skills',
      value: reportData.communicationSkills,
      icon: MessageCircle,
      color: '#10B981', // green
      bgColor: '#D1FAE5' // green-100
    },
    {
      name: 'Attitude',
      value: reportData.attitude,
      icon: Heart,
      color: '#8B5CF6', // purple
      bgColor: '#EDE9FE' // purple-100
    }
  ];

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg h-full">
        <div className="flex items-center mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
            <Target className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Skills Assessment</h3>
            <p className="text-gray-600 text-sm">Detailed skill breakdown</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {skills.map((skill, index) => {
            const IconComponent = skill.icon;
            return (
              <motion.div
                key={skill.name}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="p-2 rounded-lg mr-3"
                      style={{ backgroundColor: skill.bgColor }}
                    >
                      <IconComponent className="w-5 h-5" style={{ color: skill.color }} />
                    </div>
                    <span className="text-gray-900 font-medium">{skill.name}</span>
                  </div>
                  <span className="text-gray-700 font-bold text-lg">{skill.value}%</span>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div 
                      className="h-3 rounded-full"
                      style={{ backgroundColor: skill.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.value}%` }}
                      transition={{ delay: 0.8 + index * 0.2, duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default SkillsAssessment;
