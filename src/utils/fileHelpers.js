// 文件验证辅助函数
export const validateFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    'application/pdf'
  ];
  
  if (file.size > maxSize) {
    return 'File size cannot exceed 5MB';
  }
  
  if (!allowedTypes.includes(file.type)) {
    return 'Only PDF files are supported. Please upload PDF documents only';
  }
  
  return null; // 验证通过
};

// 格式化文件大小显示
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// 检查是否为图片文件
export const isImageFile = (file) => {
  return file.type.startsWith('image/');
};

export const createFilePreview = (file) => {
  if (isImageFile(file)) {
    return URL.createObjectURL(file);
  }
  return null;
};

// 生成唯一的Agent Application ID
export const generateAgentApplicationId = () => {
  const timestamp = Date.now().toString();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const year = new Date().getFullYear();
  
  // 格式: AGT-YYYY-XXXXXX-TIMESTAMP的后6位
  return `AGT-${year}-${randomPart}-${timestamp.slice(-6)}`;
}; 