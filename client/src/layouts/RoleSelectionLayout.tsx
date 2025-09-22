import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSelectionHeader from '../components/RoleSelection/RoleSelectionHeader';
import RoleGrid from '../components/RoleSelection/RoleGrid';
import ActionButtons from '../components/RoleSelection/ActionButtons';

const RoleSelectionLayout: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleStartInterview = () => {
    if (selectedRole) {
      // Navigate to job description page instead of directly to interview
      navigate(`/job-description/${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <RoleSelectionHeader />
        <RoleGrid 
          selectedRole={selectedRole} 
          onRoleSelect={handleRoleSelect} 
        />
        <ActionButtons 
          selectedRole={selectedRole}
          onStartInterview={handleStartInterview}
        />
      </div>
    </div>
  );
};

export default RoleSelectionLayout;
