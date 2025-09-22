import React from 'react';
import HeroSection from '../components/Home/HeroSection';
import FeaturesSection from '../components/Home/FeaturesSection';
import CTASection from '../components/Home/CTASection';

const HomeLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* <AnimatedBackground /> */}
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
};

export default HomeLayout;
