/**
 * CRICOS API Service
 * Handles validation and submission of student offers to CRICOS API
 */

const API_BASE_URL = process.env.REACT_APP_CRICOS_API_BASE_URL;
const API_USERNAME = process.env.REACT_APP_CRICOS_API_USERNAME;
const API_PASSWORD = process.env.REACT_APP_CRICOS_API_PASSWORD;

/**
 * Parse CRICOS validation errors from different response formats
 */
const parseValidationErrors = (result) => {
  const errors = [];

  // Format 1: IsSuccess with itemList (CRICOS specific format)
  if (result.IsSuccess === false && result.itemList) {
    Object.entries(result.itemList).forEach(([code, message]) => {
      errors.push({
        field: `Error ${code}`,
        message: message,
        technical: `Code: ${code}`
      });
    });
  }

  // Format 2: ModelState errors (ASP.NET Web API format)
  if (result.ModelState) {
    Object.entries(result.ModelState).forEach(([fieldPath, messages]) => {
      const fieldName = fieldPath.replace(/^application\./, '').replace(/\[\d+\]/, '');
      messages.forEach(message => {
        errors.push({
          field: fieldName,
          message: message,
          technical: `Field: ${fieldPath}`
        });
      });
    });
  }

  // Format 3: General message
  if (result.Message && errors.length === 0) {
    errors.push({
      field: 'General',
      message: result.Message,
      technical: 'API Response Message'
    });
  }

  return errors;
};

/**
 * Get access token from CRICOS API
 * @returns {Promise<string>} Access token
 */
const getAccessToken = async () => {
  if (!API_BASE_URL || !API_USERNAME || !API_PASSWORD) {
    throw new Error('CRICOS API credentials not configured in environment variables');
  }

  const tokenUrl = `${API_BASE_URL}/token`;

  const formData = new URLSearchParams({
    grant_type: 'password',
    username: API_USERNAME,
    password: API_PASSWORD
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

/**
 * Validate student offer data
 * @param {Object} offerData - Student offer JSON data
 * @returns {Promise<Object>} Validation result
 */
export const validateStudentOffer = async (offerData) => {
  try {
    const token = await getAccessToken();
    const validateUrl = `${API_BASE_URL}/api/V1/StudentOffers/Validate`;

    const response = await fetch(validateUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/json'
      },
      body: JSON.stringify(offerData)
    });

    const result = await response.json();
    const parsedErrors = parseValidationErrors(result);

    return {
      success: response.ok && result.IsSuccess,
      status: response.status,
      data: result,
      errors: parsedErrors,
      message: result.IsSuccess ? 'Validation successful' : `Validation failed: ${parsedErrors.length} errors found`
    };
  } catch (error) {
    console.error('Error validating student offer:', error);
    return {
      success: false,
      status: 0,
      data: null,
      errors: [],
      message: `Validation error: ${error.message}`
    };
  }
};

/**
 * Submit student offer (for actual submission)
 * @param {Object} offerData - Student offer JSON data
 * @returns {Promise<Object>} Submission result
 */
export const submitStudentOffer = async (offerData) => {
  try {
    const token = await getAccessToken();
    const submitUrl = `${API_BASE_URL}/api/V1/StudentOffers`;

    const response = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/json'
      },
      body: JSON.stringify(offerData)
    });

    const result = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: result,
      message: response.ok ? 'Submission successful' : 'Submission failed'
    };
  } catch (error) {
    console.error('Error submitting student offer:', error);
    return {
      success: false,
      status: 0,
      data: null,
      message: `Submission error: ${error.message}`
    };
  }
};

/**
 * Test validation (validate only, no submit - like --validate --no-submit)
 * @param {Object} offerData - Student offer JSON data
 * @returns {Promise<Object>} Test validation result
 */
export const testValidateOffer = async (offerData) => {
  console.log('🧪 Testing validation for offer:', offerData?.OfferId || 'No OfferId');

  const result = await validateStudentOffer(offerData);

  console.log('🧪 Validation test result:', {
    success: result.success,
    status: result.status,
    message: result.message
  });

  return result;
};

/**
 * Complete submit flow: validate first, then submit if validation passes
 * This follows the submit_offer.py logic: --validate before submit
 * @param {Object} offerData - Student offer JSON data
 * @returns {Promise<Object>} Complete submission result
 */
export const submitOfferWithValidation = async (offerData) => {
  try {
    console.log('🚀 Starting submit flow for offer:', offerData?.OfferId || 'No OfferId');

    // Step 1: Validate first (like submit_offer.py --validate)
    console.log('📋 Step 1: Validating offer...');
    const validationResult = await validateStudentOffer(offerData);

    if (!validationResult.success) {
      console.log('❌ Validation failed, stopping submission');
      return {
        success: false,
        status: validationResult.status,
        stage: 'validation',
        data: validationResult.data,
        errors: validationResult.errors,
        message: `Validation failed: ${validationResult.errors.length} errors found`,
        validationResult: validationResult
      };
    }

    console.log('✅ Validation passed, proceeding to submit...');

    // Step 2: Submit if validation passed
    console.log('📤 Step 2: Submitting offer...');
    const submitResult = await submitStudentOffer(offerData);

    if (submitResult.success) {
      console.log('🎉 Submission completed successfully!');
      return {
        success: true,
        status: submitResult.status,
        stage: 'submission',
        data: submitResult.data,
        errors: [],
        message: 'Offer submitted successfully to CRICOS API',
        validationResult: validationResult,
        submissionResult: submitResult
      };
    } else {
      console.log('❌ Submission failed');
      return {
        success: false,
        status: submitResult.status,
        stage: 'submission',
        data: submitResult.data,
        errors: [],
        message: `Submission failed: ${submitResult.message}`,
        validationResult: validationResult,
        submissionResult: submitResult
      };
    }

  } catch (error) {
    console.error('🚨 Error in submit flow:', error);
    return {
      success: false,
      status: 0,
      stage: 'error',
      data: null,
      errors: [],
      message: `Submit flow error: ${error.message}`,
      error: error.message
    };
  }
};