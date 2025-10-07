import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { FORM_FIELDS } from '../../utils/validation';
import FormField from './FormField';
import FileUpload from './FileUpload';
import SubmitButton from './SubmitButton';
import CollapsibleSection from './CollapsibleSection';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { testValidateOffer } from '../../services/cricosApiService';
import { fetchEmploymentStatuses, getDefaultEmploymentStatuses } from '../../services/employmentStatusService';
import { fetchIndustryOfEmployments, getDefaultIndustryOfEmployments } from '../../services/industryOfEmploymentService';
import { fetchOccupationCodes, getDefaultOccupationCodes } from '../../services/occupationCodesService';
import { fetchQualificationLevels, getDefaultQualificationLevels, fetchQualificationAchievementRecognitions, getDefaultQualificationAchievementRecognitions } from '../../services/educationDataService';
import { submitFormToPowerAutomate, checkPowerAutomateConfiguration } from '../../services/formSubmissionService';
import { submitFilesToPowerAutomate, checkFileTestConfiguration, getFilesSummary } from '../../services/fileTestService';
import { submitOfferWithValidation } from '../../services/cricosApiService';
import SubmissionProgressModal from '../SubmissionProgressModal';
import ApiTester from '../ApiTester';
import PowerAutomateValidator from '../PowerAutomateValidator';
import toast from 'react-hot-toast';

