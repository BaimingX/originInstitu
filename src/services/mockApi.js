// 模拟API延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const submitFormData = async (formData) => {
  console.log('Mock API: Received form data', formData);
  
  // 模拟网络延迟
  await delay(2000);
  
  // 模拟随机错误（10%概率）
  if (Math.random() < 0.1) {
    throw new Error('Simulated network error');
  }
  
  // 模拟成功响应
  return {
    success: true,
    message: 'Form submitted successfully!',
    data: {
      id: Date.now(),
      submittedAt: new Date().toISOString(),
      status: 'processed'
    }
  };
};

export const uploadFiles = async (files) => {
  console.log('Mock API: Received files', files);
  
  await delay(3000);
  
  // Simulate file upload response
  const fileUrls = files.map((file, index) => ({
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    url: `https://mock-storage.blob.core.windows.net/uploads/${Date.now()}-${file.name}`,
    uploadedAt: new Date().toISOString()
  }));
  
  return {
    success: true,
    message: 'Files uploaded successfully!',
    files: fileUrls
  };
}; 