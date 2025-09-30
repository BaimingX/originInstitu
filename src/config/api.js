const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    // 本地开发环境 - 使用mock API
    return '';
  } else {
    // 生产环境 - Azure Static Web Apps
    return '';
  }
};

export const API_CONFIG = {
  baseUrl: getApiBaseUrl(),
  endpoints: {
    submitForm: '/api/submitForm',
    uploadFile: '/api/uploadFile'
  },
  timeout: 30000 // 30秒超时
};

// API调用函数
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  const config = {
    timeout: API_CONFIG.timeout,
    ...options
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}; 