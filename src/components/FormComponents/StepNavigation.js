import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const StepNavigation = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting = false,
  isValidating = false,
  canProceed = true,
  submitButtonText = "Submit Application"
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
      {/* Previous Button */}
      <div className="w-full sm:w-auto">
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrevious}
            disabled={isSubmitting || isValidating}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>
        )}
      </div>

      {/* Step Indicator for Mobile */}
      <div className="block sm:hidden text-sm text-gray-500 font-medium">
        Step {currentStep} of {totalSteps}
      </div>

      {/* Next/Submit Button */}
      <div className="w-full sm:w-auto">
        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || isValidating || !canProceed}
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                {submitButtonText}
                <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={isSubmitting || isValidating || !canProceed}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Validating...
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default StepNavigation;