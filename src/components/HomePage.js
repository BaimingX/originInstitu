import React, { useState, useEffect, useRef, useCallback } from 'react';
import logoImage from '../image/Origin_logo.jpg';

const HomePage = ({ onNavigate }) => {
  const [scrollY, setScrollY] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const touchStartY = useRef(0);
  const lastWheelTime = useRef(0);

  // 平滑滚动到指定部分
  const scrollToSection = useCallback((sectionIndex) => {
    if (isScrolling) return;

    setIsScrolling(true);
    const targetY = sectionIndex * window.innerHeight;

    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });

    setTimeout(() => {
      setIsScrolling(false);
    }, 800);
  }, [isScrolling]);

  // 处理鼠标滚轮事件
  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrolling) return;

      const now = Date.now();
      if (now - lastWheelTime.current < 800) return; // 节流，800ms内只响应一次

      lastWheelTime.current = now;
      e.preventDefault();

      if (e.deltaY > 0 && currentSection === 0) {
        // 向下滚动到第二屏
        setCurrentSection(1);
        scrollToSection(1);
      } else if (e.deltaY < 0 && currentSection === 1) {
        // 向上滚动到第一屏
        setCurrentSection(0);
        scrollToSection(0);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentSection, isScrolling, scrollToSection]);

  // 处理触摸事件（移动端）
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (isScrolling) return;

      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY.current - touchEndY;
      const threshold = 50; // 最小滑动距离

      if (Math.abs(diff) > threshold) {
        if (diff > 0 && currentSection === 0) {
          // 向上滑动（手指向上移动）到第二屏
          setCurrentSection(1);
          scrollToSection(1);
        } else if (diff < 0 && currentSection === 1) {
          // 向下滑动（手指向下移动）到第一屏
          setCurrentSection(0);
          scrollToSection(0);
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentSection, isScrolling, scrollToSection]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      // 更新当前部分和按钮显示状态
      const newSection = Math.round(currentScrollY / window.innerHeight);
      setCurrentSection(newSection);
      setShowButtons(currentScrollY > window.innerHeight * 0.3);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentSection(0);
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 第一屏 - Hero Section */}
      <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
        {/* 背景装饰元素 */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <div className="absolute top-20 left-20 w-64 h-64 bg-indigo-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full blur-3xl"></div>
        </div>

        {/* Logo区域 */}
        <div 
          className="mb-16 z-10"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            opacity: Math.max(0, 1 - scrollY / 500),
          }}
        >
          <img 
            src={logoImage} 
            alt="Origin Institute Logo" 
            className="h-20 w-auto object-contain mx-auto"
          />
        </div>

        {/* 主标题区域 */}
        <div
          className="text-center z-10 px-4 sm:px-6"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
            opacity: Math.max(0, 1 - scrollY / 400),
          }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8 tracking-wide leading-tight">
            Origin Institute Online Application Form
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 md:mb-12">
            Choose your portal to continue
          </p>
        </div>

        {/* 滚动提示 */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          style={{
            opacity: Math.max(0, 1 - scrollY / 200),
          }}
        >
          <div
            className="flex flex-col items-center text-gray-500 cursor-pointer hover:text-gray-700 transition-colors duration-300 group"
            onClick={() => {
              setCurrentSection(1);
              scrollToSection(1);
            }}
          >
            <span className="text-base sm:text-lg font-medium mb-4 md:text-xl">Click or scroll to explore</span>
            <div className="animate-bounce group-hover:animate-pulse">
              <svg className="w-8 h-8 md:w-10 md:h-10 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 第二屏 - 选择按钮区域 */}
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 relative">
        {/* 标题 */}
        <div
          className={`absolute top-12 sm:top-16 md:top-20 left-1/2 transform -translate-x-1/2 text-center transition-all duration-1000 px-4 sm:px-6 ${
            showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">
            Choose Your
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">
            Select the option that best describes you
          </p>
        </div>

        {/* 按钮容器 */}
        <div
          className={`w-full max-w-6xl mx-auto transition-all duration-1000 delay-300 ${
            showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-16 max-w-5xl mx-auto">
            {/* Agent卡片 */}
            <div
              onClick={() => onNavigate('agent')}
              className={`group cursor-pointer bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-16 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-indigo-200 transform hover:scale-105 active:scale-95 min-h-[280px] sm:min-h-[320px] ${
                showButtons ? 'animate-fade-in-left' : ''
              }`}
              style={{
                transform: `translateY(${Math.max(0, (scrollY - 400) * -0.1)}px)`,
              }}
            >
              <div className="text-center h-full flex flex-col justify-between">
                <div>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-10 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6">Agent</h3>
                  <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 sm:mb-6 md:mb-10 leading-relaxed px-2">
                    Submit your application via agent at Origin Institute
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="inline-flex items-center text-indigo-600 font-semibold text-base sm:text-lg md:text-xl group-hover:text-indigo-700">
                    Continue as Agent
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2 sm:ml-3 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Student卡片 */}
            <div
              onClick={() => onNavigate('student-form')}
              className={`group cursor-pointer bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-16 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 transform hover:scale-105 active:scale-95 min-h-[280px] sm:min-h-[320px] ${
                showButtons ? 'animate-fade-in-right' : ''
              }`}
              style={{
                transform: `translateY(${Math.max(0, (scrollY - 400) * -0.15)}px)`,
              }}
            >
              <div className="text-center h-full flex flex-col justify-between">
                <div>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-10 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6">Student</h3>
                  <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 sm:mb-6 md:mb-10 leading-relaxed px-2">
                    Submit your application for Long Course programs at Origin Institute
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="inline-flex items-center text-green-600 font-semibold text-base sm:text-lg md:text-xl group-hover:text-green-700">
                    Continue as Student
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2 sm:ml-3 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部信息 */}
        <div
          className={`absolute bottom-6 sm:bottom-8 md:bottom-20 left-1/2 transform -translate-x-1/2 text-center transition-all duration-1000 delay-700 px-4 sm:px-6 ${
            showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-1 sm:mb-2 md:mb-4">
            Origin Institute Online Application Form
          </p>
          <p className="text-xs sm:text-xs md:text-sm text-gray-400">
            © 2024 Origin Institute. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 