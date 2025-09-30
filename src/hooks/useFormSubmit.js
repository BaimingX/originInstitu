import { useState } from 'react';
import { submitFormData } from '../services/mockApi';
import { submitToPowerAutomate, isStudentFlowConfigured, isAgentFlowConfigured } from '../services/powerAutomateService';
import { mapFormDataToJSON, validateMappedData, formatJSONForDisplay } from '../services/formDataMapper';

export const useFormSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    type: '', // 'success', 'error', ''
    message: ''
  });
  const [mappedJSON, setMappedJSON] = useState(null);

  const submitForm = async (formData, files) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      // Step 1: Map form data to required JSON structure
      console.log('Mapping form data to JSON structure...');
      const mappedData = mapFormDataToJSON(formData);
      setMappedJSON(mappedData);

      // Step 2: Validate mapped data
      const validation = validateMappedData(mappedData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Step 3: Log JSON for debugging (optional)
      console.log('Mapped JSON Data:', formatJSONForDisplay(mappedData));

      let result;

      // Step 4: Check Power Automate configuration
      const isFormTypeAgent = formData.formType === 'agent-application';
      const isPowerAutomateConfigured = isFormTypeAgent
        ? isAgentFlowConfigured()
        : isStudentFlowConfigured();

      if (isPowerAutomateConfigured) {
        // Use Power Automate with mapped JSON data
        console.log('Submitting to Power Automate with JSON structure...');

        // Create FormData with JSON structure
        const submitData = new FormData();

        // Add the complete JSON structure
        submitData.append('jsonData', JSON.stringify(mappedData));

        // Add individual fields for backward compatibility
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined) {
            submitData.append(key, String(formData[key]));
          }
        });

        // Add files
        files.forEach((file, index) => {
          submitData.append(`file${index}`, file);
        });

        result = await submitToPowerAutomate(submitData, files);
      } else {
        // Fallback to mock API with JSON structure
        console.log('Power Automate not configured, using mock API with JSON structure...');

        // Create submission data for mock API
        const submitData = new FormData();

        // Add the complete JSON structure
        submitData.append('jsonData', JSON.stringify(mappedData));

        // Add legacy form fields for backward compatibility
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined) {
            submitData.append(key, String(formData[key]));
          }
        });

        // Add files
        files.forEach((file, index) => {
          submitData.append(`file${index}`, file);
        });

        result = await submitFormData(submitData);
      }

      setSubmitStatus({
        type: 'success',
        message: result.message || 'Form submitted successfully with JSON structure!'
      });

      return { ...result, mappedJSON: mappedData };
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Submission failed, please try again'
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // New function to preview JSON before submission
  const previewJSON = (formData) => {
    try {
      const mappedData = mapFormDataToJSON(formData);
      const validation = validateMappedData(mappedData);

      return {
        jsonData: mappedData,
        formattedJSON: formatJSONForDisplay(mappedData),
        validation
      };
    } catch (error) {
      console.error('JSON preview error:', error);
      return {
        jsonData: null,
        formattedJSON: null,
        validation: { isValid: false, errors: [error.message] }
      };
    }
  };

  // 检查是否使用Power Automate模式
  const isPowerAutomateMode = isStudentFlowConfigured() || isAgentFlowConfigured();

  return {
    isSubmitting,
    submitStatus,
    submitForm,
    previewJSON,
    mappedJSON,
    clearStatus: () => setSubmitStatus({ type: '', message: '' }),
    isPowerAutomateMode
  };
}; 