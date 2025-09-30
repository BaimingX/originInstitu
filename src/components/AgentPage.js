import React from 'react';
import { ArrowLeft } from 'lucide-react';
import logoImage from '../image/Origin_logo.jpg';

const AgentPage = ({ onNavigate, onBackToHome }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 顶部区域 */}
      <div className="w-full pt-8 pb-4">
        {/* 返回按钮 */}
        {onBackToHome && (
          <div className="absolute top-8 left-8 z-10">
            <button
              onClick={onBackToHome}
              className="flex items-center space-x-3 text-gray-600 hover:text-gray-800 transition-colors text-lg bg-white px-6 py-3 rounded-full shadow-md hover:shadow-lg"
            >
              <ArrowLeft size={24} />
              <span className="font-medium">Back</span>
            </button>
          </div>
        )}
        
        {/* Logo居中 */}
        <div className="flex justify-center">
          <img 
            src={logoImage} 
            alt="Origin Institute Logo" 
            className="h-16 w-auto object-contain"
          />
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex items-center justify-center px-8" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div className="w-full max-w-6xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-20">
            <h1 className="text-6xl font-bold text-gray-800 mb-8 tracking-wide">
              Agent
            </h1>
            <h2 className="text-4xl font-semibold text-indigo-600 mb-6">
              Select Agent Type
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Choose your agent category to access the appropriate management tools
            </p>
          </div>

          {/* 按钮容器 - 卡片式设计 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Current Agent卡片 */}
            <div
              onClick={() => onNavigate('agent-student-form')}
              className="group cursor-pointer bg-white rounded-2xl p-12 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:scale-105"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Current Agent</h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Access new student application via agent
                </p>
                <div className="inline-flex items-center text-blue-600 font-semibold text-lg group-hover:text-blue-700">
                  Access Application
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* New Agent卡片 */}
            <div
              onClick={() => onNavigate('new-agent')}
              className="group cursor-pointer bg-white rounded-2xl p-12 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200 transform hover:scale-105"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-purple-200 transition-colors">
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">New Agent</h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Register as a new agent 
                </p>
                <div className="inline-flex items-center text-purple-600 font-semibold text-lg group-hover:text-purple-700">
                  Register Now
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 底部信息 */}
          <div className="text-center mt-20">
            <p className="text-lg text-gray-500 mb-4">
              Long Course Student Application System - Agent Portal
            </p>
            <p className="text-sm text-gray-400">
              © 2024 Origin Institute. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPage; 