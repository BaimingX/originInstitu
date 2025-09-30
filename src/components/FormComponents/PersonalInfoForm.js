import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { FORM_FIELDS } from '../../utils/validation';
import FormField from './FormField';
import FileUpload from './FileUpload';
import SubmitButton from './SubmitButton';
import CollapsibleSection from './CollapsibleSection';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { testValidateOffer, submitOfferWithValidation } from '../../services/cricosApiService';
import { fetchEmploymentStatuses, getDefaultEmploymentStatuses } from '../../services/employmentStatusService';
import { fetchIndustryOfEmployments, getDefaultIndustryOfEmployments } from '../../services/industryOfEmploymentService';
import { fetchOccupationCodes, getDefaultOccupationCodes } from '../../services/occupationCodesService';
import { fetchQualificationLevels, getDefaultQualificationLevels, fetchQualificationAchievementRecognitions, getDefaultQualificationAchievementRecognitions } from '../../services/educationDataService';
import ApiTester from '../ApiTester';
import toast from 'react-hot-toast';

const PersonalInfoForm = ({ onBackToHome, showAgentSelect = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control
  } = useForm();

  // Watch for conditional field dependencies
  const hasPostalAddress = useWatch({ control, name: 'hasPostalAddress' });
  const isEnglishMainLanguage = useWatch({ control, name: 'isEnglishMainLanguage' });
  const hasCompletedEnglishTest = useWatch({ control, name: 'hasCompletedEnglishTest' });
  const hasAchievedQualifications = useWatch({ control, name: 'hasAchievedQualifications' });
  const howDidYouHearAboutUs = useWatch({ control, name: 'howDidYouHearAboutUs' });

  const { isSubmitting, submitStatus, submitForm, previewJSON, clearStatus, isPowerAutomateMode } = useFormSubmit();
  const [files, setFiles] = React.useState([]);
  const [isTestValidating, setIsTestValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [apiResponseData, setApiResponseData] = useState(null);
  const [showApiDebug, setShowApiDebug] = useState(false);
  const [showApiTester, setShowApiTester] = useState(false);
  const [employmentStatusOptions, setEmploymentStatusOptions] = useState(getDefaultEmploymentStatuses());
  const [industryOfEmploymentOptions, setIndustryOfEmploymentOptions] = useState(getDefaultIndustryOfEmployments());
  const [occupationCodesOptions, setOccupationCodesOptions] = useState(getDefaultOccupationCodes());
  const [qualificationLevelsOptions, setQualificationLevelsOptions] = useState(getDefaultQualificationLevels());
  const [qualificationRecognitionsOptions, setQualificationRecognitionsOptions] = useState(getDefaultQualificationAchievementRecognitions());

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


  const onSubmit = async (data) => {
    try {
      // Step 1: Generate and validate JSON structure
      toast.loading('Preparing submission...', { id: 'submit-flow' });

      const preview = previewJSON(data);
      if (!preview.validation.isValid) {
        toast.error(`Form validation failed: ${preview.validation.errors.join(', ')}`, { id: 'submit-flow' });
        return;
      }

      if (!preview.jsonData) {
        toast.error('Failed to generate data structure for submission', { id: 'submit-flow' });
        return;
      }

      console.log('📋 Generated submission data:', preview.jsonData);

      // Step 2: Submit to CRICOS API with validation-first approach
      toast.loading('Submitting to CRICOS API...', { id: 'submit-flow' });

      const cricosResult = await submitOfferWithValidation(preview.jsonData);

      if (cricosResult.success) {
        // CRICOS submission successful
        toast.success('🎉 Application submitted successfully to CRICOS API!', { id: 'submit-flow' });
        console.log('✅ CRICOS submission successful:', cricosResult);

        // Optional: Also submit to SharePoint/Power Automate as backup
        try {
          const backupResult = await submitForm(data, files);
          console.log('📝 Backup submission to SharePoint completed:', backupResult);
          toast.success('✅ Backup copy also saved to SharePoint!', { duration: 3000 });
        } catch (backupError) {
          console.warn('⚠️ Backup submission failed (CRICOS submission was successful):', backupError);
        }

        // Log the successful submission details
        if (preview.jsonData?.OfferId) {
          console.log('Submitted Offer ID:', preview.jsonData.OfferId);
        }

        // Reset form on successful submission
        reset();
        setFiles([]);
        clearStatus();

      } else {
        // CRICOS submission failed
        if (cricosResult.stage === 'validation' && cricosResult.errors?.length > 0) {
          // Validation failed - show detailed errors
          const errorCount = cricosResult.errors.length;
          toast.error(`❌ CRICOS validation failed: ${errorCount} errors found. Please fix and try again.`, {
            id: 'submit-flow',
            duration: 8000
          });

          // Set validation errors for user to view
          setValidationErrors(cricosResult.errors);
          setShowValidationErrors(true);
          setApiResponseData(cricosResult);

          console.error('❌ CRICOS validation failed:', cricosResult);
        } else {
          // Other submission error
          toast.error(`❌ CRICOS submission failed: ${cricosResult.message}`, {
            id: 'submit-flow',
            duration: 8000
          });
          console.error('❌ CRICOS submission error:', cricosResult);
        }
      }

    } catch (error) {
      toast.error(`Submission failed: ${error.message}`, { id: 'submit-flow' });
      console.error('🚨 Submission error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* 返回按钮 - 固定在左上角 */}
      {onBackToHome && (
        <div className="absolute top-8 left-8 z-10">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-3 text-gray-600 hover:text-gray-800 transition-colors text-lg bg-white px-6 py-3 rounded-full shadow-md hover:shadow-lg"
          >
            <ArrowLeft size={24} />
            <span className="font-medium">Back</span>
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Long Course Student Application Form
          </h1>
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
                />
                <FormField
                  field={FORM_FIELDS.postalStreetName}
                  register={register}
                  error={errors.postalStreetName}
                />
                <FormField
                  field={FORM_FIELDS.postalCityTownSuburb}
                  register={register}
                  error={errors.postalCityTownSuburb}
                />
                <FormField
                  field={FORM_FIELDS.postalState}
                  register={register}
                  error={errors.postalState}
                />
                <FormField
                  field={FORM_FIELDS.postalPostcode}
                  register={register}
                  error={errors.postalPostcode}
                />
                <FormField
                  field={FORM_FIELDS.postalMobilePhone}
                  register={register}
                  error={errors.postalMobilePhone}
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
          {hasCompletedEnglishTest === 'Yes' && (
            <div className="bg-blue-50 p-8 rounded-lg border-2 border-blue-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">English Test</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  field={FORM_FIELDS.englishTestType}
                  register={register}
                  error={errors.englishTestType}
                />
                <FormField
                  field={FORM_FIELDS.listeningScore}
                  register={register}
                  error={errors.listeningScore}
                />
                <FormField
                  field={FORM_FIELDS.readingScore}
                  register={register}
                  error={errors.readingScore}
                />
                <FormField
                  field={FORM_FIELDS.writingScore}
                  register={register}
                  error={errors.writingScore}
                />
                <FormField
                  field={FORM_FIELDS.speakingScore}
                  register={register}
                  error={errors.speakingScore}
                />
                <FormField
                  field={FORM_FIELDS.overallScore}
                  register={register}
                  error={errors.overallScore}
                />
              </div>

              {/* Test Date - Independent row */}
              <div className="mt-8">
                <FormField
                  field={FORM_FIELDS.engTestDate}
                  register={register}
                  error={errors.engTestDate}
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
                />
                <FormField
                  field={FORM_FIELDS.qualificationName}
                  register={register}
                  error={errors.qualificationName}
                />
                <FormField
                  field={qualificationRecognitionField}
                  register={register}
                  error={errors.qualificationRecognition}
                />
                <FormField
                  field={FORM_FIELDS.institutionName}
                  register={register}
                  error={errors.institutionName}
                />
                <FormField
                  field={FORM_FIELDS.stateCountry}
                  register={register}
                  error={errors.stateCountry}
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
              files={files}
              setFiles={setFiles}
            />
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> Only PDF files are accepted. Maximum file size: 5MB per file.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-4">
            {/* Preview JSON Button */}
            {/* <button
              type="button"
              onClick={handleSubmit(handlePreviewJSON)}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Preview JSON Structure
            </button> */}

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

            {/* Submit Button */}
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


        {/* API Tester Modal */}
        <ApiTester
          isOpen={showApiTester}
          onClose={() => setShowApiTester(false)}
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm; 