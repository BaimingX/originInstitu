/**
 * File Test Service - Submit files to Power Automate for email forwarding
 * Handles file submission testing by sending all uploaded files to Power Automate endpoint
 */

// Power Automate配置
const POWER_AUTOMATE_CONFIG = {
  fileTestUrl: process.env.REACT_APP_POWER_AUTOMATE_FILE_TEST_URL || ''
};

/**
 * 生成唯一的提交ID
 */
const generateSubmissionId = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomId = Math.random().toString(36).substring(2, 8);
  return `file-test-${timestamp}-${randomId}`;
};

/**
 * 将文件转换为Base64字符串
 * @param {File} file - 要转换的文件
 * @returns {Promise<string>} Base64编码的字符串
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // 移除data:mime;base64,前缀，只保留base64内容
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * 生成邮件主题 (firstName familyName's Material Upload)
 * @param {Object} formData - 表单数据
 * @returns {string} 邮件主题
 */
const generateSubject = (formData = {}) => {
  const firstName = formData.firstName || '';
  const familyName = formData.familyName || '';

  if (firstName && familyName) {
    return `${firstName} ${familyName}'s Material Upload`;
  } else if (firstName) {
    return `${firstName}'s Material Upload`;
  } else if (familyName) {
    return `${familyName}'s Material Upload`;
  } else {
    return 'Material Upload';
  }
};

/**
 * 将文件转换为Power Automate需要的JSON格式
 * @param {Array} files - 文件数组
 * @param {Object} formData - 表单数据 (用于生成subject)
 * @param {Object} metadata - 元数据
 * @returns {Promise<Object>} Power Automate JSON格式对象
 */
const prepareFileData = async (files, formData = {}, metadata = {}) => {
  // 转换所有文件为base64格式
  const filesWithBase64 = await Promise.all(
    files.map(async (file) => {
      if (file && file instanceof File) {
        const base64Content = await fileToBase64(file);
        return {
          filename: file.name,
          content: base64Content
        };
      }
      return null;
    })
  );

  // 过滤掉null值
  const validFiles = filesWithBase64.filter(file => file !== null);

  // 生成邮件主题
  const subject = generateSubject(formData);

  // 构造Power Automate期望的JSON格式
  const powerAutomatePayload = {
    subject: subject,
    files: validFiles
  };

  return powerAutomatePayload;
};

/**
 * 检查Power Automate文件测试配置
 * @returns {Object} 配置状态信息
 */
export const checkFileTestConfiguration = () => {
  const isConfigured = POWER_AUTOMATE_CONFIG.fileTestUrl &&
                      POWER_AUTOMATE_CONFIG.fileTestUrl.includes('powerautomate');

  return {
    isConfigured,
    fileTestUrl: POWER_AUTOMATE_CONFIG.fileTestUrl || 'Not configured'
  };
};

/**
 * 提交文件到Power Automate进行邮件转发测试
 * @param {Array} files - 要提交的文件数组
 * @param {Object} formData - 表单数据 (用于生成subject)
 * @param {Object} options - 额外选项
 * @returns {Promise<Object>} 提交结果
 */
export const submitFilesToPowerAutomate = async (files, formData = {}, options = {}) => {
  try {
    // 步骤1: 验证配置
    const config = checkFileTestConfiguration();
    if (!config.isConfigured) {
      return {
        success: false,
        message: 'File test endpoint is not configured',
        error: 'CONFIGURATION_ERROR'
      };
    }

    // 步骤2: 验证文件
    const validFiles = files.filter(file => file && file instanceof File);
    if (validFiles.length === 0) {
      return {
        success: false,
        message: 'No valid files to submit',
        error: 'NO_FILES_ERROR'
      };
    }

    // 步骤3: 检查文件总大小 (100MB限制)
    const totalSize = validFiles.reduce((total, file) => total + file.size, 0);
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes

    if (totalSize > maxSize) {
      return {
        success: false,
        message: `Total file size (${(totalSize / 1024 / 1024).toFixed(2)}MB) exceeds 100MB limit`,
        error: 'FILE_SIZE_ERROR'
      };
    }

    // 步骤4: 准备文件数据 (转换为base64 JSON格式)
    console.log(`📤 Converting ${validFiles.length} files to base64...`);
    console.log(`📊 Total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);

    const payload = await prepareFileData(validFiles, formData, options);

    // 步骤5: 提交到Power Automate
    console.log(`📤 Submitting JSON payload with subject: "${payload.subject}"`);
    console.log(`📤 Files: ${payload.files.length} files to Power Automate...`);
    console.log(`📋 JSON structure:`, {
      subject: payload.subject,
      files: payload.files.map(f => ({ filename: f.filename, contentLength: f.content.length }))
    });

    const response = await fetch(POWER_AUTOMATE_CONFIG.fileTestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // 步骤6: 处理响应
    let responseData;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = {
        message: await response.text(),
        status: response.status,
        statusText: response.statusText
      };
    }

    if (response.ok) {
      // 成功提交
      return {
        success: true,
        message: 'Files submitted successfully for email forwarding via JSON format',
        data: responseData,
        submissionDetails: {
          filesCount: validFiles.length,
          totalSize: totalSize,
          submissionId: generateSubmissionId(),
          submissionTime: new Date().toISOString(),
          format: 'base64_json',
          filesSubmitted: payload.files.map(f => f.filename)
        }
      };
    } else {
      // Power Automate返回错误
      console.error('❌ Power Automate file submission failed:', response.status, responseData);

      return {
        success: false,
        message: `File submission failed (${response.status}): ${responseData.message || response.statusText}`,
        error: 'POWER_AUTOMATE_ERROR',
        details: responseData
      };
    }

  } catch (error) {
    console.error('🚨 File submission error:', error);

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'Network error: Unable to connect to Power Automate endpoint',
        error: 'NETWORK_ERROR',
        details: error.message
      };
    }

    return {
      success: false,
      message: 'Unexpected error during file submission',
      error: 'UNKNOWN_ERROR',
      details: error.message
    };
  }
};

/**
 * 获取文件列表摘要
 * @param {Array} files - 文件数组
 * @returns {Object} 文件摘要信息
 */
export const getFilesSummary = (files) => {
  const validFiles = files.filter(file => file && file instanceof File);

  if (validFiles.length === 0) {
    return {
      totalFiles: 0,
      totalSize: 0,
      totalSizeMB: '0.00',
      fileTypes: [],
      summary: 'No files selected'
    };
  }

  const totalSize = validFiles.reduce((total, file) => total + file.size, 0);
  const fileTypes = [...new Set(validFiles.map(file => file.type.split('/')[1] || 'unknown'))];

  return {
    totalFiles: validFiles.length,
    totalSize: totalSize,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    fileTypes: fileTypes,
    summary: `${validFiles.length} files (${(totalSize / 1024 / 1024).toFixed(2)}MB)`
  };
};

const fileTestService = {
  submitFilesToPowerAutomate,
  checkFileTestConfiguration,
  getFilesSummary
};

export default fileTestService;