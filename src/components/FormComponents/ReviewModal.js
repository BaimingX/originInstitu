import React from 'react';
import { X, FileText, Edit3, CheckCircle } from 'lucide-react';
import agentService from '../../services/agentService';

const ReviewModal = ({
  isOpen,
  onClose,
  formData,
  requiredFiles,
  optionalFiles,
  onConfirmSubmit,
  onEdit
}) => {
  if (!isOpen) return null;

  // 格式化显示值
  const formatValue = (value, fieldType = 'text') => {
    if (!value) return null; // 返回null而不是'Not specified'

    if (fieldType === 'boolean') {
      return value === 'Yes' || value === true ? 'Yes' : 'No';
    }

    if (fieldType === 'date') {
      return new Date(value).toLocaleDateString();
    }

    return value;
  };

  // 检查字段是否有有效值
  const hasValidValue = (value) => {
    return value !== null && value !== undefined && value !== '';
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 解析选中的代理信息
  const parseSelectedAgent = (selectedAgentValue) => {
    if (!selectedAgentValue || typeof selectedAgentValue !== 'string') {
      return null;
    }

    const [name, country] = selectedAgentValue.split('|');
    if (!name || !country) {
      return null;
    }

    return {
      name: name.trim(),
      country: country.trim(),
      displayText: `${name.trim()} (${country.trim()})`
    };
  };

  // 选项标签映射函数
  const getOptionLabel = (fieldName, value) => {
    // 为特定字段提供完整的选项标签显示
    const optionMappings = {
      qualificationLevel: {
        'Certificate I': 'Certificate I',
        'Certificate II': 'Certificate II',
        'Certificate III': 'Certificate III',
        'Certificate IV': 'Certificate IV',
        'Diploma': 'Diploma',
        'Advanced Diploma': 'Advanced Diploma',
        'Bachelor Degree': 'Bachelor Degree',
        'Graduate Certificate': 'Graduate Certificate',
        'Graduate Diploma': 'Graduate Diploma',
        'Masters Degree': 'Masters Degree',
        'Doctoral Degree': 'Doctoral Degree'
      },
      qualificationRecognition: {
        'Formal': 'Formal qualification from accredited institution',
        'Non-formal': 'Non-formal training or professional development',
        'Informal': 'Informal learning or work experience',
        'None': 'No formal recognition'
      },
      currentEmploymentStatus: {
        'Full-time Employee': 'Full-time Employee',
        'Part-time Employee': 'Part-time Employee',
        'Self-employed': 'Self-employed',
        'Employer': 'Employer',
        'Unemployed seeking work': 'Unemployed seeking work',
        'Unemployed not seeking work': 'Unemployed not seeking work'
      }
    };

    return optionMappings[fieldName]?.[value] || value;
  };

  // 分组数据结构
  const reviewSections = [
    {
      title: 'Personal Information',
      icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
      fields: [
        { label: 'Title', value: formatValue(formData.title) },
        { label: 'First Name', value: formatValue(formData.firstName) },
        { label: 'Middle Name', value: formatValue(formData.middleName) },
        { label: 'Family Name', value: formatValue(formData.familyName) },
        { label: 'Preferred Name', value: formatValue(formData.preferredName) },
        { label: 'Gender', value: formatValue(formData.gender) },
        { label: 'Date of Birth', value: formatValue(formData.dateOfBirth, 'date') },
        { label: 'Email Address', value: formatValue(formData.email) },
        { label: 'Place of Birth', value: formatValue(formData.birthplace) },
        { label: 'Country of Birth', value: formatValue(formData.countryOfBirth) },
        { label: 'Nationality', value: formatValue(formData.nationality) },
        { label: 'Passport Number', value: formatValue(formData.passportNumber) },
        { label: 'Passport Expiry Date', value: formatValue(formData.passportExpiryDate, 'date') },
        { label: 'Visa Type', value: formatValue(formData.visaType) },
        { label: 'USI', value: formatValue(formData.usi) }
      ].filter(field => hasValidValue(field.value))
    },
    {
      title: 'Current Address',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      fields: [
        { label: 'Country', value: formatValue(formData.currentCountry) },
        { label: 'Building/Property Name', value: formatValue(formData.buildingPropertyName) },
        { label: 'Flat/Unit Details', value: formatValue(formData.flatUnitDetails) },
        { label: 'Street Number', value: formatValue(formData.streetNumber) },
        { label: 'Street Name', value: formatValue(formData.streetName) },
        { label: 'City/Town/Suburb', value: formatValue(formData.cityTownSuburb) },
        { label: 'State', value: formatValue(formData.state) },
        { label: 'Postcode', value: formatValue(formData.postcode) },
        { label: 'Mobile Phone', value: formatValue(formData.mobilePhone) }
      ].filter(field => hasValidValue(field.value))
    },
    ...(formData.hasPostalAddress === 'Yes' ? [{
      title: 'Postal Address',
      icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
      fields: [
        { label: 'Country', value: formatValue(formData.postalCountry) },
        { label: 'Building/Property Name', value: formatValue(formData.postalBuildingPropertyName) },
        { label: 'Flat/Unit Details', value: formatValue(formData.postalFlatUnitDetails) },
        { label: 'Street Number', value: formatValue(formData.postalStreetNumber) },
        { label: 'Street Name', value: formatValue(formData.postalStreetName) },
        { label: 'City/Town/Suburb', value: formatValue(formData.postalCityTownSuburb) },
        { label: 'State', value: formatValue(formData.postalState) },
        { label: 'Postcode', value: formatValue(formData.postalPostcode) }
      ].filter(field => hasValidValue(field.value))
    }] : []),
    {
      title: 'Emergency Contact',
      icon: <CheckCircle className="w-5 h-5 text-red-600" />,
      fields: [
        { label: 'Contact Type', value: formatValue(formData.contactType) },
        { label: 'Relationship', value: formatValue(formData.relationship) },
        { label: 'Contact Given Name', value: formatValue(formData.contactGivenName) },
        { label: 'Contact Family Name', value: formatValue(formData.contactFamilyName) },
        { label: 'Contact Email', value: formatValue(formData.contactEmail) },
        { label: 'Contact Mobile', value: formatValue(formData.contactMobile) },
        { label: 'Contact Flat/Unit Details', value: formatValue(formData.contactFlatUnitDetails) },
        { label: 'Contact Street Address', value: formatValue(formData.contactStreetAddress) },
        { label: 'Contact City/Town/Suburb', value: formatValue(formData.contactCityTownSuburb) },
        { label: 'Contact State', value: formatValue(formData.contactState) },
        { label: 'Contact Postcode', value: formatValue(formData.contactPostcode) },
        { label: 'Contact Country', value: formatValue(formData.contactCountry) },
        { label: 'Languages Spoken', value: formatValue(formData.contactLanguagesSpoken) }
      ].filter(field => hasValidValue(field.value))
    },
    {
      title: 'Language and Cultural Diversity',
      icon: <CheckCircle className="w-5 h-5 text-purple-600" />,
      fields: [
        { label: 'Aboriginal', value: formatValue(formData.isAboriginal, 'boolean') },
        { label: 'Torres Strait Islander', value: formatValue(formData.isTorresStraitIslander, 'boolean') },
        { label: 'English Main Language', value: formatValue(formData.isEnglishMainLanguage, 'boolean') },
        { label: 'English Instruction Language', value: formatValue(formData.wasEnglishInstructionLanguage, 'boolean') },
        { label: 'English Test Completed', value: formatValue(formData.hasCompletedEnglishTest) },
        ...(formData.hasCompletedEnglishTest === 'English test' ? [
          { label: 'English Test Type', value: formatValue(formData.englishTestType) },
          { label: 'Listening Score', value: formatValue(formData.listeningScore) },
          { label: 'Reading Score', value: formatValue(formData.readingScore) },
          { label: 'Writing Score', value: formatValue(formData.writingScore) },
          { label: 'Speaking Score', value: formatValue(formData.speakingScore) },
          { label: 'Overall Score', value: formatValue(formData.overallScore) },
          { label: 'Test Date', value: formatValue(formData.engTestDate, 'date') }
        ] : [])
      ].filter(field => hasValidValue(field.value))
    },
    {
      title: 'Education Background',
      icon: <CheckCircle className="w-5 h-5 text-indigo-600" />,
      fields: [
        { label: 'Highest School Level', value: formatValue(formData.highestSchoolLevel) },
        { label: 'Still Attending School', value: formatValue(formData.isStillAttendingSchool, 'boolean') },
        { label: 'Achieved Qualifications', value: formatValue(formData.hasAchievedQualifications, 'boolean') },
        ...(formData.hasAchievedQualifications === 'Yes' ? [
          { label: 'Qualification Level', value: getOptionLabel('qualificationLevel', formData.qualificationLevel) },
          { label: 'Qualification Name', value: formatValue(formData.qualificationName) },
          { label: 'Institution Name', value: formatValue(formData.institutionName) },
          { label: 'Achievement Recognition', value: getOptionLabel('qualificationRecognition', formData.qualificationRecognition) },
          { label: 'State/Country', value: formatValue(formData.stateCountry) }
        ] : [])
      ].filter(field => hasValidValue(field.value))
    },
    {
      title: 'Employment',
      icon: <CheckCircle className="w-5 h-5 text-amber-600" />,
      fields: [
        { label: 'Current Employment Status', value: getOptionLabel('currentEmploymentStatus', formData.currentEmploymentStatus) },
        { label: 'Industry of Employment', value: formatValue(formData.industryOfEmployment) },
        { label: 'Occupation', value: formatValue(formData.occupationIdentifier) }
      ].filter(field => hasValidValue(field.value))
    },
    {
      title: 'Course Selection & Marketing',
      icon: <CheckCircle className="w-5 h-5 text-orange-600" />,
      fields: (() => {
        const fields = [
          { label: 'How Did You Hear About Us', value: formatValue(formData.howDidYouHearAboutUs) },
          { label: 'Details', value: formatValue(formData.howDidYouHearDetails) },
          { label: 'Selected Course Intake', value: formatValue(formData.selectedIntake) }
        ];

        // Add selected agent information if available
        const selectedAgent = parseSelectedAgent(formData.selectedAgent);
        if (selectedAgent) {
          fields.push(
            { label: 'Assigned Agent', value: selectedAgent.displayText },
            { label: 'Agent Country', value: selectedAgent.country }
          );
        }

        // Add agent details from "How did you hear about us" section
        if (hasValidValue(formData.agentName)) {
          fields.push({ label: 'Agent Name', value: formatValue(formData.agentName) });
        }
        if (hasValidValue(formData.agentEmail)) {
          fields.push({ label: 'Agent Email', value: formatValue(formData.agentEmail) });
        }

        fields.push({ label: 'Terms and Conditions', value: formatValue(formData.agreeToTerms, 'boolean') });

        return fields.filter(field => hasValidValue(field.value));
      })()
    }
  ];

  // 文件信息
  const allFiles = { ...requiredFiles, ...optionalFiles };
  const fileEntries = Object.entries(allFiles).filter(([_, file]) => file);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Application Review</h2>
            <p className="text-gray-600 mt-1">Please review your information before submitting</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close review"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {reviewSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  {section.icon}
                  <h3 className="text-lg font-semibold text-gray-900 ml-2">{section.title}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="bg-white p-3 rounded border">
                      <dt className="text-sm font-medium text-gray-600 mb-1">{field.label}</dt>
                      <dd className="text-sm text-gray-900 break-words">{field.value}</dd>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Files Section */}
            {fileEntries.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 ml-2">Uploaded Documents</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fileEntries.map(([fileType, file], index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <dt className="text-sm font-medium text-gray-600 mb-1">
                        {fileType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </dt>
                      <dd className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="truncate mr-2">{file.name}</span>
                          <span className="text-gray-500 text-xs">({formatFileSize(file.size)})</span>
                        </div>
                      </dd>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-200 space-y-3 sm:space-y-0">
          <button
            onClick={onEdit}
            className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Back to Edit
          </button>
          <button
            onClick={onConfirmSubmit}
            className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center font-semibold"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirm & Submit Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;