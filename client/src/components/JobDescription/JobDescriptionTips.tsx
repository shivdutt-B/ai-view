import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Target, Users, Briefcase } from 'lucide-react';
import Card from '../Card/Card';

const JobDescriptionTips: React.FC = () => {
  const tips = [
    {
      icon: Target,
      title: "Include Key Requirements",
      description: "List essential skills, experience levels, and qualifications needed for the role."
    },
    {
      icon: Briefcase,
      title: "Specify Role Details",
      description: "Mention job title, department, reporting structure, and main responsibilities."
    },
    {
      icon: Users,
      title: "Team & Culture",
      description: "Describe team size, company culture, and collaboration expectations."
    },
    {
      icon: Lightbulb,
      title: "Growth Opportunities",
      description: "Include information about career progression, learning opportunities, and benefits."
    }
  ];

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mb-8"
    >
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
          Tips for Better Job Descriptions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip, index) => (
            <div 
              key={index}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <tip.icon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{tip.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Pro tip:</strong> The more detailed and specific your job description, 
            the better we can tailor interview questions to match your requirements.
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default JobDescriptionTips;
