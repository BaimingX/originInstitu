/**
 * Occupation Codes Service
 * 处理从CRICOS API获取职业代码数据的服务
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
 * 从API获取职业代码选项
 * @returns {Promise<Array>} 职业代码选项数组
 */
export const fetchOccupationCodes = async () => {
  try {
    if (!API_BASE_URL || !API_USERNAME || !API_PASSWORD) {
      console.warn('CRICOS API credentials not configured, using fallback options');
      return getDefaultOccupationCodes();
    }

    // 获取访问令牌
    const accessToken = await getAccessToken();

    const response = await fetch(`${API_BASE_URL}/api/Classification/OccupationCodes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Occupation Codes API error: ${response.status} ${errorText}`);
      return getDefaultOccupationCodes();
    }

    const data = await response.json();
    console.log('Occupation Codes API response:', data);

    // 将API数据转换为表单选项格式
    return data.map(item => ({
      value: item.Value,
      label: item.Name
    }));

  } catch (error) {
    console.error('Error fetching occupation codes:', error);
    return getDefaultOccupationCodes();
  }
};

/**
 * 获取默认职业代码选项（API不可用时的回退选项）
 * @returns {Array} 默认职业代码选项
 */
export const getDefaultOccupationCodes = () => {
  return [
    { value: '', label: '  - Not specified' },
    { value: '1', label: '1 - Manager' },
    { value: '2', label: '2 - Professionals' },
    { value: '3', label: '3 - Technicians and Trades Workers' },
    { value: '4', label: '4 - Community and personal Service Workers' },
    { value: '5', label: '5 - Clerical and Administrative Workers' },
    { value: '6', label: '6 - Sales Workers' },
    { value: '7', label: '7 - Machinery Operators and Drivers' },
    { value: '8', label: '8 - Labourers' },
    { value: '9', label: '9 - Other' }
  ];
};

/**
 * 获取包含详细调试信息的职业代码数据
 * @returns {Promise<Object>} 响应对象包含成功状态、数据和调试信息
 */
export const fetchOccupationCodesDetailed = async () => {
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
      const fallbackOptions = getDefaultOccupationCodes();
      response.data = fallbackOptions;
      return response;
    }

    // 获取访问令牌
    console.log('🔐 Getting CRICOS API access token...');
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained successfully');

    const apiUrl = `${API_BASE_URL}/api/Classification/OccupationCodes`;
    response.apiUrl = apiUrl;

    console.log('🔍 Calling CRICOS Occupation Codes API:', apiUrl);

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
      const fallbackOptions = getDefaultOccupationCodes();
      response.data = fallbackOptions.map(item => ({
        Name: item.label,
        Value: item.value
      }));
      return response;
    }

    const data = await fetchResponse.json();
    console.log('✅ CRICOS Occupation Codes API success:', data);

    response.success = true;
    response.data = data;
    response.source = 'cricos_api';
    response.status = fetchResponse.status;

    return response;

  } catch (error) {
    console.error('🚨 Error fetching occupation codes:', error);
    response.error = error.message;
    response.source = 'network_error';

    // 返回回退选项
    const fallbackOptions = getDefaultOccupationCodes();
    response.data = fallbackOptions.map(item => ({
      Name: item.label,
      Value: item.value
    }));
    return response;
  }
};