const PersonalInfoForm = ({ onBackToHome, showAgentSelect = false }) => {
  // Check if running in production mode
  const isProduction = process.env.NODE_ENV === 'production' ||
                       process.env.REACT_APP_PRODUCTION_MODE === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    getValues
  } = useForm();

  // Watch for conditional field dependencies
  const hasPostalAddress = useWatch({ control, name: 'hasPostalAddress' });
  const isEnglishMainLanguage = useWatch({ control, name: 'isEnglishMainLanguage' });
  const hasCompletedEnglishTest = useWatch({ control, name: 'hasCompletedEnglishTest' });
  const hasAchievedQualifications = useWatch({ control, name: 'hasAchievedQualifications' });
  const howDidYouHearAboutUs = useWatch({ control, name: 'howDidYouHearAboutUs' });

  const { isSubmitting, submitStatus, previewJSON, clearStatus, isPowerAutomateMode } = useFormSubmit();
  const [requiredFiles, setRequiredFiles] = React.useState({
    year12Evidence: null,
    passport: null,
    englishTest: null,
    academicQualifications: null
  });
  const [optionalFiles, setOptionalFiles] = React.useState({
    cv: null,
    statementOfPurpose: null,
    financialDeclaration: null,
    bankStatement: null,
    sponsorDocuments: null
  });
  const [isTestValidating, setIsTestValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [apiResponseData, setApiResponseData] = useState(null);
  const [showApiDebug, setShowApiDebug] = useState(false);
  const [showApiTester, setShowApiTester] = useState(false);
  const [showPowerAutomateValidator, setShowPowerAutomateValidator] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [employmentStatusOptions, setEmploymentStatusOptions] = useState(getDefaultEmploymentStatuses());
  const [industryOfEmploymentOptions, setIndustryOfEmploymentOptions] = useState(getDefaultIndustryOfEmployments());
  const [occupationCodesOptions, setOccupationCodesOptions] = useState(getDefaultOccupationCodes());
  const [qualificationLevelsOptions, setQualificationLevelsOptions] = useState(getDefaultQualificationLevels());
  const [qualificationRecognitionsOptions, setQualificationRecognitionsOptions] = useState(getDefaultQualificationAchievementRecognitions());
  const [isFileTestLoading, setIsFileTestLoading] = useState(false);

  // Progress Modal State
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [stepStatuses, setStepStatuses] = useState({});
  const [progressErrors, setProgressErrors] = useState({});
  const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);

  // 确保页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 加载所有CRICOS分类数据
  useEffect(() => {
    const loadCricosData = async () => {
      try {
        // 并行加载五个数据源
        const [
          employmentStatuses,
          industryOfEmployments,
          occupationCodes,
          qualificationLevels,
          qualificationRecognitions
        ] = await Promise.all([
          fetchEmploymentStatuses(),
          fetchIndustryOfEmployments(),
          fetchOccupationCodes(),
          fetchQualificationLevels(),
          fetchQualificationAchievementRecognitions()
        ]);

        setEmploymentStatusOptions(employmentStatuses);
        setIndustryOfEmploymentOptions(industryOfEmployments);
        setOccupationCodesOptions(occupationCodes);
        setQualificationLevelsOptions(qualificationLevels);
        setQualificationRecognitionsOptions(qualificationRecognitions);

        console.log('✅ Employment Status options loaded:', employmentStatuses);
        console.log('✅ Industry of Employment options loaded:', industryOfEmployments);
        console.log('✅ Occupation Codes options loaded:', occupationCodes);
        console.log('✅ Qualification Levels options loaded:', qualificationLevels);
        console.log('✅ Qualification Recognitions options loaded:', qualificationRecognitions);
      } catch (error) {
        console.error('❌ Failed to load CRICOS data:', error);
        // 使用默认选项
        setEmploymentStatusOptions(getDefaultEmploymentStatuses());
        setIndustryOfEmploymentOptions(getDefaultIndustryOfEmployments());
        setOccupationCodesOptions(getDefaultOccupationCodes());
        setQualificationLevelsOptions(getDefaultQualificationLevels());
        setQualificationRecognitionsOptions(getDefaultQualificationAchievementRecognitions());
      }
    };

    loadCricosData();
  }, []);

  // 创建动态的Employment Status字段配置
  const currentEmploymentStatusField = {
    ...FORM_FIELDS.currentEmploymentStatus,
    options: employmentStatusOptions
  };

  // 创建动态的Industry of Employment字段配置
  const industryOfEmploymentField = {
    ...FORM_FIELDS.industryOfEmployment,
    options: industryOfEmploymentOptions
  };

  // 创建动态的Occupation Codes字段配置
  const occupationIdentifierField = {
    ...FORM_FIELDS.occupationIdentifier,
    options: occupationCodesOptions
  };

  // 创建动态的Qualification Level字段配置
  const qualificationLevelField = {
    ...FORM_FIELDS.qualificationLevel,
    options: qualificationLevelsOptions
  };

  // 创建动态的Qualification Recognition字段配置
  const qualificationRecognitionField = {
    ...FORM_FIELDS.qualificationRecognition,
    options: qualificationRecognitionsOptions
  };


  const handlePreviewJSON = (data) => {
    const preview = previewJSON(data);
    setPreviewData(preview);
    setShowJsonPreview(true);
  };

  const handleTestValidation = async (data) => {
    setIsTestValidating(true);
    try {
      // Generate JSON structure
      const preview = previewJSON(data);

      if (!preview.validation.isValid) {
        toast.error(`Form validation failed: ${preview.validation.errors.join(', ')}`);
        return;
      }

      // Test validate with CRICOS API (like --validate --no-submit)
      toast.loading('Testing validation with CRICOS API...', { id: 'test-validation' });

      if (!preview.jsonData) {
        toast.error('Failed to generate mapped data for validation', { id: 'test-validation' });
        return;
      }

      const result = await testValidateOffer(preview.jsonData);

      // Save API response for debugging
      setApiResponseData(result);

      if (result.success) {
        toast.success('✅ CRICOS API validation passed!', { id: 'test-validation' });
        console.log('✅ Validation test successful:', result);
        setValidationErrors([]);
        setShowValidationErrors(false);
      } else {
        const errorCount = result.errors?.length || 0;
        if (errorCount > 0) {
          toast.error(`❌ Validation failed: ${errorCount} errors found. Click to view details.`, {
            id: 'test-validation',
            duration: 8000
          });
          setValidationErrors(result.errors);
          setShowValidationErrors(true);
        } else {
          toast.error(`❌ CRICOS API validation failed (${result.status}): ${result.message}`, {
            id: 'test-validation',
            duration: 5000
          });
        }
        console.error('❌ Validation test failed:', result);
      }
    } catch (error) {
      toast.error('Failed to test validation', { id: 'test-validation' });
      console.error('Test validation error:', error);
    } finally {
      setIsTestValidating(false);
    }
  };

  const handleFileTest = async () => {
    setIsFileTestLoading(true);
    try {
      // 收集所有文件
      const allFiles = [
        ...Object.values(requiredFiles).filter(file => file !== null),
        ...Object.values(optionalFiles).filter(file => file !== null)
      ];

      if (allFiles.length === 0) {
        toast.error('No files selected for testing', { id: 'file-test' });
        return;
      }

      // 检查配置
      const config = checkFileTestConfiguration();
      if (!config.isConfigured) {
        toast.error('File test endpoint is not configured', { id: 'file-test' });
        return;
      }

      // 获取当前表单数据
      const currentFormData = getValues();

      // 显示文件摘要
      const summary = getFilesSummary(allFiles);
      const subject = currentFormData.firstName && currentFormData.familyName
        ? `${currentFormData.firstName} ${currentFormData.familyName}'s Material Upload`
        : currentFormData.firstName
          ? `${currentFormData.firstName}'s Material Upload`
          : currentFormData.familyName
            ? `${currentFormData.familyName}'s Material Upload`
            : 'Material Upload';

      toast.loading(`Submitting ${summary.summary} for "${subject}"...`, { id: 'file-test' });

      // 提交文件 (传递表单数据用于生成subject)
      const result = await submitFilesToPowerAutomate(allFiles, currentFormData, {
        testSource: 'PersonalInfoForm',
        formType: showAgentSelect ? 'agent-student-form' : 'student-form'
      });

      if (result.success) {
        toast.success(`✅ Files submitted successfully! Subject: "${subject}" | ${summary.summary} forwarded via email.`, {
          id: 'file-test',
          duration: 6000
        });

        if (!isProduction) {
          console.log('✅ File test successful:', result);
          console.log('📋 Files submitted:', result.submissionDetails);
        }
      } else {
        toast.error(`❌ File submission failed: ${result.message}`, {
          id: 'file-test',
          duration: 8000
        });

        if (!isProduction) {
          console.error('❌ File test failed:', result);
        }
      }

    } catch (error) {
      toast.error('An unexpected error occurred during file testing', { id: 'file-test' });
      if (!isProduction) {
        console.error('🚨 File test error:', error);
      }
    } finally {
      setIsFileTestLoading(false);
    }
  };

  const validateRequiredFiles = () => {
    const missing = [];
    if (!requiredFiles.year12Evidence) missing.push("Evidence of Year 12 or Vocational Education");
    if (!requiredFiles.passport) missing.push("Current Passport");
    if (!requiredFiles.englishTest) missing.push("English Test Results");
    if (!requiredFiles.academicQualifications) missing.push("Academic Qualifications & Transcripts");
    return missing;
  };

  const updateStepStatus = (stepId, status, error = null, detailedErrors = null) => {
    setStepStatuses(prev => ({ ...prev, [stepId]: status }));
    if (error) {
      setProgressErrors(prev => ({
        ...prev,
        [stepId]: {
          message: error,
          details: detailedErrors || null
        }
      }));
    }
    setCurrentStep(stepId);
  };

  const resetProgressModal = () => {
    setIsProgressModalOpen(false);
    setCurrentStep('');
    setStepStatuses({});
    setProgressErrors({});
    setIsSubmissionComplete(false);
  };

  const onSubmit = async (data) => {
    try {
      // Pre-submission validation
      const missingFiles = validateRequiredFiles();
      if (missingFiles.length > 0) {
        toast.error(`Missing required documents: ${missingFiles.join(', ')}`);
        return;
      }

      const config = checkPowerAutomateConfiguration();
      if (!config.studentFlowConfigured) {
        toast.error('Application submission is not configured. Please contact support.');
        return;
      }

      // Start progress modal
      setIsProgressModalOpen(true);
      setIsSubmissionComplete(false);
      setProgressErrors({});
      setStepStatuses({});

      // Step 1: Preparing data
      updateStepStatus('preparing', 'in-progress');

      let jsonData;
      try {
        const preview = previewJSON(data);
        if (!preview.validation.isValid) {
          throw new Error(`Form validation failed: ${preview.validation.errors.join(', ')}`);
        }
        jsonData = preview.jsonData;
        updateStepStatus('preparing', 'completed');
      } catch (error) {
        updateStepStatus('preparing', 'error', error.message);
        return;
      }

      // Step 2: CRICOS validation
      updateStepStatus('cricos-validation', 'in-progress');

      try {
        const validationResult = await testValidateOffer(jsonData);
        if (validationResult.success) {
          updateStepStatus('cricos-validation', 'completed');
        } else {
          const errorMessage = validationResult.errors?.length > 0
            ? `${validationResult.errors.length} validation errors found`
            : `CRICOS validation failed: ${validationResult.message}`;
          updateStepStatus('cricos-validation', 'error', errorMessage, validationResult.errors);
          return;
        }
      } catch (error) {
        updateStepStatus('cricos-validation', 'error', error.message);
        return;
      }

      // Step 3: CRICOS submission
      updateStepStatus('cricos-submission', 'in-progress');

      try {
        const cricosResult = await submitOfferWithValidation(jsonData);
        if (cricosResult.success) {
          updateStepStatus('cricos-submission', 'completed');
          if (!isProduction) {
            console.log('✅ CRICOS submission successful:', cricosResult);
          }
        } else {
          throw new Error(`CRICOS submission failed: ${cricosResult.message}`);
        }
      } catch (error) {
        updateStepStatus('cricos-submission', 'error', error.message);
        return;
      }

      // Step 4: Power Automate processing
      updateStepStatus('power-automate', 'in-progress');

      try {
        const allFiles = [
          ...Object.values(requiredFiles).filter(file => file !== null),
          ...Object.values(optionalFiles).filter(file => file !== null)
        ];

        const submissionResult = await submitFormToPowerAutomate(data, allFiles, 'student');

        if (submissionResult.success) {
          updateStepStatus('power-automate', 'completed');
          if (!isProduction) {
            console.log('✅ Power Automate submission successful:', submissionResult);
          }
        } else {
          throw new Error(submissionResult.message || 'Power Automate submission failed');
        }
      } catch (error) {
        updateStepStatus('power-automate', 'error', error.message);
        return;
      }

      // Step 5: File forwarding (if files are available)
      const allFiles = [
        ...Object.values(requiredFiles).filter(file => file !== null),
        ...Object.values(optionalFiles).filter(file => file !== null)
      ];

      if (allFiles.length > 0) {
        updateStepStatus('file-forwarding', 'in-progress');

        try {
          const fileConfig = checkFileTestConfiguration();
          if (fileConfig.isConfigured) {
            const fileSubmissionResult = await submitFilesToPowerAutomate(allFiles, data, {
              source: 'main_submission',
              formType: showAgentSelect ? 'agent-student-form' : 'student-form'
            });

            if (fileSubmissionResult.success) {
              updateStepStatus('file-forwarding', 'completed');
              if (!isProduction) {
                console.log('✅ File forwarding successful:', fileSubmissionResult);
              }
            } else {
              throw new Error(fileSubmissionResult.message || 'File forwarding failed');
            }
          } else {
            updateStepStatus('file-forwarding', 'completed');
            if (!isProduction) {
              console.log('ℹ️ File forwarding skipped - endpoint not configured');
            }
          }
        } catch (error) {
          updateStepStatus('file-forwarding', 'error', error.message);
          return;
        }
      } else {
        // No files to forward, mark as completed
        updateStepStatus('file-forwarding', 'completed');
      }

      // Step 6: Completion
      updateStepStatus('completion', 'completed');
      setIsSubmissionComplete(true);

      // Reset form after successful submission
      reset();
      setRequiredFiles({
        year12Evidence: null,
        passport: null,
        englishTest: null,
        academicQualifications: null
      });
      setOptionalFiles({
        cv: null,
        statementOfPurpose: null,
        financialDeclaration: null,
        bankStatement: null,
        sponsorDocuments: null
      });
      clearStatus();

    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred during submission';
      updateStepStatus(currentStep || 'preparing', 'error', errorMessage);
      if (!isProduction) {
        console.error('🚨 Submission error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* 返回按钮 - 响应式定位 */}
      {onBackToHome && (
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-2 sm:space-x-3 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-lg bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-md hover:shadow-lg"
          >
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      )}

      <div className={`max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg ${onBackToHome ? 'mt-16 sm:mt-4' : ''}`}>
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Long Course Student Application Form
          </h1>

          {/* English Only Instruction */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-amber-800 text-center">
                <strong>Important:</strong> All information on this form must be completed in English only. Please ensure all personal details, addresses, and other text entries are written in English.
              </p>
            </div>
          </div>
        </div>
        
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Agent选择 - 仅在showAgentSelect为true时显示 */}
          {showAgentSelect && (
            <div className="bg-blue-50 p-8 rounded-lg border-2 border-blue-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Agent Selection</h2>
              <FormField
                field={FORM_FIELDS.selectedAgent}
                register={register}
                error={errors.selectedAgent}
              />
              <p className="text-sm text-gray-600 mt-2">
                Please select your assigned agent from the list above
              </p>
            </div>
          )}

          {/* 1. Personal Information */}
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h2>

            {/* Basic Information Panel */}
            <CollapsibleSection
              title="Basic Information"
              defaultOpen={true}
              description="Essential personal details and contact information"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  field={FORM_FIELDS.title}
                  register={register}
                  error={errors.title}
                />
                <FormField
                  field={FORM_FIELDS.firstName}
                  register={register}
                  error={errors.firstName}
                />
                <FormField
                  field={FORM_FIELDS.middleName}
                  register={register}
                  error={errors.middleName}
                />
                <FormField
                  field={FORM_FIELDS.familyName}
                  register={register}
                  error={errors.familyName}
                />
                <FormField
                  field={FORM_FIELDS.preferredName}
                  register={register}
                  error={errors.preferredName}
                />
                <FormField
                  field={FORM_FIELDS.gender}
                  register={register}
                  error={errors.gender}
                />
                <FormField
                  field={FORM_FIELDS.dateOfBirth}
                  register={register}
                  error={errors.dateOfBirth}
                />
                <FormField
                  field={FORM_FIELDS.email}
                  register={register}
                  error={errors.email}
                />
              </div>
            </CollapsibleSection>

            {/* Birth & Identity Details Panel */}
            <CollapsibleSection
              title="Birth & Identity Details"
              defaultOpen={true}
              description="Place of birth and nationality information"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  field={FORM_FIELDS.birthplace}
                  register={register}
                  error={errors.birthplace}
                />
                <FormField
                  field={FORM_FIELDS.countryOfBirth}
                  register={register}
                  error={errors.countryOfBirth}
                />
                <FormField
                  field={FORM_FIELDS.nationality}
                  register={register}
                  error={errors.nationality}
                />
              </div>
            </CollapsibleSection>

            {/* Passport & Documentation Panel */}
            <CollapsibleSection
              title="Passport & Documentation"
              defaultOpen={true}
              description="Travel documents and student identification"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  field={FORM_FIELDS.passportNumber}
                  register={register}
                  error={errors.passportNumber}
                />
                <FormField
                  field={FORM_FIELDS.passportExpiryDate}
                  register={register}
                  error={errors.passportExpiryDate}
                />
                <FormField
                  field={FORM_FIELDS.usi}
                  register={register}
                  error={errors.usi}
                />
              </div>
            </CollapsibleSection>
          </div>

          {/* 2. Current Address */}
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Current Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                field={FORM_FIELDS.currentCountry}
                register={register}
                error={errors.currentCountry}
              />
              <FormField
                field={FORM_FIELDS.buildingPropertyName}
                register={register}
                error={errors.buildingPropertyName}
              />
              <FormField
                field={FORM_FIELDS.flatUnitDetails}
                register={register}
                error={errors.flatUnitDetails}
              />
              <FormField
                field={FORM_FIELDS.streetNumber}
                register={register}
                error={errors.streetNumber}
              />
              <FormField
                field={FORM_FIELDS.streetName}
                register={register}
                error={errors.streetName}
              />
              <FormField
                field={FORM_FIELDS.cityTownSuburb}
                register={register}
                error={errors.cityTownSuburb}
              />
              <FormField
                field={FORM_FIELDS.state}
                register={register}
                error={errors.state}
              />
              <FormField
                field={FORM_FIELDS.postcode}
                register={register}
                error={errors.postcode}
              />
              <FormField
                field={FORM_FIELDS.mobilePhone}
                register={register}
                error={errors.mobilePhone}
              />
            </div>
            <div className="mt-6">
              <FormField
                field={FORM_FIELDS.hasPostalAddress}
                register={register}
                error={errors.hasPostalAddress}
              />
            </div>
          </div>

          {/* 3. Postal Address (conditional) */}
          {hasPostalAddress === 'Yes' && (
            <div className="bg-blue-50 p-8 rounded-lg border-2 border-blue-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Postal Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  field={FORM_FIELDS.postalCountry}
                  register={register}
                  error={errors.postalCountry}
                  customValidation={{
                    required: hasPostalAddress === 'Yes' ? 'Please select country' : false
                  }}
                />
                <FormField
                  field={FORM_FIELDS.postalBuildingPropertyName}
                  register={register}
                  error={errors.postalBuildingPropertyName}
                />
                <FormField
                  field={FORM_FIELDS.postalFlatUnitDetails}
                  register={register}
                  error={errors.postalFlatUnitDetails}
                />
                <FormField
                  field={FORM_FIELDS.postalStreetNumber}
                  register={register}
                  error={errors.postalStreetNumber}
                  customValidation={{
                    required: hasPostalAddress === 'Yes' ? 'Please enter street number' : false
                  }}
                />
                <FormField
                  field={FORM_FIELDS.postalStreetName}
                  register={register}
                  error={errors.postalStreetName}
                  customValidation={{
                    required: hasPostalAddress === 'Yes' ? 'Please enter street name' : false
                  }}
                />
                <FormField
                  field={FORM_FIELDS.postalCityTownSuburb}
                  register={register}
                  error={errors.postalCityTownSuburb}
                  customValidation={{
                    required: hasPostalAddress === 'Yes' ? 'Please enter city/town/suburb' : false
                  }}
                />
                <FormField
                  field={FORM_FIELDS.postalState}
                  register={register}
                  error={errors.postalState}
                  customValidation={{
                    required: hasPostalAddress === 'Yes' ? 'Please enter state' : false
                  }}
                />
                <FormField
                  field={FORM_FIELDS.postalPostcode}
                  register={register}
                  error={errors.postalPostcode}
                  customValidation={{
                    required: hasPostalAddress === 'Yes' ? 'Please enter postcode' : false,
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Please enter a valid postcode'
                    }
                  }}
                />
                <FormField
                  field={FORM_FIELDS.postalMobilePhone}
                  register={register}
                  error={errors.postalMobilePhone}
                  customValidation={{
                    required: hasPostalAddress === 'Yes' ? 'Please enter mobile phone number' : false,
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Please enter a valid mobile phone number (numbers only)'
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* 4. Language and Cultural Diversity */}
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Language and Cultural Diversity</h2>
            <div className="space-y-8">
              <FormField
                field={FORM_FIELDS.isAboriginal}
                register={register}
                error={errors.isAboriginal}
              />
              <FormField
                field={FORM_FIELDS.isTorresStraitIslander}
                register={register}
                error={errors.isTorresStraitIslander}
              />
              <FormField
                field={FORM_FIELDS.isEnglishMainLanguage}
                register={register}
                error={errors.isEnglishMainLanguage}
              />
              {isEnglishMainLanguage === 'No' && (
                <FormField
                  field={FORM_FIELDS.languageSpokenAtHome}
                  register={register}
                  error={errors.languageSpokenAtHome}
                />
              )}
              <FormField
                field={FORM_FIELDS.wasEnglishInstructionLanguage}
                register={register}
                error={errors.wasEnglishInstructionLanguage}
              />
              <FormField
                field={FORM_FIELDS.hasCompletedEnglishTest}
                register={register}
                error={errors.hasCompletedEnglishTest}
              />
            </div>
          </div>

          {/* 5. English Test (conditional) */}
          {hasCompletedEnglishTest === 'English test' && (
            <div className="bg-blue-50 p-8 rounded-lg border-2 border-blue-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">English Test</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  field={FORM_FIELDS.englishTestType}
                  register={register}
                  error={errors.englishTestType}
                  customValidation={{
                    required: hasCompletedEnglishTest === 'English test' ? 'Please select test type' : false
                  }}
                />
                <FormField
                  field={FORM_FIELDS.listeningScore}
                  register={register}
                  error={errors.listeningScore}
                  customValidation={{
                    required: hasCompletedEnglishTest === 'English test' ? 'Please enter listening score' : false,
                    pattern: {
                      value: /^\d*\.?\d*$/,
                      message: 'Please enter a valid number'
                    },
                    min: {
                      value: 0,
                      message: 'Score must be 0 or greater'
                    }
                  }}
                />
                <FormField
                  field={FORM_FIELDS.readingScore}
                  register={register}
                  error={errors.readingScore}
                  customValidation={{
                    required: hasCompletedEnglishTest === 'English test' ? 'Please enter reading score' : false,
                    pattern: {
                      value: /^\d*\.?\d*$/,
                      message: 'Please enter a valid number'
                    },
                    min: {
                      value: 0,
                      message: 'Score must be 0 or greater'
                    }
                  }}
                />
                <FormField
                  field={FORM_FIELDS.writingScore}
                  register={register}
                  error={errors.writingScore}
                  customValidation={{
                    required: hasCompletedEnglishTest === 'English test' ? 'Please enter writing score' : false,
                    pattern: {
                      value: /^\d*\.?\d*$/,
                      message: 'Please enter a valid number'
                    },
                    min: {
                      value: 0,
                      message: 'Score must be 0 or greater'
                    }
                  }}
                />
                <FormField
                  field={FORM_FIELDS.speakingScore}
                  register={register}
                  error={errors.speakingScore}
                  customValidation={{
                    required: hasCompletedEnglishTest === 'English test' ? 'Please enter speaking score' : false,
                    pattern: {
                      value: /^\d*\.?\d*$/,
                      message: 'Please enter a valid number'
                    },
                    min: {
                      value: 0,
                      message: 'Score must be 0 or greater'
                    }
                  }}
                />
                <FormField
                  field={FORM_FIELDS.overallScore}
                  register={register}
                  error={errors.overallScore}
                  customValidation={{
                    required: hasCompletedEnglishTest === 'English test' ? 'Please enter overall score' : false,
                    pattern: {
                      value: /^\d*\.?\d*$/,
                      message: 'Please enter a valid number'
                    },
                    min: {
                      value: 0,
                      message: 'Score must be 0 or greater'
                    }
                  }}
                />
              </div>

              {/* Test Date - Independent row */}
              <div className="mt-8">
                <FormField
                  field={FORM_FIELDS.engTestDate}
                  register={register}
                  error={errors.engTestDate}
                  customValidation={{
                    required: hasCompletedEnglishTest === 'English test' ? 'Please select test date' : false,
                    validate: {
                      notFuture: (value) => {
                        if (!value) return true;
                        const selectedDate = new Date(value);
                        const today = new Date();
                        today.setHours(23, 59, 59, 999);
                        return selectedDate <= today || 'Test date cannot be in the future';
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* 6. Education History */}
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Education History</h2>
            <div className="space-y-8">
              <FormField
                field={FORM_FIELDS.highestSchoolLevel}
                register={register}
                error={errors.highestSchoolLevel}
              />
              <FormField
                field={FORM_FIELDS.isStillAttendingSchool}
                register={register}
                error={errors.isStillAttendingSchool}
              />
              <FormField
                field={FORM_FIELDS.hasAchievedQualifications}
                register={register}
                error={errors.hasAchievedQualifications}
              />
            </div>
          </div>

          {/* 7. The Highest Qualification Achieved (conditional) */}
          {hasAchievedQualifications === 'Yes' && (
            <div className="bg-blue-50 p-8 rounded-lg border-2 border-blue-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">The Highest Qualification Achieved</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  field={qualificationLevelField}
                  register={register}
                  error={errors.qualificationLevel}
                  customValidation={{
                    required: hasAchievedQualifications === 'Yes' ? 'Please select qualification level' : false
                  }}
                />
                <FormField
                  field={FORM_FIELDS.qualificationName}
                  register={register}
                  error={errors.qualificationName}
                  customValidation={{
                    required: hasAchievedQualifications === 'Yes' ? 'Please enter qualification name' : false
                  }}
                />
                <FormField
                  field={qualificationRecognitionField}
                  register={register}
                  error={errors.qualificationRecognition}
                  customValidation={{
                    required: hasAchievedQualifications === 'Yes' ? 'Please select qualification recognition' : false
                  }}
                />
                <FormField
                  field={FORM_FIELDS.institutionName}
                  register={register}
                  error={errors.institutionName}
                  customValidation={{
                    required: hasAchievedQualifications === 'Yes' ? 'Please enter institution name' : false
                  }}
                />
                <FormField
                  field={FORM_FIELDS.stateCountry}
                  register={register}
                  error={errors.stateCountry}
                  customValidation={{
                    required: hasAchievedQualifications === 'Yes' ? 'Please enter state/country' : false
                  }}
                />
              </div>
            </div>
          )}

          {/* 8. Employment */}
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Employment</h2>
            <div className="space-y-8">
              <FormField
                field={currentEmploymentStatusField}
                register={register}
                error={errors.currentEmploymentStatus}
              />
              <FormField
                field={industryOfEmploymentField}
                register={register}
                error={errors.industryOfEmployment}
              />
              <FormField
                field={occupationIdentifierField}
                register={register}
                error={errors.occupationIdentifier}
              />
            </div>
          </div>

          {/* 9. How did you hear about us? */}
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">How did you hear about us?</h2>
            <div className="space-y-8">
              <FormField
                field={FORM_FIELDS.howDidYouHearAboutUs}
                register={register}
                error={errors.howDidYouHearAboutUs}
              />
              <FormField
                field={FORM_FIELDS.howDidYouHearDetails}
                register={register}
                error={errors.howDidYouHearDetails}
              />
            </div>
          </div>

          {/* 10. Agent Details (conditional) */}
          {howDidYouHearAboutUs === 'Agent' && (
            <div className="bg-blue-50 p-8 rounded-lg border-2 border-blue-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Agent Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  field={FORM_FIELDS.agentName}
                  register={register}
                  error={errors.agentName}
                />
                <FormField
                  field={FORM_FIELDS.agentEmail}
                  register={register}
                  error={errors.agentEmail}
                />
              </div>
            </div>
          )}

          {/* 11. Emergency/Guardian Contact */}
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Emergency/Guardian Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                field={FORM_FIELDS.contactType}
                register={register}
                error={errors.contactType}
              />
              <FormField
                field={FORM_FIELDS.relationship}
                register={register}
                error={errors.relationship}
              />
              <FormField
                field={FORM_FIELDS.contactGivenName}
                register={register}
                error={errors.contactGivenName}
              />
              <FormField
                field={FORM_FIELDS.contactFamilyName}
                register={register}
                error={errors.contactFamilyName}
              />
              <FormField
                field={FORM_FIELDS.contactFlatUnitDetails}
                register={register}
                error={errors.contactFlatUnitDetails}
              />
              <FormField
                field={FORM_FIELDS.contactStreetAddress}
                register={register}
                error={errors.contactStreetAddress}
              />
              <FormField
                field={FORM_FIELDS.contactCityTownSuburb}
                register={register}
                error={errors.contactCityTownSuburb}
              />
              <FormField
                field={FORM_FIELDS.contactPostcode}
                register={register}
                error={errors.contactPostcode}
              />
              <FormField
                field={FORM_FIELDS.contactState}
                register={register}
                error={errors.contactState}
              />
              <FormField
                field={FORM_FIELDS.contactCountry}
                register={register}
                error={errors.contactCountry}
              />
              <FormField
                field={FORM_FIELDS.contactEmail}
                register={register}
                error={errors.contactEmail}
              />
              <FormField
                field={FORM_FIELDS.contactMobile}
                register={register}
                error={errors.contactMobile}
              />
              <FormField
                field={FORM_FIELDS.contactLanguagesSpoken}
                register={register}
                error={errors.contactLanguagesSpoken}
              />
            </div>
          </div>

          {/* 12. Terms and Conditions */}
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Terms and Conditions</h2>
            <div className="mb-4">
              <FormField
                field={FORM_FIELDS.agreeToTerms}
                register={register}
                error={errors.agreeToTerms}
              />
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Download and read the terms and conditions: <a href="https://bit.ly/onlineapptc" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">https://bit.ly/onlineapptc</a>
              </p>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">File Upload</h2>
            <FileUpload
              requiredFiles={requiredFiles}
              setRequiredFiles={setRequiredFiles}
              optionalFiles={optionalFiles}
              setOptionalFiles={setOptionalFiles}
              englishProficiencyMethod={hasCompletedEnglishTest}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-4">
            {/* Test buttons - hidden in production */}
            {!isProduction && (
              <>
                {/* Preview JSON Button */}
                <button
                  type="button"
                  onClick={handleSubmit(handlePreviewJSON)}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  Preview JSON Structure
                </button>

                {/* Test Validation Button */}
                <button
                  type="button"
                  onClick={handleSubmit(handleTestValidation)}
                  className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                  disabled={isSubmitting || isTestValidating}
                >
                  {isTestValidating ? 'Testing Validation...' : 'Test Validation'}
                </button>

                {/* API Tester Button */}
                {/* <button
                  type="button"
                  onClick={() => setShowApiTester(true)}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  🔧 通用 API 测试工具
                </button> */}

                {/* Power Automate Validator Button */}
                <button
                  type="button"
                  onClick={() => setShowPowerAutomateValidator(true)}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  🧪 Test Power Automate JSON Validation
                </button>

                {/* View Last Validation Errors Button */}
                {validationErrors.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowValidationErrors(true)}
                    className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    🚨 View Last Validation Errors ({validationErrors.length})
                  </button>
                )}

                {/* File Test Button */}
                <button
                  type="button"
                  onClick={handleFileTest}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  disabled={isSubmitting || isFileTestLoading}
                >
                  {isFileTestLoading ? '📤 Testing File Submission...' : '📎 Test File Submission to Email'}
                </button>
              </>
            )}

            {/* Submit Button - always visible */}
            <SubmitButton
              isSubmitting={isSubmitting}
              submitStatus={submitStatus}
              isPowerAutomateMode={isPowerAutomateMode}
            />
          </div>
        </form>


        {/* CRICOS Validation Errors Modal */}
        {showValidationErrors && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-red-600">
                    🚨 CRICOS API Validation Errors ({validationErrors.length})
                  </h3>
                  <button
                    onClick={() => setShowValidationErrors(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <p className="text-gray-600 mt-2">
                  Please fix the following issues before submitting:
                </p>
              </div>
              <div className="p-6 overflow-auto max-h-[60vh]">
                <div className="space-y-4">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                            {index + 1}
                          </span>
                        </div>
                        <div className="ml-3 flex-1">
                          <h4 className="text-lg font-medium text-red-800">{error.field}</h4>
                          <p className="mt-1 text-red-700">{error.message}</p>
                          <details className="mt-2">
                            <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800">
                              Technical Details
                            </summary>
                            <p className="mt-1 text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                              {error.technical}
                            </p>
                          </details>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <p className="text-sm text-gray-600">
                      💡 Tip: Review your form data and correct the highlighted issues above.
                    </p>
                    <button
                      onClick={() => {
                        setShowApiDebug(true);
                        setShowValidationErrors(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      🔍 Debug API Response
                    </button>
                  </div>
                  <button
                    onClick={() => setShowValidationErrors(false)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Debug Modal */}
        {showApiDebug && apiResponseData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-blue-600">
                    🔍 CRICOS API Response Debug
                  </h3>
                  <button
                    onClick={() => setShowApiDebug(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <p className="text-gray-600 mt-2">
                  Complete API response for debugging purposes:
                </p>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]">
                <div className="space-y-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Request Status:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Success:</span>
                        <span className={apiResponseData.success ? 'text-green-600' : 'text-red-600'}>
                          {apiResponseData.success ? 'true' : 'false'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Status Code:</span>
                        <span className={`font-mono ${apiResponseData.status >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                          {apiResponseData.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Complete API Response:</h4>
                    <pre className="bg-white p-4 rounded border text-xs overflow-auto font-mono max-h-96">
                      {JSON.stringify(apiResponseData, null, 2)}
                    </pre>
                  </div>

                  {apiResponseData.data && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Raw Server Response:</h4>
                      <pre className="bg-white p-4 rounded border text-xs overflow-auto font-mono max-h-96">
                        {JSON.stringify(apiResponseData.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(apiResponseData, null, 2));
                      toast.success('API response copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📋 Copy Response
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowApiDebug(false);
                        setShowValidationErrors(true);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      ← Back to Errors
                    </button>
                    <button
                      onClick={() => setShowApiDebug(false)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* JSON Preview Modal */}
        {showJsonPreview && previewData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-blue-600">
                    📋 JSON Structure Preview
                  </h3>
                  <button
                    onClick={() => setShowJsonPreview(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <p className="text-gray-600 mt-2">
                  Preview of the data structure that will be submitted
                </p>
              </div>
              <div className="p-6 overflow-auto max-h-[60vh]">
                {previewData.validation?.isValid ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">✅ Validation: Passed</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Generated JSON Data:</h4>
                      <pre className="text-sm bg-white p-4 rounded border overflow-auto max-h-96 text-gray-700 text-left">
                        {JSON.stringify(previewData.jsonData, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-medium">❌ Validation: Failed</p>
                      <ul className="mt-2 text-red-700 text-sm">
                        {previewData.validation?.errors?.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowJsonPreview(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Tester Modal */}
        <ApiTester
          isOpen={showApiTester}
          onClose={() => setShowApiTester(false)}
        />

        {/* Power Automate Validator Modal */}
        <PowerAutomateValidator
          isOpen={showPowerAutomateValidator}
          onClose={() => setShowPowerAutomateValidator(false)}
          formData={control._formValues || {}}
          files={[...Object.values(requiredFiles), ...Object.values(optionalFiles)].filter(Boolean)}
        />

        {/* Submission Progress Modal */}
        <SubmissionProgressModal
          isOpen={isProgressModalOpen}
          onClose={resetProgressModal}
          currentStep={currentStep}
          stepStatuses={stepStatuses}
          errors={progressErrors}
          isComplete={isSubmissionComplete}
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm; 