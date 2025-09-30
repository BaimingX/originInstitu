/**
 * Industry of Employment Service
 * 处理从CRICOS API获取就业行业数据的服务
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
 * 从API获取就业行业选项
 * @returns {Promise<Array>} 就业行业选项数组
 */
export const fetchIndustryOfEmployments = async () => {
  try {
    if (!API_BASE_URL || !API_USERNAME || !API_PASSWORD) {
      console.warn('CRICOS API credentials not configured, using fallback options');
      return getDefaultIndustryOfEmployments();
    }

    // 获取访问令牌
    const accessToken = await getAccessToken();

    const response = await fetch(`${API_BASE_URL}/api/Classification/IndustryOfEmployments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Industry of Employments API error: ${response.status} ${errorText}`);
      return getDefaultIndustryOfEmployments();
    }

    const data = await response.json();
    console.log('Industry of Employments API response:', data);

    // 将API数据转换为表单选项格式
    return data.map(item => ({
      value: item.Value,
      label: item.Name
    }));

  } catch (error) {
    console.error('Error fetching industry of employments:', error);
    return getDefaultIndustryOfEmployments();
  }
};

/**
 * 获取默认就业行业选项（API不可用时的回退选项）
 * @returns {Array} 默认就业行业选项
 */
export const getDefaultIndustryOfEmployments = () => {
  return [
    { value: '', label: '  - Not specified' },
    { value: 'A', label: 'A - Agriculture, Forestry and Fishing' },
    { value: 'B', label: 'B - Mining' },
    { value: 'C', label: 'C - Manufacturing' },
    { value: 'D', label: 'D - Electricity, Gas, Water and Waste Services' },
    { value: 'E', label: 'E - Construction' },
    { value: 'F', label: 'F - Wholesale Trade' },
    { value: 'G', label: 'G - Retail Trade' },
    { value: 'H', label: 'H - Accommodation and Food Services' },
    { value: 'I', label: 'I - Transport, Postal and Warehousing' },
    { value: 'J', label: 'J - Information Media and telecommunications' },
    { value: 'K', label: 'K - Financial and Insurance Services' },
    { value: 'L', label: 'L - Rental, Hiring and real Estate Services' },
    { value: 'M', label: 'M - Professional, Scientific and Technical Services' },
    { value: 'N', label: 'N - Administrative and Support Services' },
    { value: 'O', label: 'O - Public Administration and Safety' },
    { value: 'P', label: 'P - Education and Training' },
    { value: 'Q', label: 'Q - Health Care and Social Assistance' },
    { value: 'R', label: 'R - Arts and recreation Services' },
    { value: 'S', label: 'S - Other Services' }
  ];
};

/**
 * 获取包含详细调试信息的就业行业数据
 * @returns {Promise<Object>} 响应对象包含成功状态、数据和调试信息
 */
export const fetchIndustryOfEmploymentsDetailed = async () => {
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
      const fallbackOptions = getDefaultIndustryOfEmployments();
      response.data = fallbackOptions;
      return response;
    }

    // 获取访问令牌
    console.log('🔐 Getting CRICOS API access token...');
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained successfully');

    const apiUrl = `${API_BASE_URL}/api/Classification/IndustryOfEmployments`;
    response.apiUrl = apiUrl;

    console.log('🔍 Calling CRICOS Industry of Employments API:', apiUrl);

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
      const fallbackOptions = getDefaultIndustryOfEmployments();
      response.data = fallbackOptions.map(item => ({
        Name: item.label,
        Value: item.value
      }));
      return response;
    }

    const data = await fetchResponse.json();
    console.log('✅ CRICOS Industry of Employments API success:', data);

    response.success = true;
    response.data = data;
    response.source = 'cricos_api';
    response.status = fetchResponse.status;

    return response;

  } catch (error) {
    console.error('🚨 Error fetching industry of employments:', error);
    response.error = error.message;
    response.source = 'network_error';

    // 返回回退选项
    const fallbackOptions = getDefaultIndustryOfEmployments();
    response.data = fallbackOptions.map(item => ({
      Name: item.label,
      Value: item.value
    }));
    return response;
  }
};