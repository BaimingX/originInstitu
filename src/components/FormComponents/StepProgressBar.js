import React from 'react';

const StepProgressBar = ({ currentStep, completedSteps, onStepClick }) => {
  const steps = [
    { id: 1, title: 'Personal Info', mobileTitle: 'Personal' },
    { id: 2, title: 'Contact Details', mobileTitle: 'Contact' },
    { id: 3, title: 'Background', mobileTitle: 'Background' },
    { id: 4, title: 'Submit', mobileTitle: 'Submit' }
  ];

  const getStepStatus = (stepId) => {
    if (stepId === currentStep) return 'current';
    if (completedSteps.has(stepId)) return 'completed';
    return 'pending';
  };

  const getStepStyles = (status, stepId) => {
    const baseStyles = "flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-semibold text-sm md:text-base transition-all duration-300";

    switch (status) {
      case 'completed':
        return `${baseStyles} bg-green-500 text-white hover:bg-green-600 cursor-pointer`;
      case 'current':
        return `${baseStyles} bg-blue-500 text-white ring-2 ring-blue-300`;
      default:
        return `${baseStyles} bg-gray-300 text-gray-500`;
    }
  };


  const handleStepClick = (stepId) => {
    const status = getStepStatus(stepId);
    // 只允许点击已完成的步骤或当前步骤
    if (status === 'completed' || status === 'current') {
      onStepClick(stepId);
    }
  };

  return (
    <div className="w-full mb-8">
      {/* Mobile Progress Bar */}
      <div className="block md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {steps.find(s => s.id === currentStep)?.mobileTitle}
          </span>
        </div>

        {/* Mobile progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Mobile step dots */}
        <div className="flex justify-between mt-2">
          {steps.map((step) => {
            const status = getStepStatus(step.id);
            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                disabled={status === 'pending'}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  status === 'completed'
                    ? 'bg-green-500 hover:bg-green-600 cursor-pointer'
                    : status === 'current'
                    ? 'bg-blue-500 ring-2 ring-blue-300'
                    : 'bg-gray-300'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Desktop Progress Bar */}
      <div className="hidden md:block">
        <div className="max-w-3xl mx-auto">
          {/* Using CSS Grid for even distribution */}
          <div className="grid grid-cols-7 items-center gap-0">
            {/* Step 1 */}
            <div className="col-span-1 flex flex-col items-center">
              <button
                onClick={() => handleStepClick(steps[0].id)}
                disabled={getStepStatus(steps[0].id) === 'pending'}
                className={getStepStyles(getStepStatus(steps[0].id), steps[0].id)}
              >
                {getStepStatus(steps[0].id) === 'completed' ? (
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  steps[0].id
                )}
              </button>
              <span className={`mt-2 text-xs md:text-sm font-medium text-center ${
                getStepStatus(steps[0].id) === 'current' ? 'text-blue-600' :
                getStepStatus(steps[0].id) === 'completed' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {steps[0].title}
              </span>
            </div>

            {/* Connector 1 */}
            <div className="col-span-1 px-2">
              <div className={`h-1 w-full transition-all duration-300 ${
                getStepStatus(steps[0].id) === 'completed' ? 'bg-green-500' :
                getStepStatus(steps[1].id) === 'current' ? 'bg-gradient-to-r from-green-500 to-blue-500' :
                'bg-gray-300'
              }`} />
            </div>

            {/* Step 2 */}
            <div className="col-span-1 flex flex-col items-center">
              <button
                onClick={() => handleStepClick(steps[1].id)}
                disabled={getStepStatus(steps[1].id) === 'pending'}
                className={getStepStyles(getStepStatus(steps[1].id), steps[1].id)}
              >
                {getStepStatus(steps[1].id) === 'completed' ? (
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  steps[1].id
                )}
              </button>
              <span className={`mt-2 text-xs md:text-sm font-medium text-center ${
                getStepStatus(steps[1].id) === 'current' ? 'text-blue-600' :
                getStepStatus(steps[1].id) === 'completed' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {steps[1].title}
              </span>
            </div>

            {/* Connector 2 */}
            <div className="col-span-1 px-2">
              <div className={`h-1 w-full transition-all duration-300 ${
                getStepStatus(steps[1].id) === 'completed' ? 'bg-green-500' :
                getStepStatus(steps[2].id) === 'current' ? 'bg-gradient-to-r from-green-500 to-blue-500' :
                'bg-gray-300'
              }`} />
            </div>

            {/* Step 3 */}
            <div className="col-span-1 flex flex-col items-center">
              <button
                onClick={() => handleStepClick(steps[2].id)}
                disabled={getStepStatus(steps[2].id) === 'pending'}
                className={getStepStyles(getStepStatus(steps[2].id), steps[2].id)}
              >
                {getStepStatus(steps[2].id) === 'completed' ? (
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  steps[2].id
                )}
              </button>
              <span className={`mt-2 text-xs md:text-sm font-medium text-center ${
                getStepStatus(steps[2].id) === 'current' ? 'text-blue-600' :
                getStepStatus(steps[2].id) === 'completed' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {steps[2].title}
              </span>
            </div>

            {/* Connector 3 */}
            <div className="col-span-1 px-2">
              <div className={`h-1 w-full transition-all duration-300 ${
                getStepStatus(steps[2].id) === 'completed' ? 'bg-green-500' :
                getStepStatus(steps[3].id) === 'current' ? 'bg-gradient-to-r from-green-500 to-blue-500' :
                'bg-gray-300'
              }`} />
            </div>

            {/* Step 4 */}
            <div className="col-span-1 flex flex-col items-center">
              <button
                onClick={() => handleStepClick(steps[3].id)}
                disabled={getStepStatus(steps[3].id) === 'pending'}
                className={getStepStyles(getStepStatus(steps[3].id), steps[3].id)}
              >
                {getStepStatus(steps[3].id) === 'completed' ? (
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  steps[3].id
                )}
              </button>
              <span className={`mt-2 text-xs md:text-sm font-medium text-center ${
                getStepStatus(steps[3].id) === 'current' ? 'text-blue-600' :
                getStepStatus(steps[3].id) === 'completed' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {steps[3].title}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepProgressBar;