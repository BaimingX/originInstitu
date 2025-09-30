import React, { useState } from 'react';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_CRICOS_API_BASE_URL;
const API_USERNAME = process.env.REACT_APP_CRICOS_API_USERNAME;
const API_PASSWORD = process.env.REACT_APP_CRICOS_API_PASSWORD;

/**
 * 获取CRICOS API访问令牌
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
 * 通用API测试组件
 */
const ApiTester = ({ isOpen, onClose }) => {
  const [apiEndpoint, setApiEndpoint] = useState('api/Classification/EmploymentStatuses');
  const [queryParams, setQueryParams] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [showResponse, setShowResponse] = useState(false);

  const handleTestApi = async () => {
    setIsTesting(true);
    setApiResponse(null);

    try {
      toast.loading(`正在测试API: ${apiEndpoint}...`, { id: 'api-test' });

      // 检查配置
      if (!API_USERNAME || !API_PASSWORD || !API_BASE_URL) {
        const errorResponse = {
          success: false,
          error: 'CRICOS API配置缺失',
          source: 'configuration_error',
          timestamp: new Date().toISOString()
        };
        setApiResponse(errorResponse);
        toast.error('⚠️ CRICOS API配置缺失', { id: 'api-test' });
        setShowResponse(true);
        return;
      }

      // 获取访问令牌
      console.log('🔐 正在获取CRICOS API访问令牌...');
      const accessToken = await getAccessToken();
      console.log('✅ 访问令牌获取成功');

      // 构建完整的API URL
      let fullUrl = `${API_BASE_URL}/${apiEndpoint.replace(/^\//, '')}`;
      if (queryParams.trim()) {
        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl += separator + queryParams.trim();
      }

      console.log('🔍 调用CRICOS API:', fullUrl);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('📊 API响应状态:', response.status);
      console.log('📊 API响应头:', Object.fromEntries(response.headers.entries()));

      const responseData = {
        success: response.ok,
        status: response.status,
        url: fullUrl,
        timestamp: new Date().toISOString(),
        headers: Object.fromEntries(response.headers.entries())
      };

      if (response.ok) {
        const data = await response.json();
        responseData.data = data;
        responseData.source = 'cricos_api';
        console.log('✅ CRICOS API调用成功:', data);

        toast.success(`✅ API调用成功！状态码: ${response.status}`, { id: 'api-test' });
      } else {
        const errorText = await response.text();
        responseData.error = `API请求失败: ${response.status} ${errorText}`;
        responseData.source = 'api_error';
        console.error('❌ CRICOS API错误:', responseData.error);

        toast.error(`❌ API调用失败 (${response.status})`, { id: 'api-test' });
      }

      setApiResponse(responseData);
      setShowResponse(true);

    } catch (error) {
      console.error('🚨 API测试错误:', error);

      const errorResponse = {
        success: false,
        error: error.message,
        source: 'network_error',
        timestamp: new Date().toISOString()
      };

      setApiResponse(errorResponse);
      setShowResponse(true);

      toast.error(`❌ 网络错误: ${error.message}`, { id: 'api-test' });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🧪 CRICOS API 测试工具</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* API端点输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API端点路径:
              </label>
              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如: api/Classification/EmploymentStatuses"
              />
              <p className="text-xs text-gray-500 mt-1">
                基础URL: {API_BASE_URL || '(未配置)'}
              </p>
            </div>

            {/* 查询参数输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                查询参数 (可选):
              </label>
              <input
                type="text"
                value={queryParams}
                onChange={(e) => setQueryParams(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如: Origin=OverseasStudent&limit=10"
              />
              <p className="text-xs text-gray-500 mt-1">
                不需要包含问号(?)，多个参数用&连接
              </p>
            </div>

            {/* 测试按钮 */}
            <button
              onClick={handleTestApi}
              disabled={isTesting || !apiEndpoint.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isTesting ? '🧪 正在测试...' : '🚀 测试 API'}
            </button>

            {/* API响应显示 */}
            {showResponse && apiResponse && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">API 响应结果:</h3>

                {/* 状态摘要 */}
                <div className="mb-4 p-3 rounded-md bg-white border">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">状态:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        apiResponse.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {apiResponse.success ? '成功' : '失败'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">HTTP状态:</span>
                      <span className="ml-2">{apiResponse.status || 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">请求URL:</span>
                      <span className="ml-2 text-blue-600 break-all">{apiResponse.url}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">时间:</span>
                      <span className="ml-2">{apiResponse.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* 详细响应数据 */}
                <div className="bg-gray-800 text-green-400 p-4 rounded-md overflow-auto max-h-96">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>

                {/* 数据摘要 */}
                {apiResponse.success && apiResponse.data && Array.isArray(apiResponse.data) && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      📊 响应数据包含 <strong>{apiResponse.data.length}</strong> 项记录
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTester;