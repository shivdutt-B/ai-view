import React from 'react';
import { motion } from 'framer-motion';
import { Code, Database, Brain, Palette, Shield, Smartphone } from 'lucide-react';
import Card from '../Card/Card';

export interface Role {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface RoleGridProps {
  selectedRole: string | null;
  onRoleSelect: (roleId: string) => void;
}

const RoleGrid: React.FC<RoleGridProps> = ({ selectedRole, onRoleSelect }) => {
  const roles: Role[] = [
    {
      id: 'frontend',
      title: 'Frontend Developer',
      description: 'React, JavaScript, CSS, HTML, responsive design',
      icon: <Code className="h-8 w-8" />,
      color: 'text-blue-600'
    },
    {
      id: 'backend',
      title: 'Backend Developer',
      description: 'Node.js, APIs, databases, server architecture',
      icon: <Database className="h-8 w-8" />,
      color: 'text-green-600'
    },
    {
      id: 'fullstack',
      title: 'Full Stack Developer',
      description: 'Frontend + Backend, system design, deployment',
      icon: <Brain className="h-8 w-8" />,
      color: 'text-purple-600'
    },
    {
      id: 'uiux',
      title: 'UI/UX Designer',
      description: 'User experience, prototyping, design systems',
      icon: <Palette className="h-8 w-8" />,
      color: 'text-pink-600'
    },
    {
      id: 'devops',
      title: 'DevOps Engineer',
      description: 'CI/CD, cloud infrastructure, monitoring',
      icon: <Shield className="h-8 w-8" />,
      color: 'text-orange-600'
    },
    {
      id: 'mobile',
      title: 'Mobile Developer',
      description: 'React Native, iOS, Android, cross-platform',
      icon: <Smartphone className="h-8 w-8" />,
      color: 'text-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {roles.map((role, index) => (
        <motion.div
          key={role.id}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 * index }}
        >
          <Card
            hover
            className={`cursor-pointer transition-all duration-300 border-blue-200 ${
              selectedRole === role.id
                ? 'ring-4 ring-primary-500 bg-primary-100 border-2 border-primary-500 shadow-lg'
                : 'hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
            }`}
            onClick={() => onRoleSelect(role.id)}
          >
            <div className="text-center">
              <div className={`flex justify-center mb-4 ${
                selectedRole === role.id ? 'text-primary-600' : role.color
              }`}>
                {role.icon}
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                selectedRole === role.id ? 'text-primary-800' : 'text-gray-900'
              }`}>
                {role.title}
              </h3>
              <p className={`text-sm ${
                selectedRole === role.id ? 'text-primary-700' : 'text-gray-600'
              }`}>
                {role.description}
              </p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default RoleGrid;
