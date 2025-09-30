import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import PersonalInfoForm from './components/FormComponents/PersonalInfoForm';
import AgentApplicationForm from './components/FormComponents/AgentApplicationForm';
import HomePage from './components/HomePage';
import AgentPage from './components/AgentPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // 禁用浏览器的滚动恢复功能
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 确保页面切换时滚动到顶部
  useEffect(() => {
    // 立即滚动到顶部
    window.scrollTo(0, 0);
    
    // 延迟再次滚动，对抗浏览器的滚动恢复机制
    const timeouts = [
      setTimeout(() => window.scrollTo(0, 0), 10),
      setTimeout(() => window.scrollTo(0, 0), 50),
      setTimeout(() => window.scrollTo(0, 0), 100),
      setTimeout(() => window.scrollTo(0, 0), 200)
    ];
    
    // 清理定时器
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [currentPage]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'student-form':
        return <PersonalInfoForm onBackToHome={() => setCurrentPage('home')} showAgentSelect={false} />;
      case 'agent-student-form':
        return <PersonalInfoForm onBackToHome={() => setCurrentPage('agent')} showAgentSelect={true} />;
      case 'agent':
        return <AgentPage onNavigate={setCurrentPage} onBackToHome={() => setCurrentPage('home')} />;
      case 'new-agent':
        return <AgentApplicationForm onBackToHome={() => setCurrentPage('agent')} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {renderCurrentPage()}
    </div>
  );
}

export default App;
