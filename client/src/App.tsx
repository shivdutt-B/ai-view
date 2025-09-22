import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { motion } from 'framer-motion';
import { store } from './store/store';
import HomePage from './pages/HomePage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import JobDescriptionPage from './pages/JobDescriptionPage';
import InterviewPage from './pages/InterviewPage';
import ReportPage from './pages/ReportPage';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="bg-gray-50 overflow-x-hidden">
          {/* <Navbar /> */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/roles" element={<RoleSelectionPage />} />
            <Route path="/job-description/:role" element={<JobDescriptionPage />} />
            <Route path="/interview/:role" element={<InterviewPage />} />
            <Route path="/report" element={<ReportPage />} />
          </Routes>
        </motion.main>
      </div>
    </Router>
    </Provider>
  );
};

export default App;
