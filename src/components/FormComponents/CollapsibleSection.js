import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CollapsibleSection = ({
  title,
  children,
  defaultOpen = false,
  description = null,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`mb-6 ${className}`}>
      {/* Header/Title Bar */}
      <div
        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={toggleOpen}
      >
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {/* Title and Description */}
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{title}</h3>
              {description && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">{description}</p>
              )}
            </div>
          </div>

          {/* Expand/Collapse Indicator */}
          <div className="flex items-center flex-shrink-0">
            {/* Arrow Icon */}
            {isOpen ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen
          ? 'max-h-[5000px] opacity-100 mt-4'
          : 'max-h-0 opacity-0'
        }`}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;