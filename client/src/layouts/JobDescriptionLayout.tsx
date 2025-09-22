import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setRole, setJobDescription as setJobDescriptionAction } from '../store/slices/interviewSlice';
import JobDescriptionHeader from '../components/JobDescription/JobDescriptionHeader';
import JobDescriptionInput from '../components/JobDescription/JobDescriptionInput';
import JobDescriptionTips from '../components/JobDescription/JobDescriptionTips';
import JobDescriptionActions from '../components/JobDescription/JobDescriptionActions';

const JobDescriptionLayout: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const [jobDescription, setJobDescription] = useState<string>('');
  const dispatch = useAppDispatch();

  const handleJobDescriptionChange = (description: string) => {
    setJobDescription(description);
    dispatch(setJobDescriptionAction(description));
  };

  // Set the role in Redux when component mounts or role changes
  React.useEffect(() => {
    if (role) {
      dispatch(setRole(role));
    }
  }, [role, dispatch]);

  if (!role) {
    return <div>Role not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <JobDescriptionHeader role={role} />
        <JobDescriptionInput 
          jobDescription={jobDescription}
          onJobDescriptionChange={handleJobDescriptionChange}
        />
        <JobDescriptionTips />
        <JobDescriptionActions 
          role={role}
          hasJobDescription={jobDescription.trim().length > 0}
          jobDescription={jobDescription}
        />
      </div>
    </div>
  );
};

export default JobDescriptionLayout;
