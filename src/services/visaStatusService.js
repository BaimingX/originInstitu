/**
 * Visa Status Service
 * Handles fetching visa types/statuses from CRICOS API
 */

const API_BASE_URL = process.env.REACT_APP_CRICOS_API_BASE_URL;
const API_USERNAME = process.env.REACT_APP_CRICOS_API_USERNAME;
const API_PASSWORD = process.env.REACT_APP_CRICOS_API_PASSWORD;

/**
 * Get access token from CRICOS API
 * @returns {Promise<string>} Access token
 */
const getAccessToken = async () => {
  if (!API_BASE_URL || !API_USERNAME || !API_PASSWORD) {
    throw new Error('CRICOS API credentials not configured');
  }

  const tokenUrl = `${API_BASE_URL}/token`;
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=password&username=${encodeURIComponent(API_USERNAME)}&password=${encodeURIComponent(API_PASSWORD)}`
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.access_token) {
    throw new Error('No access token in response');
  }

  return data.access_token;
};

/**
 * Fetches visa statuses based on student origin
 * @param {string} origin - Student origin (e.g., "OverseasStudent")
 * @returns {Promise<Array>} Array of visa status options
 */
export const fetchVisaStatuses = async (origin = "OverseasStudent") => {
  try {
    if (!API_BASE_URL || !API_USERNAME || !API_PASSWORD) {
      throw new Error('CRICOS API credentials not configured');
    }

    // Get access token
    const accessToken = await getAccessToken();

    const response = await fetch(`${API_BASE_URL}/api/Classification/VisaStatuses?Origin=${encodeURIComponent(origin)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch visa statuses: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Visa statuses response:', data);

    return data;
  } catch (error) {
    console.error('Error fetching visa statuses:', error);
    throw error;
  }
};

/**
 * Get default visa status options (fallback when API is not available)
 * @returns {Array} Default visa status options
 */
export const getDefaultVisaStatuses = () => {
  return [
    { value: '', label: 'Please select visa type/status' },
    { value: 'Student Visa (500)', label: 'Student Visa (500)' },
    { value: 'Tourist Visa (600)', label: 'Tourist Visa (600)' },
    { value: 'Working Holiday Visa (417)', label: 'Working Holiday Visa (417)' },
    { value: 'Work and Holiday Visa (462)', label: 'Work and Holiday Visa (462)' },
    { value: 'Temporary Graduate Visa (485)', label: 'Temporary Graduate Visa (485)' },
    { value: 'Other', label: 'Other' }
  ];
};

/**
 * Enhanced fetch visa statuses with detailed debugging information
 * @param {string} origin - Student origin
 * @returns {Promise<Object>} Response with success status and data
 */
export const fetchVisaStatusesDetailed = async (origin = "OverseasStudent") => {
  const response = {
    success: false,
    data: null,
    error: null,
    source: 'unknown',
    apiUrl: '',
    credentials: {
      username: !!API_USERNAME,
      password: !!API_PASSWORD,
      baseUrl: !!API_BASE_URL
    },
    timestamp: new Date().toISOString()
  };

  try {
    if (!API_USERNAME || !API_PASSWORD || !API_BASE_URL) {
      response.error = 'CRICOS API credentials not configured';
      response.source = 'configuration_error';
      const fallbackOptions = getDefaultVisaStatuses();
      response.data = fallbackOptions;
      return response;
    }

    // First, get access token
    console.log('🔐 Getting CRICOS API access token...');
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained successfully');

    const apiUrl = `${API_BASE_URL}/api/Classification/VisaStatuses?Origin=${encodeURIComponent(origin)}`;
    response.apiUrl = apiUrl;

    console.log('🔍 Calling CRICOS Visa Statuses API:', apiUrl);

    const fetchResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('📊 API Response Status:', fetchResponse.status);
    console.log('📊 API Response Headers:', Object.fromEntries(fetchResponse.headers.entries()));

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      response.error = `API request failed: ${fetchResponse.status} ${errorText}`;
      response.source = 'api_error';
      response.status = fetchResponse.status;
      console.error('❌ CRICOS API Error:', response.error);

      // Return fallback options with error info
      const fallbackOptions = getDefaultVisaStatuses();
      response.data = fallbackOptions;
      return response;
    }

    const data = await fetchResponse.json();
    console.log('✅ CRICOS Visa Statuses API success:', data);

    response.success = true;
    response.data = data;
    response.source = 'cricos_api';
    response.status = fetchResponse.status;

    return response;

  } catch (error) {
    console.error('🚨 Error fetching visa statuses:', error);
    response.error = error.message;
    response.source = 'network_error';

    // Return fallback options with error info
    const fallbackOptions = getDefaultVisaStatuses();
    response.data = fallbackOptions;
    return response;
  }
};