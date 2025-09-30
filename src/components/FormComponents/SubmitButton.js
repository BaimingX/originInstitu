import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const SubmitButton = ({ isSubmitting, submitStatus }) => {
  const getButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 size={20} className="animate-spin" />
          <span>Submitting...</span>
        </>
      );
    }

    if (submitStatus.type === 'success') {
      return (
        <>
          <CheckCircle size={20} />
          <span>Submitted Successfully</span>
        </>
      );
    }

    if (submitStatus.type === 'error') {
      return (
        <>
          <AlertCircle size={20} />
          <span>Submission Failed</span>
        </>
      );
    }

    return <span>Submit Application</span>;
  };

  const getButtonStyle = () => {
    if (isSubmitting) {
      return 'bg-gray-400 cursor-not-allowed';
    }

    if (submitStatus.type === 'success') {
      return 'bg-success-green hover:bg-green-600';
    }

    if (submitStatus.type === 'error') {
      return 'bg-error-red hover:bg-red-600';
    }

    return 'bg-primary-blue hover:bg-primary-blue-hover';
  };

  return (
    <div className="space-y-4">
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex items-center justify-center space-x-2 px-6 py-3 text-white font-medium rounded-lg transition-colors ${getButtonStyle()}`}
      >
        {getButtonContent()}
      </button>

      {submitStatus.message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            submitStatus.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : submitStatus.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : ''
          }`}
        >
          {submitStatus.message}
        </div>
      )}
    </div>
  );
};

export default SubmitButton; 