/**
 * Education Data Service
 * 处理从CRICOS API获取教育相关数据的服务
 */

const API_BASE_URL = process.env.REACT_APP_CRICOS_API_BASE_URL;
const API_USERNAME = process.env.REACT_APP_CRICOS_API_USERNAME;
const API_PASSWORD = process.env.REACT_APP_CRICOS_API_PASSWORD;

/**
 * 获取CRICOS API访问令牌
 * @returns {Promise<string>} 访问令牌
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
 * 从API获取学历级别选项
 * @returns {Promise<Array>} 学历级别选项数组
 */
export const fetchQualificationLevels = async () => {
  try {
    if (!API_BASE_URL || !API_USERNAME || !API_PASSWORD) {
      console.warn('CRICOS API credentials not configured, using fallback options');
      return getDefaultQualificationLevels();
    }

    // 获取访问令牌
    const accessToken = await getAccessToken();

    const response = await fetch(`${API_BASE_URL}/api/Classification/QualificationLevels`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Qualification Levels API error: ${response.status} ${errorText}`);
      return getDefaultQualificationLevels();
    }

    const data = await response.json();
    console.log('Qualification Levels API response:', data);

    // 将API数据转换为表单选项格式
    return data.map(item => ({
      value: item.Value,
      label: item.Name
    }));

  } catch (error) {
    console.error('Error fetching qualification levels:', error);
    return getDefaultQualificationLevels();
  }
};

/**
 * 从API获取学历认证类型选项
 * @returns {Promise<Array>} 学历认证类型选项数组
 */
export const fetchQualificationAchievementRecognitions = async () => {
  try {
    if (!API_BASE_URL || !API_USERNAME || !API_PASSWORD) {
      console.warn('CRICOS API credentials not configured, using fallback options');
      return getDefaultQualificationAchievementRecognitions();
    }

    // 获取访问令牌
    const accessToken = await getAccessToken();

    const response = await fetch(`${API_BASE_URL}/api/Classification/QualificationAchievementRecognitions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Qualification Achievement Recognitions API error: ${response.status} ${errorText}`);
      return getDefaultQualificationAchievementRecognitions();
    }

    const data = await response.json();
    console.log('Qualification Achievement Recognitions API response:', data);

    // 将API数据转换为表单选项格式
    return data.map(item => ({
      value: item.Value,
      label: item.Name
    }));

  } catch (error) {
    console.error('Error fetching qualification achievement recognitions:', error);
    return getDefaultQualificationAchievementRecognitions();
  }
};

/**
 * 获取默认学历级别选项（API不可用时的回退选项）
 * @returns {Array} 默认学历级别选项
 */
export const getDefaultQualificationLevels = () => {
  return [
    { value: '', label: 'Please select' },
    { value: '008', label: '008 - Bachelor Degree or Higher Degree Level' },
    { value: '410', label: '410 - Advanced Diploma or Associate Degree Level' },
    { value: '420', label: '420 - Diploma Level' },
    { value: '511', label: '511 - Certificate IV' },
    { value: '514', label: '514 - Certificate III' },
    { value: '521', label: '521 - Certificate II' },
    { value: '524', label: '524 - Certificate I' },
    { value: '990', label: '990 - Miscellaneous Education' }
  ];
};

/**
 * 获取默认学历认证类型选项（API不可用时的回退选项）
 * @returns {Array} 默认学历认证类型选项
 */
export const getDefaultQualificationAchievementRecognitions = () => {
  return [
    { value: '', label: 'Please select' },
    { value: 'A', label: 'A - Australian qualification' },
    { value: 'E', label: 'E - Australian equivalent' },
    { value: 'I', label: 'I - International' }
  ];
};

/**
 * 获取包含详细调试信息的学历级别数据
 * @returns {Promise<Object>} 响应对象包含成功状态、数据和调试信息
 */
export const fetchQualificationLevelsDetailed = async () => {
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
      const fallbackOptions = getDefaultQualificationLevels();
      response.data = fallbackOptions;
      return response;
    }

    // 获取访问令牌
    console.log('🔐 Getting CRICOS API access token...');
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained successfully');

    const apiUrl = `${API_BASE_URL}/api/Classification/QualificationLevels`;
    response.apiUrl = apiUrl;

    console.log('🔍 Calling CRICOS Qualification Levels API:', apiUrl);

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

      // 返回回退选项
      const fallbackOptions = getDefaultQualificationLevels();
      response.data = fallbackOptions.map(item => ({
        Name: item.label,
        Value: item.value
      }));
      return response;
    }

    const data = await fetchResponse.json();
    console.log('✅ CRICOS Qualification Levels API success:', data);

    response.success = true;
    response.data = data;
    response.source = 'cricos_api';
    response.status = fetchResponse.status;

    return response;

  } catch (error) {
    console.error('🚨 Error fetching qualification levels:', error);
    response.error = error.message;
    response.source = 'network_error';

    // 返回回退选项
    const fallbackOptions = getDefaultQualificationLevels();
    response.data = fallbackOptions.map(item => ({
      Name: item.label,
      Value: item.value
    }));
    return response;
  }
};

/**
 * 获取包含详细调试信息的学历认证类型数据
 * @returns {Promise<Object>} 响应对象包含成功状态、数据和调试信息
 */
export const fetchQualificationAchievementRecognitionsDetailed = async () => {
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
      const fallbackOptions = getDefaultQualificationAchievementRecognitions();
      response.data = fallbackOptions;
      return response;
    }

    // 获取访问令牌
    console.log('🔐 Getting CRICOS API access token...');
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained successfully');

    const apiUrl = `${API_BASE_URL}/api/Classification/QualificationAchievementRecognitions`;
    response.apiUrl = apiUrl;

    console.log('🔍 Calling CRICOS Qualification Achievement Recognitions API:', apiUrl);

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

      // 返回回退选项
      const fallbackOptions = getDefaultQualificationAchievementRecognitions();
      response.data = fallbackOptions.map(item => ({
        Name: item.label,
        Value: item.value
      }));
      return response;
    }

    const data = await fetchResponse.json();
    console.log('✅ CRICOS Qualification Achievement Recognitions API success:', data);

    response.success = true;
    response.data = data;
    response.source = 'cricos_api';
    response.status = fetchResponse.status;

    return response;

  } catch (error) {
    console.error('🚨 Error fetching qualification achievement recognitions:', error);
    response.error = error.message;
    response.source = 'network_error';

    // 返回回退选项
    const fallbackOptions = getDefaultQualificationAchievementRecognitions();
    response.data = fallbackOptions.map(item => ({
      Name: item.label,
      Value: item.value
    }));
    return response;
  }
};