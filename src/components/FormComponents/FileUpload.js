import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File } from 'lucide-react';
import { validateFile } from '../../utils/fileHelpers';

const FileUpload = ({ 
  files, 
  setFiles, 
  acceptedFileTypes, 
  maxFileSize, 
  maxFiles, 
  label, 
  description,
  required = false 
}) => {
  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = [];
    const errors = [];

    acceptedFiles.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert('File validation errors:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles].slice(0, 5)); // 最多5个文件
    }
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  // 添加文件类型标记 - 保持File对象特性
  const addFileWithType = (file, category) => {
    // 使用fileCategory属性，避免覆盖原始的MIME type
    file.fileCategory = category;
    setFiles(prevFiles => [...prevFiles, file]);
  };

  const handlePhotoIdUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      addFileWithType(file, 'photo-id');
    }
  };

  const handleResidencyProofUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      addFileWithType(file, 'residency-proof');
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-gray-500 ml-2 text-xs">
          {description}
        </span>
      </label>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-blue bg-blue-50'
            : 'border-gray-300 hover:border-primary-blue hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
        {isDragActive ? (
          <p className="text-primary-blue">Drop PDF files here...</p>
        ) : (
          <p className="text-gray-600">
            Drag and drop PDF files here, or <span className="text-primary-blue">click to select PDF files</span>
          </p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Only PDF files are supported (Maximum 5MB per file)
        </p>
      </div>

      {/* Photo ID上传 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photo ID * <span className="text-red-500">(Required - PDF only)</span>
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={handlePhotoIdUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500 mt-1">Upload your photo ID in PDF format (passport, driver's license, etc.)</p>
      </div>

      {/* Residency/Visa Proof上传 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Residency/Visa Proof * <span className="text-red-500">(Required - PDF only)</span>
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleResidencyProofUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500 mt-1">Upload proof of residency or visa status in PDF format</p>
      </div>

      {/* 显示已上传文件 */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <File size={16} />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({file.fileCategory === 'photo-id' ? 'Photo ID' : 'Residency/Visa Proof'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFiles(files.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload; 