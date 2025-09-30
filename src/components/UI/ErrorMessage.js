import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`flex items-center space-x-2 text-error-red text-sm ${className}`}>
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage; 