import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  testValidationWithPowerAutomate,
  testWithSampleData,
  checkPowerAutomateConfiguration,
  testValueToLabelConversions
} from '../services/powerAutomateValidator';

/**
 * Power Automate JSON Validation Test Component
 * Tests form data mapping and Power Automate endpoint integration
 */
const PowerAutomateValidator = ({ isOpen, onClose, formData = null, files = [] }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showResponse, setShowResponse] = useState(false);
  const [flowType, setFlowType] = useState('student');
  const [useCurrentFormData, setUseCurrentFormData] = useState(true);

  // Check configuration on component load
  const config = checkPowerAutomateConfiguration();

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    setShowResponse(false);

    try {
      toast.loading(`🧪 Testing ${flowType} flow with Power Automate...`, { id: 'pa-test' });

      let result;

      if (useCurrentFormData && formData) {
        // Test with current form data
        console.log('Testing with current form data:', formData);
        result = await testValidationWithPowerAutomate(formData, files, flowType);
      } else {
        // Test with sample data
        console.log('Testing with sample data');
        result = await testWithSampleData(flowType);
      }

      setTestResult(result);
      setShowResponse(true);

      if (result.success) {
        toast.success(`✅ ${flowType} flow test passed!`, { id: 'pa-test' });
      } else {
        toast.error(`❌ ${flowType} flow test failed`, { id: 'pa-test' });
      }

    } catch (error) {
      console.error('Test error:', error);

      const errorResult = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      setTestResult(errorResult);
      setShowResponse(true);
      toast.error(`❌ Test error: ${error.message}`, { id: 'pa-test' });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusBadge = (success, status) => {
    if (success) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✅ Success</span>;
    } else {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">❌ Failed</span>;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('📋 Copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const handleTestConversions = () => {
    toast.loading('🧪 Testing value to label conversions...', { id: 'conversion-test' });

    try {
      const conversionResults = testValueToLabelConversions();

      if (conversionResults.success) {
        toast.success(`✅ All conversions passed! (${conversionResults.summary.passed}/${conversionResults.summary.total})`, { id: 'conversion-test' });
      } else {
        toast.error(`❌ Some conversions failed! (${conversionResults.summary.failed}/${conversionResults.summary.total} failed)`, { id: 'conversion-test' });
      }

      // You can also set this in state to display detailed results if needed
      console.log('Conversion test results:', conversionResults);

    } catch (error) {
      console.error('Conversion test error:', error);
      toast.error(`❌ Conversion test error: ${error.message}`, { id: 'conversion-test' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🧪 Power Automate JSON Validator</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Configuration Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">🔧 Configuration Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Student Flow:</span>
                {config.studentFlowConfigured ? (
                  <span className="text-green-600 font-medium">✅ Configured</span>
                ) : (
                  <span className="text-red-600 font-medium">❌ Not Configured</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Agent Flow:</span>
                {config.agentFlowConfigured ? (
                  <span className="text-green-600 font-medium">✅ Configured</span>
                ) : (
                  <span className="text-red-600 font-medium">❌ Not Configured</span>
                )}
              </div>
            </div>

            {/* Show URLs for debugging */}
            <div className="mt-3 text-xs text-gray-600">
              <div className="mb-1">
                <strong>Student URL:</strong> {config.studentFlowUrl}
              </div>
              <div>
                <strong>Agent URL:</strong> {config.agentFlowUrl}
              </div>
            </div>
          </div>

          {/* Test Configuration */}
          <div className="space-y-4 mb-6">
            {/* Flow Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flow Type to Test:
              </label>
              <select
                value={flowType}
                onChange={(e) => setFlowType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="student">Student Application Flow</option>
                <option value="agent">Agent Application Flow</option>
              </select>
            </div>

            {/* Data Source Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Data Source:
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="dataSource"
                    checked={!useCurrentFormData}
                    onChange={() => setUseCurrentFormData(false)}
                    className="mr-2"
                  />
                  Use sample test data
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="dataSource"
                    checked={useCurrentFormData}
                    onChange={() => setUseCurrentFormData(true)}
                    disabled={!formData}
                    className="mr-2"
                  />
                  Use current form data {!formData && <span className="text-gray-500 text-sm">(no form data available)</span>}
                </label>
              </div>
            </div>
          </div>

          {/* Test Conversions Button */}
          <button
            onClick={handleTestConversions}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium mb-4"
          >
            🔍 Test Value-to-Label Conversions
          </button>

          {/* Test Button */}
          <button
            onClick={handleTest}
            disabled={isTesting || (flowType === 'student' ? !config.studentFlowConfigured : !config.agentFlowConfigured)}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium mb-6"
          >
            {isTesting ? '🧪 Testing JSON Validation...' : `🚀 Test ${flowType} Flow JSON`}
          </button>

          {/* Warning for unconfigured flows */}
          {(flowType === 'student' && !config.studentFlowConfigured) ||
           (flowType === 'agent' && !config.agentFlowConfigured) ? (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ {flowType} flow is not configured. Please set the appropriate environment variable:
                <br />
                <code className="bg-yellow-100 px-1 rounded text-xs">
                  REACT_APP_POWER_AUTOMATE_{flowType.toUpperCase()}_FLOW_URL
                </code>
              </p>
            </div>
          ) : null}

          {/* Test Results */}
          {showResponse && testResult && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">📊 Test Results</h3>

              {/* Status Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status:</span>
                    {getStatusBadge(testResult.success, testResult.status)}
                  </div>
                  {testResult.status && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">HTTP Status:</span>
                      <span className={`font-medium ${testResult.status >= 200 && testResult.status < 300 ? 'text-green-600' : 'text-red-600'}`}>
                        {testResult.status}
                      </span>
                    </div>
                  )}
                  {testResult.responseTime && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Response Time:</span>
                      <span className="font-medium">{testResult.responseTime}</span>
                    </div>
                  )}
                </div>

                {testResult.message && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <span className="font-medium">Message:</span>
                    <p className="mt-1 text-sm">{testResult.message}</p>
                  </div>
                )}

                {testResult.error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <span className="font-medium text-red-800">Error:</span>
                    <p className="mt-1 text-sm text-red-700">{testResult.error}</p>
                  </div>
                )}
              </div>

              {/* Generated JSON */}
              {testResult.generatedJSON && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">🔄 Generated JSON Structure</h4>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(testResult.generatedJSON, null, 2))}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                    >
                      📋 Copy JSON
                    </button>
                  </div>
                  <div className="bg-gray-800 text-green-400 p-4 rounded-md overflow-auto max-h-64">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(testResult.generatedJSON, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Power Automate Response */}
              {testResult.powerAutomateResponse && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">📤 Power Automate Response</h4>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(testResult.powerAutomateResponse, null, 2))}
                      className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
                    >
                      📋 Copy Response
                    </button>
                  </div>
                  <div className="bg-gray-800 text-cyan-400 p-4 rounded-md overflow-auto max-h-64">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(testResult.powerAutomateResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Full Test Details */}
              <details className="p-4 bg-gray-50 rounded-lg">
                <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                  🔍 View Full Test Details
                </summary>
                <div className="mt-3 bg-gray-800 text-gray-300 p-4 rounded-md overflow-auto max-h-96">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PowerAutomateValidator;