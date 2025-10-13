import React, { useEffect, useState, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { FORM_FIELDS } from '../../utils/validation';
import FormField from './FormField';
import FileUpload from './FileUpload';
import CollapsibleSection from './CollapsibleSection';
import StepProgressBar from './StepProgressBar';
import StepNavigation from './StepNavigation';
import ReviewModal from './ReviewModal';
import AgentSelector from './AgentSelector';
import agentService from '../../services/agentService';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { testValidateOffer } from '../../services/cricosApiService';
import { fetchEmploymentStatuses, getDefaultEmploymentStatuses } from '../../services/employmentStatusService';
import { fetchIndustryOfEmployments, getDefaultIndustryOfEmployments } from '../../services/industryOfEmploymentService';
import { fetchOccupationCodes, getDefaultOccupationCodes } from '../../services/occupationCodesService';
import { fetchQualificationLevels, getDefaultQualificationLevels, fetchQualificationAchievementRecognitions, getDefaultQualificationAchievementRecognitions } from '../../services/educationDataService';
import { submitFormToPowerAutomate, checkPowerAutomateConfiguration } from '../../services/formSubmissionService';
import { submitFilesToPowerAutomate, checkFileTestConfiguration, getFilesSummary } from '../../services/fileTestService';
import { submitOfferWithValidation } from '../../services/cricosApiService';
import { fetchCourseIntakes, getDefaultIntakeOptions } from '../../services/courseIntakeService';
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
    getValues,
    trigger
  } = useForm({
    mode: 'onChange', // 启用实时验证
    reValidateMode: 'onChange' // 修复错误后重新验证
  });

  // Watch for conditional field dependencies
  const hasPostalAddress = useWatch({ control, name: 'hasPostalAddress' });
  const isEnglishMainLanguage = useWatch({ control, name: 'isEnglishMainLanguage' });
  const hasCompletedEnglishTest = useWatch({ control, name: 'hasCompletedEnglishTest' });
  const hasAchievedQualifications = useWatch({ control, name: 'hasAchievedQualifications' });
  const howDidYouHearAboutUs = useWatch({ control, name: 'howDidYouHearAboutUs' });
  const selectedAgent = useWatch({ control, name: 'selectedAgent' });

  const { isSubmitting, previewJSON, clearStatus } = useFormSubmit();
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
  const [fileValidationErrors, setFileValidationErrors] = useState([]);
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

  // Course Intake Selection State
  const [intakeOptions, setIntakeOptions] = useState(getDefaultIntakeOptions());
  const [isLoadingIntakes, setIsLoadingIntakes] = useState(false);
  const [intakeError, setIntakeError] = useState(null);

  // Progress Modal State (existing submission progress)
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [submissionStep, setSubmissionStep] = useState('preparing');
  const [stepStatuses, setStepStatuses] = useState({});
  const [progressErrors, setProgressErrors] = useState({});
  const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);

  // Multi-Step Form State
  const [currentFormStep, setCurrentFormStep] = useState(() => {
    const saved = localStorage.getItem('personalForm_currentStep');
    return saved ? parseInt(saved) : 1;
  });
  const [completedSteps, setCompletedSteps] = useState(() => {
    const saved = localStorage.getItem('personalForm_completedSteps');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [isStepValidating, setIsStepValidating] = useState(false);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Step field mappings using validation.js
  const stepFields = {
    1: showAgentSelect
      ? ['selectedAgent', 'title', 'firstName', 'familyName', 'gender', 'dateOfBirth', 'email', 'birthplace', 'countryOfBirth', 'nationality', 'passportNumber', 'passportExpiryDate']
      : ['title', 'firstName', 'familyName', 'gender', 'dateOfBirth', 'email', 'birthplace', 'countryOfBirth', 'nationality', 'passportNumber', 'passportExpiryDate'],
    2: ['currentCountry', 'streetNumber', 'streetName', 'cityTownSuburb', 'state', 'postcode', 'mobilePhone', 'contactType', 'relationship', 'contactGivenName', 'contactFamilyName', 'contactEmail', 'contactMobile'],
    3: ['isAboriginal', 'isTorresStraitIslander', 'isEnglishMainLanguage', 'wasEnglishInstructionLanguage', 'hasCompletedEnglishTest', 'highestSchoolLevel', 'isStillAttendingSchool', 'hasAchievedQualifications', 'currentEmploymentStatus', 'industryOfEmployment', 'occupationIdentifier'],
    4: ['howDidYouHearAboutUs', 'selectedIntake', 'agreeToTerms']
  };

  // 确保页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 清理localStorage
  const clearStorageProgress = useCallback(() => {
    try {
      localStorage.removeItem('personalForm_currentStep');
      localStorage.removeItem('personalForm_completedSteps');
      localStorage.removeItem('personalForm_data');
      localStorage.removeItem('personalForm_timestamp');
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }, []);

  // 保存进度到localStorage
  const saveProgressToStorage = useCallback(() => {
    try {
      const formData = getValues();
      localStorage.setItem('personalForm_currentStep', currentFormStep.toString());
      localStorage.setItem('personalForm_completedSteps', JSON.stringify([...completedSteps]));
      localStorage.setItem('personalForm_data', JSON.stringify(formData));
      localStorage.setItem('personalForm_timestamp', Date.now().toString());
    } catch (error) {
      console.warn('Failed to save form progress to localStorage:', error);
    }
  }, [currentFormStep, completedSteps, getValues]);

  // 从localStorage恢复数据
  const loadProgressFromStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem('personalForm_data');
      const savedTimestamp = localStorage.getItem('personalForm_timestamp');

      if (savedData && savedTimestamp) {
        const dataAge = Date.now() - parseInt(savedTimestamp);
        const maxAge = 24 * 60 * 60 * 1000; // 24小时

        if (dataAge < maxAge) {
          const parsedData = JSON.parse(savedData);
          reset(parsedData);
          console.log('Form data restored from localStorage');
        } else {
          // 清理过期数据
          clearStorageProgress();
          console.log('Expired form data cleared from localStorage');
        }
      }
    } catch (error) {
      console.warn('Failed to load form progress from localStorage:', error);
      clearStorageProgress();
    }
  }, [reset, clearStorageProgress]);

  // 字段名映射 - 将技术字段名转换为用户友好的名称
  const getFieldDisplayName = (fieldName) => {
    const fieldMap = {
      // Step 1: Personal Information
      'title': 'Title',
      'firstName': 'First Name',
      'middleName': 'Middle Name',
      'familyName': 'Family Name',
      'preferredName': 'Preferred Name',
      'gender': 'Gender',
      'dateOfBirth': 'Date of Birth',
      'email': 'Email Address',
      'birthplace': 'Place of Birth',
      'countryOfBirth': 'Country of Birth',
      'nationality': 'Nationality',
      'passportNumber': 'Passport Number',
      'passportExpiryDate': 'Passport Expiry Date',
      'usi': 'Unique Student Identifier (USI)',

      // Step 2: Address and Contact
      'currentCountry': 'Current Country',
      'buildingPropertyName': 'Building/Property Name',
      'flatUnitDetails': 'Flat/Unit Details',
      'streetNumber': 'Street Number',
      'streetName': 'Street Name',
      'cityTownSuburb': 'City/Town/Suburb',
      'state': 'State',
      'postcode': 'Postcode',
      'mobilePhone': 'Mobile Phone',
      'contactType': 'Contact Type',
      'relationship': 'Relationship',
      'contactGivenName': 'Contact Given Name',
      'contactFamilyName': 'Contact Family Name',
      'contactEmail': 'Emergency Contact Email',
      'contactMobile': 'Emergency Contact Mobile',

      // Postal Address (conditional)
      'postalCountry': 'Postal Country',
      'postalBuildingPropertyName': 'Postal Building/Property Name',
      'postalFlatUnitDetails': 'Postal Flat/Unit Details',
      'postalStreetNumber': 'Postal Street Number',
      'postalStreetName': 'Postal Street Name',
      'postalCityTownSuburb': 'Postal City/Town/Suburb',
      'postalState': 'Postal State',
      'postalPostcode': 'Postal Postcode',

      // Step 3: Education and Language
      'isAboriginal': 'Aboriginal Status',
      'isTorresStraitIslander': 'Torres Strait Islander Status',
      'isEnglishMainLanguage': 'Is English Your Main Language',
      'wasEnglishInstructionLanguage': 'Was English the Instruction Language',
      'hasCompletedEnglishTest': 'English Test Completion',
      'englishTestType': 'English Test Type',
      'listeningScore': 'Listening Score',
      'readingScore': 'Reading Score',
      'writingScore': 'Writing Score',
      'speakingScore': 'Speaking Score',
      'overallScore': 'Overall Score',
      'engTestDate': 'Test Date',
      'highestSchoolLevel': 'Highest School Level',
      'isStillAttendingSchool': 'Still Attending School',
      'hasAchievedQualifications': 'Achieved Qualifications',
      'qualificationLevel': 'Qualification Level',
      'qualificationName': 'Qualification Name',
      'qualificationRecognition': 'Achievement Recognition',
      'institutionName': 'Institution Name',
      'stateCountry': 'State/Country',
      'currentEmploymentStatus': 'Current Employment Status',
      'industryOfEmployment': 'Industry of Employment',
      'occupationIdentifier': 'Occupation',

      // Step 4: Course and Documents
      'howDidYouHearAboutUs': 'How Did You Hear About Us',
      'selectedIntake': 'Course Intake Selection',
      'agreeToTerms': 'Terms and Conditions Agreement',

      // Agent Selection
      'selectedAgent': 'Selected Agent'
    };

    return fieldMap[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  // 滚动到第一个错误字段
  const scrollToFirstError = (errors) => {
    if (errors.length > 0) {
      const firstErrorField = errors[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`) ||
                    document.querySelector(`input[name="${firstErrorField}"]`) ||
                    document.querySelector(`select[name="${firstErrorField}"]`) ||
                    document.querySelector(`textarea[name="${firstErrorField}"]`);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          element.focus();
        }, 500);
      }
    }
  };

  // 步骤验证函数 - 使用 react-hook-form 和 validation.js
  const validateStep = async (stepNumber) => {
    setIsStepValidating(true);
    try {
      // 获取当前表单数据用于条件判断
      const formData = getValues();

      // 获取当前步骤的基础字段
      let fieldsToValidate = [...(stepFields[stepNumber] || [])];

      // 条件性字段添加
      if (stepNumber === 2) {
        // Postal Address条件验证
        if (formData.hasPostalAddress === 'Yes') {
          fieldsToValidate.push('postalCountry', 'postalBuildingPropertyName', 'postalFlatUnitDetails',
                              'postalStreetNumber', 'postalStreetName', 'postalCityTownSuburb',
                              'postalState', 'postalPostcode');
        }
      }

      if (stepNumber === 3) {
        // 教育资格条件验证
        if (formData.hasAchievedQualifications === 'Yes') {
          fieldsToValidate.push('qualificationLevel', 'qualificationName',
                              'qualificationRecognition', 'institutionName', 'stateCountry');
        }

        // English Test条件验证
        if (formData.hasCompletedEnglishTest === 'English test') {
          fieldsToValidate.push('englishTestType', 'listeningScore', 'readingScore',
                              'writingScore', 'speakingScore', 'overallScore', 'engTestDate');
        }
      }

      // 使用 react-hook-form 的 trigger 来验证字段
      const isValid = await trigger(fieldsToValidate);

      // 如果验证失败，处理错误显示
      if (!isValid) {
        // 找到当前步骤中有错误的字段
        const errorFields = fieldsToValidate.filter(field => errors[field]);

        // Step 4 还需要验证文件
        let missingFiles = [];
        if (stepNumber === 4) {
          missingFiles = validateRequiredFiles();
        }

        // 组合字段错误和文件错误
        const allErrorFields = [...errorFields, ...missingFiles];
        const friendlyErrors = allErrorFields.map(field => getFieldDisplayName(field));

        // 显示用户友好的错误提示
        const stepNames = ['', 'Personal Information', 'Contact Details', 'Education & Language', 'Course & Documents'];
        const stepName = stepNames[stepNumber] || `Step ${stepNumber}`;

        if (friendlyErrors.length <= 3) {
          toast.error(`Please complete the following required fields in ${stepName}: ${friendlyErrors.join(', ')}`, {
            duration: 6000,
            position: 'top-center',
            style: {
              maxWidth: '500px',
            }
          });
        } else {
          toast.error(`Please complete all required fields in ${stepName}. ${friendlyErrors.length} fields need to be filled.`, {
            duration: 5000,
            position: 'top-center',
            style: {
              maxWidth: '400px',
            }
          });
        }

        // 滚动到第一个错误字段
        if (allErrorFields.length > 0) {
          scrollToFirstError(allErrorFields);
        }

        // 验证失败时不需要更新 stepValidation state，因为这会导致按钮永久禁用
        return false;
      }

      // 验证成功，可以进入下一步
      return true;
    } catch (error) {
      console.error('Step validation error:', error);
      toast.error('An error occurred while validating the form. Please try again.', {
        duration: 4000,
        position: 'top-center'
      });
      return false;
    } finally {
      setIsStepValidating(false);
    }
  };

  // 步骤导航函数
  const goToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= 4) {
      setCurrentFormStep(stepNumber);
      saveProgressToStorage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextStep = async () => {
    const isValid = await validateStep(currentFormStep);
    if (isValid) {
      setCompletedSteps(prev => new Set([...prev, currentFormStep]));
      if (currentFormStep < 4) {
        goToStep(currentFormStep + 1);
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentFormStep > 1) {
      goToStep(currentFormStep - 1);
    }
  };

  // 恢复保存的数据
  useEffect(() => {
    loadProgressFromStorage();
  }, [loadProgressFromStorage]);

  // 注册selectedAgent字段 (if showAgentSelect is true)
  useEffect(() => {
    const needsAgent = showAgentSelect || howDidYouHearAboutUs === 'Agent';
    register('selectedAgent', {
      required: needsAgent ? 'Please select an agent' : false
    });
  }, [register, showAgentSelect, howDidYouHearAboutUs]);

  useEffect(() => {
    if (howDidYouHearAboutUs !== 'Agent') {
      const formValues = getValues();
      formValues.selectedAgent = '';
      formValues.agentName = '';
      formValues.agentEmail = '';
      reset(formValues);
    }
  }, [howDidYouHearAboutUs]);

  // 定期保存进度
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentFormStep && getValues) {
        saveProgressToStorage();
      }
    }, 30000); // 每30秒保存一次

    return () => clearInterval(interval);
  }, [currentFormStep, getValues, saveProgressToStorage]);

  // 页面卸载时保存进度
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProgressToStorage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveProgressToStorage]);

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

  // 加载课程入学日期数据
  useEffect(() => {
    const loadCourseIntakes = async () => {
      setIsLoadingIntakes(true);
      setIntakeError(null);

      try {
        console.log('🗓️ 开始加载课程入学日期...');

        const result = await fetchCourseIntakes();

        if (result.success && result.data.length > 0) {
          setIntakeOptions(result.data);
          console.log('✅ 课程入学日期加载成功:', result.data);
        } else {
          // 使用默认选项
          console.warn('⚠️ 未找到课程入学日期，使用默认选项');
          setIntakeOptions(getDefaultIntakeOptions());
          setIntakeError('无法获取最新的入学日期，显示默认选项');
          toast.error('无法获取最新入学日期，使用默认选项', {
            duration: 4000,
            position: 'bottom-right'
          });
        }
      } catch (error) {
        console.error('❌ 加载课程入学日期失败:', error);
        setIntakeOptions(getDefaultIntakeOptions());
        setIntakeError(`获取入学日期失败: ${error.message}`);
        toast.error('获取入学日期失败，使用默认选项', {
          duration: 5000,
          position: 'bottom-right'
        });
      } finally {
        setIsLoadingIntakes(false);
      }
    };

    loadCourseIntakes();
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

  // 创建动态的Course Intake字段配置
  const selectedIntakeField = {
    ...FORM_FIELDS.selectedIntake,
    placeholder: isLoadingIntakes ? 'Loading intake dates...' : 'Please select your preferred intake date',
    options: intakeOptions.map(intake => ({
      value: intake.value,
      label: intake.displayText
    }))
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

  // Comprehensive pre-submit validation function
  const validateAllRequiredFields = async () => {
    const formData = getValues();
    const allRequiredFields = new Set(); // Use Set to avoid duplicates

    // Get all base required fields from all steps
    [...stepFields[1], ...stepFields[2], ...stepFields[3], ...stepFields[4]].forEach(field => {
      allRequiredFields.add(field);
    });

    // Add conditional fields based on user selections
    if (formData.hasPostalAddress === 'Yes') {
      ['postalCountry', 'postalStreetNumber', 'postalStreetName',
       'postalCityTownSuburb', 'postalState', 'postalPostcode'].forEach(field => {
        allRequiredFields.add(field);
      });
    }

    // Agent selection - only add if not already in stepFields and condition is met
    const needsAgent = showAgentSelect || formData.howDidYouHearAboutUs === 'Agent';
    if (needsAgent) {
      allRequiredFields.add('selectedAgent');
    }

    if (formData.hasCompletedEnglishTest === 'English test') {
      ['englishTestType', 'listeningScore', 'readingScore',
       'writingScore', 'speakingScore', 'overallScore', 'engTestDate'].forEach(field => {
        allRequiredFields.add(field);
      });
    }

    if (formData.hasAchievedQualifications === 'Yes') {
      ['qualificationLevel', 'qualificationName', 'qualificationRecognition',
       'institutionName', 'stateCountry'].forEach(field => {
        allRequiredFields.add(field);
      });
    }

    // Convert Set back to Array for validation
    const fieldsToValidate = Array.from(allRequiredFields);

    // Use react-hook-form trigger to validate all fields
    const isFormValid = await trigger(fieldsToValidate);

    // Check for form field errors
    const fieldErrors = fieldsToValidate.filter(field => errors[field]);

    // Check for missing files
    const missingFiles = validateRequiredFiles();

    // Combine all validation results
    const allErrors = [...fieldErrors, ...missingFiles];

    return {
      isValid: isFormValid && missingFiles.length === 0,
      fieldErrors,
      missingFiles,
      allErrors
    };
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
    setSubmissionStep(stepId);
  };

  const resetProgressModal = () => {
    setIsProgressModalOpen(false);
    setSubmissionStep('');
    setStepStatuses({});
    setProgressErrors({});
    setIsSubmissionComplete(false);
  };

  // Review Modal handlers
  const handleReviewSubmit = async () => {
    try {
      // 执行全面的预提交验证
      const validationResult = await validateAllRequiredFields();

      if (!validationResult.isValid) {
        // 设置文件验证错误状态
        setFileValidationErrors(validationResult.missingFiles);

        // 收集所有错误信息
        const friendlyErrors = validationResult.allErrors.map(field => getFieldDisplayName(field));

        // 显示错误提示
        if (friendlyErrors.length <= 3) {
          toast.error(`Please complete the following required fields: ${friendlyErrors.join(', ')}`, {
            duration: 6000,
            position: 'top-center',
            style: {
              maxWidth: '500px',
            }
          });
        } else {
          toast.error(`Please complete all required fields. ${friendlyErrors.length} fields need to be filled.`, {
            duration: 5000,
            position: 'top-center',
            style: {
              maxWidth: '400px',
            }
          });
        }

        // 滚动到第一个错误字段
        if (validationResult.fieldErrors.length > 0) {
          scrollToFirstError(validationResult.fieldErrors);
        }

        return; // 不显示review modal
      }

      // 清除文件验证错误状态（如果验证通过）
      setFileValidationErrors([]);

      // 验证通过，显示Review Modal
      setShowReviewModal(true);
    } catch (error) {
      console.error('Pre-submit validation error:', error);
      toast.error('An error occurred while validating the form. Please try again.', {
        duration: 4000,
        position: 'top-center'
      });
    }
  };

  const handleConfirmSubmit = () => {
    // 关闭Review Modal并执行原有的submit流程
    setShowReviewModal(false);

    // 使用handleSubmit来触发表单验证和提交
    handleSubmit(onSubmit)();
  };

  const handleEditFromReview = () => {
    // 关闭Review Modal，用户可以继续编辑
    setShowReviewModal(false);
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
      const currentSubmissionStep = submissionStep || 'preparing';
      updateStepStatus(currentSubmissionStep, 'error', errorMessage);
      if (!isProduction) {
        console.error('🚨 Submission error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      {/* 返回按钮 - 响应式定位 */}
      {onBackToHome && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 md:top-8 md:left-8 z-10">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 text-gray-600 hover:text-gray-800 transition-colors text-xs sm:text-sm md:text-lg bg-white px-2 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full shadow-md hover:shadow-lg"
          >
            <ArrowLeft size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      )}

      <div className={`max-w-4xl mx-auto p-3 sm:p-4 md:p-6 bg-white rounded-lg shadow-lg ${onBackToHome ? 'mt-12 sm:mt-16 md:mt-4' : ''}`}>
        {/* 标题 */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 text-center">
            Long Course Student Application Form
          </h1>

          {/* English Only Instruction */}
          <div className="mt-3 md:mt-4 p-3 md:p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs sm:text-sm font-medium text-amber-800 text-center">
                <strong>Important:</strong> All information on this form must be completed in English only. Please ensure all personal details, addresses, and other text entries are written in English.
              </p>
            </div>
          </div>
        </div>

        {/* 步骤进度条 */}
        <StepProgressBar
          currentStep={currentFormStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
          {/* 步骤 1: 个人基本信息 */}
          {currentFormStep === 1 && (
            <div className="space-y-6 md:space-y-8">
              {/* Agent选择 - 仅在showAgentSelect为true时显示 */}
              {showAgentSelect && (
                <div className="bg-blue-50 p-4 md:p-6 rounded-lg border-2 border-blue-200">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">Agent Selection</h2>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Selected Agent {FORM_FIELDS.selectedAgent.required && <span className="text-red-500">*</span>}
                    </label>
                    <AgentSelector
                      value={selectedAgent || ''}
                      onChange={(value) => {
                        const formValues = getValues();
                        formValues.selectedAgent = value;
                        // populate details if agent is known or clear if empty
                        const agent = value
                          ? agentService.getAgentByValue((agentService.cache?.data?.items) || [], value)
                          : null;
                        formValues.agentName = agent?.contact || '';
                        formValues.agentEmail = (agent?.emails && agent.emails[0]) || '';
                        reset(formValues);
                      }}
                      onAgentSelected={(agent) => {
                        const formValues = getValues();
                        formValues.selectedAgent = `${agent.name}|${agent.country || ''}`;
                        formValues.agentName = agent.contact || '';
                        formValues.agentEmail = (agent.emails && agent.emails[0]) || '';
                        reset(formValues);
                      }}
                      error={errors.selectedAgent?.message}
                      placeholder="Search and select your assigned agent"
                      required={FORM_FIELDS.selectedAgent.required}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Please search and select your assigned agent from the dynamically loaded list above
                  </p>
                </div>
              )}

              {/* Personal Information */}
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg shadow-sm">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">Personal Information</h2>

                {/* Basic Information Panel */}
                <CollapsibleSection
                  title="Basic Information"
                  defaultOpen={true}
                  description="Essential personal details and contact information"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
            </div>
          )}

          {/* 步骤 2: 地址和联系信息 */}
          {currentFormStep === 2 && (
            <div className="space-y-6 md:space-y-8">
              {/* Current Address */}
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg shadow-sm">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">Current Address</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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

              {/* Postal Address (conditional) */}
              {hasPostalAddress === 'Yes' && (
                <div className="bg-blue-50 p-4 md:p-6 rounded-lg border-2 border-blue-200">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">Postal Address</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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

              {/* Emergency/Guardian Contact */}
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg shadow-sm">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">Emergency/Guardian Contact</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
            </div>
          )}

          {/* 步骤 3: 教育和语言背景 */}
          {currentFormStep === 3 && (
            <div className="space-y-6 md:space-y-8">
              {/* Language and Cultural Diversity */}
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg shadow-sm">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">Language and Cultural Diversity</h2>
                <div className="space-y-6 md:space-y-8">
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

              {/* English Test (conditional) */}
              {hasCompletedEnglishTest === 'English test' && (
                <div className="bg-blue-50 p-4 md:p-6 rounded-lg border-2 border-blue-200">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">English Test</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
                  <div className="mt-6 md:mt-8">
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

              {/* Education History */}
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg shadow-sm">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">Education History</h2>
                <div className="space-y-6 md:space-y-8">
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

              {/* The Highest Qualification Achieved (conditional) */}
              {hasAchievedQualifications === 'Yes' && (
                <div className="bg-blue-50 p-4 md:p-6 rounded-lg border-2 border-blue-200">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">The Highest Qualification Achieved</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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

              {/* Employment */}
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg shadow-sm">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">Employment</h2>
                <div className="space-y-6 md:space-y-8">
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
            </div>
          )}

          {/* 步骤 4: 课程和文档 */}
          {currentFormStep === 4 && (
            <div className="space-y-6 md:space-y-8">
              {/* How did you hear about us? */}
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg shadow-sm">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">How did you hear about us?</h2>
                <div className="space-y-6 md:space-y-8">
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

              {/* Agent Details (conditional) */}
              {howDidYouHearAboutUs === 'Agent' && (
                <div className="bg-blue-50 p-4 md:p-6 rounded-lg border-2 border-blue-200">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">Agent Details</h2>
                  {/* Agent selector */}
                  <div className="space-y-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Agent <span className="text-red-500">*</span>
                    </label>
                    <AgentSelector
                      value={selectedAgent || ''}
                      onChange={(value) => {
                        const formValues = getValues();
                        formValues.selectedAgent = value;
                        const agent = value
                          ? agentService.getAgentByValue((agentService.cache?.data?.items) || [], value)
                          : null;
                        formValues.agentName = agent?.contact || '';
                        formValues.agentEmail = (agent?.emails && agent.emails[0]) || '';
                        reset(formValues);
                      }}
                      onAgentSelected={(agent) => {
                        const formValues = getValues();
                        formValues.selectedAgent = `${agent.name}|${agent.country}`;
                        formValues.agentName = agent.contact || '';
                        formValues.agentEmail = (agent.emails && agent.emails[0]) || '';
                        reset(formValues);
                      }}
                      error={errors.selectedAgent?.message}
                      placeholder="Search and select your agent"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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

              {/* Course Intake Selection */}
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg shadow-sm">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">Course Intake Selection</h2>

                {/* Display error message if any */}
                {intakeError && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <strong>Notice:</strong> {intakeError}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <FormField
                    field={selectedIntakeField}
                    register={register}
                    error={errors.selectedIntake}
                  />

                  {/* Information note */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Please select your preferred course intake date. This will be your intended start date for the Certificate V in Construction Management course.
                      {isLoadingIntakes && (
                        <span className="ml-2 text-blue-600">Loading available dates...</span>
                      )}
                    </p>
                  </div>

                  {/* Show retry button if there was an error */}
                  {intakeError && !isLoadingIntakes && (
                    <button
                      type="button"
                      onClick={() => {
                        // Trigger reload of intake data
                        window.location.reload();
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Retry Loading Intake Dates
                    </button>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg shadow-sm">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">Terms and Conditions</h2>
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
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg shadow-sm">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">File Upload</h2>
                <FileUpload
                  requiredFiles={requiredFiles}
                  setRequiredFiles={setRequiredFiles}
                  optionalFiles={optionalFiles}
                  setOptionalFiles={setOptionalFiles}
                  englishProficiencyMethod={hasCompletedEnglishTest}
                  validationErrors={fileValidationErrors}
                />
              </div>

              {/* Test buttons - hidden in production */}
              {!isProduction && (
                <div className="bg-yellow-50 p-4 md:p-6 rounded-lg border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4">Development Tools</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Preview JSON Button */}
                    <button
                      type="button"
                      onClick={handleSubmit(handlePreviewJSON)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      disabled={isSubmitting}
                    >
                      Preview JSON
                    </button>

                    {/* Test Validation Button */}
                    <button
                      type="button"
                      onClick={handleSubmit(handleTestValidation)}
                      className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm"
                      disabled={isSubmitting || isTestValidating}
                    >
                      {isTestValidating ? 'Testing...' : 'Test Validation'}
                    </button>

                    {/* Power Automate Validator Button */}
                    <button
                      type="button"
                      onClick={() => setShowPowerAutomateValidator(true)}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                    >
                      Test Power Automate
                    </button>

                    {/* File Test Button */}
                    <button
                      type="button"
                      onClick={handleFileTest}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                      disabled={isSubmitting || isFileTestLoading}
                    >
                      {isFileTestLoading ? 'Testing...' : 'Test Files'}
                    </button>

                    {/* View Last Validation Errors Button */}
                    {validationErrors.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowValidationErrors(true)}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm col-span-full"
                      >
                        View Validation Errors ({validationErrors.length})
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 步骤导航 */}
          <StepNavigation
            currentStep={currentFormStep}
            totalSteps={4}
            onPrevious={goToPreviousStep}
            onNext={goToNextStep}
            onSubmit={handleReviewSubmit}
            isSubmitting={isSubmitting}
            isValidating={isStepValidating}
            canProceed={!isStepValidating}
            submitButtonText="Submit Application"
          />
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
          currentStep={submissionStep}
          stepStatuses={stepStatuses}
          errors={progressErrors}
          isComplete={isSubmissionComplete}
        />

        {/* Review Modal */}
        <ReviewModal
          isOpen={showReviewModal}
          onClose={handleEditFromReview}
          formData={getValues()}
          requiredFiles={requiredFiles}
          optionalFiles={optionalFiles}
          onConfirmSubmit={handleConfirmSubmit}
          onEdit={handleEditFromReview}
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm;
