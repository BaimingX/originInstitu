import { mapFormDataToPowerAutomateJSON, validateMappedData } from './formDataMapper';

/**
 * Production Form Submission Service
 * Handles form submission to Power Automate in production environment
 */

const POWER_AUTOMATE_CONFIG = {
  studentFlowUrl: process.env.REACT_APP_POWER_AUTOMATE_STUDENT_FLOW_URL || '',
  agentFlowUrl: process.env.REACT_APP_POWER_AUTOMATE_AGENT_FLOW_URL || ''
};

/**
 * Value to label mapping functions for Power Automate (production optimized)
 */
const getEmploymentStatusLabel = (value) => {
  const mappings = {
    '01': '01: Full-time employee',
    '02': '02: Part-time employee',
    '03': '03: Self-employed - not employing others',
    '04': '04: Employer',
    '05': '05: Employed - unpaid worker in a family business',
    '06': '06: Unemployed - seeking full-time work',
    '07': '07: Unemployed - seeking part-time work',
    '08': '08: Not employed - not seeking employment',
    '@@': '@@ - Not Specified'
  };
  return mappings[value] || value;
};

const getIndustryOfEmploymentLabel = (value) => {
  const mappings = {
    'A': 'A - Agriculture, Forestry and Fishing',
    'B': 'B - Mining',
    'C': 'C - Manufacturing',
    'D': 'D - Electricity, Gas, Water and Waste Services',
    'E': 'E - Construction',
    'F': 'F - Wholesale Trade',
    'G': 'G - Retail Trade',
    'H': 'H - Accommodation and Food Services',
    'I': 'I - Transport, Postal and Warehousing',
    'J': 'J - Information Media and telecommunications',
    'K': 'K - Financial and Insurance Services',
    'L': 'L - Rental, Hiring and real Estate Services',
    'M': 'M - Professional, Scientific and Technical Services',
    'N': 'N - Administrative and Support Services',
    'O': 'O - Public Administration and Safety',
    'P': 'P - Education and Training',
    'Q': 'Q - Health Care and Social Assistance',
    'R': 'R - Arts and recreation Services',
    'S': 'S - Other Services'
  };
  return mappings[value] || value;
};

const getOccupationIdentifierLabel = (value) => {
  const mappings = {
    '1': '1 - Manager',
    '2': '2 - Professionals',
    '3': '3 - Technicians and Trades Workers',
    '4': '4 - Community and personal Service Workers',
    '5': '5 - Clerical and Administrative Workers',
    '6': '6 - Sales Workers',
    '7': '7 - Machinery Operators and Drivers',
    '8': '8 - Labourers',
    '9': '9 - Other'
  };
  return mappings[value] || value;
};

const getQualificationLevelLabel = (value) => {
  const mappings = {
    '008': '008 - Bachelor Degree or Higher Degree Level',
    '410': '410 - Advanced Diploma or Associate Degree Level',
    '420': '420 - Diploma Level',
    '511': '511 - Certificate IV',
    '514': '514 - Certificate III',
    '521': '521 - Certificate II',
    '524': '524 - Certificate I',
    '990': '990 - Miscellaneous Education'
  };
  return mappings[value] || value;
};

const getQualificationRecognitionLabel = (value) => {
  const mappings = {
    'A': 'A - Australian qualification',
    'E': 'E - Australian equivalent',
    'I': 'I - International'
  };
  return mappings[value] || value;
};

const getHighestSchoolLevelLabel = (value) => {
  return value; // Already in full format
};

/**
 * Submit form data to Power Automate
 * @param {Object} formData - Form data from react-hook-form
 * @param {Array} files - Files array (optional, defaults to empty)
 * @param {string} flowType - 'student' or 'agent' to determine which endpoint to use
 * @returns {Object} Submission result with success status and response data
 */
