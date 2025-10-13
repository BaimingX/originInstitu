import React from 'react';
import { Plus, X, File } from 'lucide-react';
import CollapsibleSection from './CollapsibleSection';
import { validateFile } from '../../utils/fileHelpers';

const FileUpload = ({
  requiredFiles,
  setRequiredFiles,
  optionalFiles,
  setOptionalFiles,
  englishProficiencyMethod,
  validationErrors = []
}) => {

  const handleFileUpload = (fileKey, isRequired = true) => (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      alert(`File validation error: ${validationError}`);
      return;
    }

    if (isRequired) {
      setRequiredFiles(prev => ({
        ...prev,
        [fileKey]: file
      }));
    } else {
      setOptionalFiles(prev => ({
        ...prev,
        [fileKey]: file
      }));
    }

    // Reset input value to allow re-uploading same file
    event.target.value = '';
  };

  const handleFileRemove = (fileKey, isRequired = true) => () => {
    if (isRequired) {
      setRequiredFiles(prev => ({
        ...prev,
        [fileKey]: null
      }));
    } else {
      setOptionalFiles(prev => ({
        ...prev,
        [fileKey]: null
      }));
    }
  };

  const FileUploadSlot = ({ fileKey, label, file, onUpload, onRemove, hasError }) => (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <input
          type="file"
          accept=".pdf"
          onChange={onUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          title={`Upload ${label}`}
        />
        <div className={`w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
          file
            ? 'border-green-400 bg-green-50'
            : hasError
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-primary-blue hover:bg-blue-50'
        }`}>
          {file ? (
            <File size={32} className="text-green-600" />
          ) : (
            <Plus size={32} className={hasError ? "text-red-400" : "text-gray-400"} />
          )}
        </div>
        {file && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            title="Remove file"
          >
            <X size={12} />
          </button>
        )}
      </div>
      <div className="text-center">
        <p className={`text-xs font-medium mb-1 ${hasError ? 'text-red-700' : 'text-gray-700'}`}>
          {label}
          {hasError && <span className="text-red-500 ml-1">*</span>}
        </p>
        {file ? (
          <p className="text-xs text-green-600 truncate max-w-20" title={file.name}>
            {file.name}
          </p>
        ) : hasError && (
          <p className="text-xs text-red-600">Required</p>
        )}
      </div>
    </div>
  );

  const getEnglishTestLabel = () => {
    return englishProficiencyMethod === 'ELICOS Training' ? 'ELICOS Training Offer' : 'English Test Results';
  };

  const requiredFileConfigs = [
    { key: 'year12Evidence', label: 'Evidence of Year 12 or Vocational Education' },
    { key: 'passport', label: 'Current Passport' },
    { key: 'englishTest', label: getEnglishTestLabel() },
    { key: 'academicQualifications', label: 'Academic Qualifications & Transcripts' }
  ];

  // Check which files have errors
  const getMissingFileKeys = () => {
    return requiredFileConfigs
      .filter(config => !requiredFiles[config.key])
      .map(config => config.key);
  };

  const missingFileKeys = getMissingFileKeys();
  const hasAnyMissingFiles = missingFileKeys.length > 0 && validationErrors.length > 0;

  const optionalFileConfigs = [
    { key: 'cv', label: 'CV' },
    { key: 'statementOfPurpose', label: 'Statement of Purpose/GTE Statement' },
    { key: 'financialDeclaration', label: 'Financial Declaration' },
    { key: 'bankStatement', label: 'Bank Statement & Payslips' },
    { key: 'sponsorDocuments', label: 'Sponsor Documents' }
  ];

  return (
    <div className="space-y-6">
      {/* Required Files Section */}
      <CollapsibleSection
        title="Required Documents"
        description="All 4 documents below are mandatory for submission"
        defaultOpen={true}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {requiredFileConfigs.map(config => (
            <FileUploadSlot
              key={config.key}
              fileKey={config.key}
              label={config.label}
              file={requiredFiles[config.key]}
              onUpload={handleFileUpload(config.key, true)}
              onRemove={handleFileRemove(config.key, true)}
              hasError={hasAnyMissingFiles && !requiredFiles[config.key]}
            />
          ))}
        </div>
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Required:</strong> All 4 documents must be uploaded before submission. Please ensure all documents are:
          </p>
          <ul className="text-sm text-red-700 mt-2 ml-4 space-y-1">
            <li>• <strong>Color copies only</strong> (black & white copies are not accepted)</li>
            <li>• <strong>Certified translations</strong> if documents are not in English</li>
            <li>• <strong>Combined in a single PDF</strong> with original document copy and certified translation together</li>
            <li>• <strong>PDF format only</strong> (other file formats will not be accepted)</li>
          </ul>
        </div>
      </CollapsibleSection>

      {/* Optional Files Section */}
      <CollapsibleSection
        title="Optional Documents"
        description="Additional supporting documents (if applicable)"
        defaultOpen={false}
      >
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {optionalFileConfigs.map(config => (
            <FileUploadSlot
              key={config.key}
              fileKey={config.key}
              label={config.label}
              file={optionalFiles[config.key]}
              onUpload={handleFileUpload(config.key, false)}
              onRemove={handleFileRemove(config.key, false)}
            />
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Optional:</strong> Upload these documents if applicable to your situation. Please ensure all documents are:
          </p>
          <ul className="text-sm text-blue-700 mt-2 ml-4 space-y-1">
            <li>• <strong>Color copies only</strong> (black & white copies are not accepted)</li>
            <li>• <strong>Certified translations</strong> if documents are not in English</li>
            <li>• <strong>Combined in a single PDF</strong> with original document copy and certified translation together</li>
            <li>• <strong>PDF format only</strong> (other file formats will not be accepted)</li>
          </ul>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default FileUpload;