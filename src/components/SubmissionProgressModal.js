import React from 'react';
import { Check, X, Loader, AlertCircle, FileText, Send, CheckCircle } from 'lucide-react';

const SUBMISSION_STEPS = [
  {
    id: 'preparing',
    label: 'Preparing submission data',
    icon: FileText,
    description: 'Validating and formatting application data'
  },
  {
    id: 'cricos-validation',
    label: 'CRICOS validation',
    icon: AlertCircle,
    description: 'Validating course and qualification details'
  },
  {
    id: 'cricos-submission',
    label: 'CRICOS submission',
    icon: Send,
    description: 'Submitting application to CRICOS system'
  },
  {
    id: 'power-automate',
    label: 'Power Automate processing',
    icon: Send,
    description: 'Processing application through Power Automate workflow'
  },
  {
    id: 'file-forwarding',
    label: 'File forwarding',
    icon: FileText,
    description: 'Forwarding uploaded documents via email'
  },
  {
    id: 'completion',
    label: 'Submission complete',
    icon: CheckCircle,
    description: 'Application submitted successfully'
  }
];

const StepStatus = ({ status }) => {
  switch (status) {
    case 'completed':
      return <Check className="w-5 h-5 text-green-600" />;
    case 'in-progress':
      return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
    case 'error':
      return <X className="w-5 h-5 text-red-600" />;
    default:
      return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
  }
};

const StepIcon = ({ step, status }) => {
  const IconComponent = step.icon;
  const baseClasses = "w-6 h-6";

  switch (status) {
    case 'completed':
      return <IconComponent className={`${baseClasses} text-green-600`} />;
    case 'in-progress':
      return <IconComponent className={`${baseClasses} text-blue-600`} />;
    case 'error':
      return <IconComponent className={`${baseClasses} text-red-600`} />;
    default:
      return <IconComponent className={`${baseClasses} text-gray-400`} />;
  }
};

const SubmissionProgressModal = ({
  isOpen,
  onClose,
  currentStep,
  stepStatuses,
  errors,
  isComplete
}) => {
  if (!isOpen) return null;

  const hasErrors = Object.values(errors || {}).some(error => error);
  const canClose = isComplete || hasErrors;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isComplete && !hasErrors ? 'Submission Complete' : 'Submitting Application'}
            </h2>
            {isComplete && !hasErrors ? (
              <p className="text-green-600 text-sm">
                Your application has been submitted successfully. You may now close this page.
              </p>
            ) : hasErrors ? (
              <p className="text-red-600 text-sm">
                There were errors during submission. Please review and try again.
              </p>
            ) : (
              <p className="text-gray-600 text-sm">
                Please wait while we process your application...
              </p>
            )}
          </div>

          <div className="space-y-4">
            {SUBMISSION_STEPS.map((step, index) => {
              const status = stepStatuses[step.id] || 'pending';
              const stepError = errors?.[step.id];

              return (
                <div key={step.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <StepIcon step={step} status={status} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        status === 'completed' ? 'text-green-600' :
                        status === 'in-progress' ? 'text-blue-600' :
                        status === 'error' ? 'text-red-600' :
                        'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                      <StepStatus status={status} />
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </p>

                    {stepError && (
                      <div className="mt-2">
                        {typeof stepError === 'object' && stepError.details && stepError.details.length > 0 ? (
                          <div className="bg-red-50 border border-red-200 rounded p-3">
                            <div className="flex justify-between items-center mb-2">
                              <strong className="text-red-800 text-sm">
                                CRICOS Validation Errors ({stepError.details.length})
                              </strong>
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {stepError.details.map((error, index) => (
                                <div key={index} className="border-l-2 border-red-400 bg-white p-2 rounded-r text-xs">
                                  <div className="flex items-start space-x-2">
                                    <span className="inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                                      {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium text-red-800 text-xs">{error.field}</h5>
                                      <p className="text-red-700 text-xs mt-1">{error.message}</p>
                                      {error.technical && (
                                        <details className="mt-1">
                                          <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                                            Technical Details
                                          </summary>
                                          <p className="mt-1 text-xs text-gray-600 font-mono bg-gray-100 p-1 rounded">
                                            {error.technical}
                                          </p>
                                        </details>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            <strong>Error:</strong> {typeof stepError === 'object' ? stepError.message : stepError}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {canClose && (
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  isComplete && !hasErrors
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {isComplete && !hasErrors ? 'Close' : 'Close and Retry'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionProgressModal;