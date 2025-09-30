import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File } from 'lucide-react';
import { validateFile } from '../../utils/fileHelpers';

const SimpleFileUpload = ({ 
  files, 
  setFiles, 
  acceptedFileTypes, 
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5, 
  label = "Upload Files", 
  description = "Drag and drop files here, or click to select files",
  required = false 
}) => {
  // 添加文件类型标记 - 保持File对象特性
  const addFileWithType = (file, category) => {
    // 使用fileCategory属性，避免覆盖原始的MIME type
    file.fileCategory = category;
    return file;
  };

  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = [];
    const errors = [];

    acceptedFiles.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        // 为中介申请文件添加类型标记
        const fileWithCategory = addFileWithType(file, 'agent-introduction');
        validFiles.push(fileWithCategory);
      }
    });

    if (errors.length > 0) {
      alert('File validation errors:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles].slice(0, maxFiles));
    }
  }, [setFiles, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes || {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: maxFiles,
    maxSize: maxFileSize
  });

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        <span className="text-gray-500 ml-2 text-xs">
          {description}
        </span>
      </label>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-blue bg-blue-50'
            : 'border-gray-300 hover:border-primary-blue hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={48} className="mx-auto text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-primary-blue text-lg">Drop files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 text-lg mb-2">
              Drag and drop files here, or <span className="text-primary-blue font-semibold">click to select files</span>
            </p>
            <p className="text-sm text-gray-500">
              Supported: {Object.values(acceptedFileTypes || {}).flat().map(ext => ext.toUpperCase()).join(', ')} (max {Math.round(maxFileSize / (1024 * 1024))}MB per file, up to {maxFiles} file{maxFiles > 1 ? 's' : ''})
            </p>
          </div>
        )}
      </div>

      {/* 显示已上传文件 */}
      {files.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Uploaded Files ({files.length}):</p>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-3">
                <File size={20} className="text-blue-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                    {file.fileCategory && ` (${file.fileCategory === 'agent-introduction' ? 'Agent Introduction' : file.fileCategory})`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                title="Remove file"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 文件要求提示 */}
      {required && files.length === 0 && (
        <p className="text-sm text-red-600">
          At least one file is required for submission.
        </p>
      )}
    </div>
  );
};

export default SimpleFileUpload; 