export const submitFormToPowerAutomate = async (formData, files = [], flowType = 'student') => {
  try {
    // Step 1: Get the appropriate flow URL
    const flowUrl = flowType === 'agent'
      ? POWER_AUTOMATE_CONFIG.agentFlowUrl
      : POWER_AUTOMATE_CONFIG.studentFlowUrl;

    if (!flowUrl) {
      throw new Error(`${flowType} flow URL not configured`);
    }

    // Step 2: Map form data to Power Automate friendly JSON structure
    const mappedData = mapFormDataToPowerAutomateJSON(formData);

    // Step 3: Validate the mapped JSON structure
    const validation = validateMappedData(mappedData);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Form validation failed: ${validation.errors.join(', ')}`,
        validationErrors: validation.errors,
        timestamp: new Date().toISOString()
      };
    }

    // Step 4: Add Power Automate specific fields with full labels
    const powerAutomateData = { ...mappedData };

    // Add English Language Proficiency completion method
    if (formData.hasCompletedEnglishTest) {
      powerAutomateData.EnglishLanguageProficiencyMethod = formData.hasCompletedEnglishTest;
    }

    // Flatten Education History List
    if (powerAutomateData.EducationHistoryList && powerAutomateData.EducationHistoryList.length > 0) {
      const firstEducation = powerAutomateData.EducationHistoryList[0];
      powerAutomateData.EducationQualificationName = firstEducation.QualificationName;
      powerAutomateData.EducationInstituteName = firstEducation.InstituteName;
      powerAutomateData.EducationInstituteLocation = firstEducation.InstituteLocation;
      powerAutomateData.EducationYearCompleted = firstEducation.YearCompleted;
      powerAutomateData.EducationLevelCode = firstEducation.EducationLevelCode;
      powerAutomateData.EducationAchievementRecognitionCode = firstEducation.AchievementRecognitionCode;
      powerAutomateData.EducationLevelCodeFull = getQualificationLevelLabel(firstEducation.EducationLevelCode);
      powerAutomateData.EducationAchievementRecognitionCodeFull = getQualificationRecognitionLabel(firstEducation.AchievementRecognitionCode);
    }

    // Add Employment fields with full labels
    if (formData.currentEmploymentStatus) {
      powerAutomateData.CurrentEmploymentStatus = formData.currentEmploymentStatus;
      powerAutomateData.CurrentEmploymentStatusFull = getEmploymentStatusLabel(formData.currentEmploymentStatus);
    }
    if (formData.industryOfEmployment) {
      powerAutomateData.IndustryOfEmployment = formData.industryOfEmployment;
      powerAutomateData.IndustryOfEmploymentFull = getIndustryOfEmploymentLabel(formData.industryOfEmployment);
    }
    if (formData.occupationIdentifier) {
      powerAutomateData.OccupationIdentifier = formData.occupationIdentifier;
      powerAutomateData.OccupationIdentifierFull = getOccupationIdentifierLabel(formData.occupationIdentifier);
    }

    // Add Education fields with full labels
    if (formData.qualificationLevel) {
      powerAutomateData.QualificationLevel = formData.qualificationLevel;
      powerAutomateData.QualificationLevelFull = getQualificationLevelLabel(formData.qualificationLevel);
    }
    if (formData.qualificationRecognition) {
      powerAutomateData.QualificationRecognition = formData.qualificationRecognition;
      powerAutomateData.QualificationRecognitionFull = getQualificationRecognitionLabel(formData.qualificationRecognition);
    }
    if (formData.highestSchoolLevel) {
      powerAutomateData.HighestSchoolLevel = formData.highestSchoolLevel;
      powerAutomateData.HighestSchoolLevelFull = getHighestSchoolLevelLabel(formData.highestSchoolLevel);
    }

    // Add How did you hear about us fields
    if (formData.howDidYouHearAboutUs) {
      powerAutomateData.HowDidYouHearAboutUs = formData.howDidYouHearAboutUs;
    }
    if (formData.howDidYouHearDetails) {
      powerAutomateData.HowDidYouHearDetails = formData.howDidYouHearDetails;
    }

    // Add Agent Details fields
    if (formData.agentName) {
      powerAutomateData.AgentName = formData.agentName;
    }
    if (formData.agentEmail) {
      powerAutomateData.AgentEmail = formData.agentEmail;
    }
    if (formData.selectedAgent) {
      powerAutomateData.SelectedAgent = formData.selectedAgent;
    }

    // Step 5: Send HTTP POST request to Power Automate endpoint
    const startTime = performance.now();

    const response = await fetch(flowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(powerAutomateData)
    });

    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    // Step 6: Process response
    let responseData;
    let responseText;

    try {
      responseText = await response.text();
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      responseData = { rawResponse: responseText };
    }

    const result = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseTime: `${responseTime}ms`,
      submittedData: powerAutomateData,
      powerAutomateResponse: responseData,
      flowUrl: flowUrl,
      flowType: flowType,
      timestamp: new Date().toISOString()
    };

    if (response.ok) {
      result.message = 'Application submitted successfully!';
    } else {
      result.error = `Submission failed: ${response.status} ${response.statusText}`;
      result.message = 'There was an error submitting your application. Please try again.';
    }

    return result;

  } catch (error) {
    return {
      success: false,
      error: error.message,
      errorType: error.name,
      timestamp: new Date().toISOString(),
      message: 'Network error occurred. Please check your connection and try again.'
    };
  }
};

/**
 * Check if Power Automate endpoints are configured
 * @returns {Object} Configuration status
 */
export const checkPowerAutomateConfiguration = () => {
  return {
    studentFlowConfigured: !!POWER_AUTOMATE_CONFIG.studentFlowUrl,
    agentFlowConfigured: !!POWER_AUTOMATE_CONFIG.agentFlowUrl,
    studentFlowUrl: POWER_AUTOMATE_CONFIG.studentFlowUrl || 'Not configured',
    agentFlowUrl: POWER_AUTOMATE_CONFIG.agentFlowUrl || 'Not configured'
  };
};

const formSubmissionService = {
  submitFormToPowerAutomate,
  checkPowerAutomateConfiguration
};

export default formSubmissionService;