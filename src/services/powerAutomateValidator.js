import { mapFormDataToPowerAutomateJSON, validateMappedData, formatJSONForDisplay } from './formDataMapper';

/**
 * Power Automate Test Validation Service
 * Sends generated JSON to Power Automate endpoint for testing
 */

/**
 * Value to label mapping functions for Power Automate
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
  // For highest school level, the values already contain the full description
  // e.g., '02 - Did not go to school', '12 - Completed Year 12'
  return value; // Return as is since it's already in full format
};

const POWER_AUTOMATE_CONFIG = {
  studentFlowUrl: process.env.REACT_APP_POWER_AUTOMATE_STUDENT_FLOW_URL || '',
  agentFlowUrl: process.env.REACT_APP_POWER_AUTOMATE_AGENT_FLOW_URL || ''
};

/**
 * Test form data validation by sending JSON to Power Automate endpoint
 * @param {Object} formData - Form data to test
 * @param {Array} files - Files array (optional, defaults to empty)
 * @param {string} flowType - 'student' or 'agent' to determine which endpoint to use
 * @returns {Object} Test result with success status, response data, and generated JSON
 */
export const testValidationWithPowerAutomate = async (formData, files = [], flowType = 'student') => {
  try {
    console.log('🧪 Starting Power Automate validation test...');

    // Step 1: Get the appropriate flow URL
    const flowUrl = flowType === 'agent'
      ? POWER_AUTOMATE_CONFIG.agentFlowUrl
      : POWER_AUTOMATE_CONFIG.studentFlowUrl;

    if (!flowUrl) {
      throw new Error(`${flowType} flow URL not configured in environment variables`);
    }

    console.log(`📍 Using ${flowType} flow URL:`, flowUrl);

    // Step 2: Map form data to Power Automate friendly JSON structure (flattened addresses)
    console.log('🔄 Mapping form data to Power Automate JSON structure...');
    const mappedData = mapFormDataToPowerAutomateJSON(formData);
    console.log('📋 Generated Power Automate JSON:', formatJSONForDisplay(mappedData));

    // Step 3: Validate the mapped JSON structure
    console.log('✅ Validating mapped JSON structure...');
    const validation = validateMappedData(mappedData);
    if (!validation.isValid) {
      return {
        success: false,
        error: `JSON validation failed: ${validation.errors.join(', ')}`,
        generatedJSON: mappedData,
        validationErrors: validation.errors,
        timestamp: new Date().toISOString()
      };
    }

    console.log('✅ JSON structure validation passed');

    // Step 4: Add Power Automate specific fields
    const powerAutomateData = { ...mappedData };

    // Add English Language Proficiency completion method (only for Power Automate)
    if (formData.hasCompletedEnglishTest) {
      powerAutomateData.EnglishLanguageProficiencyMethod = formData.hasCompletedEnglishTest;
      console.log('📝 Added English Language Proficiency Method:', formData.hasCompletedEnglishTest);
    }

    // Flatten Education History List (only for Power Automate)
    if (powerAutomateData.EducationHistoryList && powerAutomateData.EducationHistoryList.length > 0) {
      const firstEducation = powerAutomateData.EducationHistoryList[0];
      powerAutomateData.EducationQualificationName = firstEducation.QualificationName;
      powerAutomateData.EducationInstituteName = firstEducation.InstituteName;
      powerAutomateData.EducationInstituteLocation = firstEducation.InstituteLocation;
      powerAutomateData.EducationYearCompleted = firstEducation.YearCompleted;
      powerAutomateData.EducationLevelCode = firstEducation.EducationLevelCode;
      powerAutomateData.EducationAchievementRecognitionCode = firstEducation.AchievementRecognitionCode;

      // Add full label versions for Power Automate
      powerAutomateData.EducationLevelCodeFull = getQualificationLevelLabel(firstEducation.EducationLevelCode);
      powerAutomateData.EducationAchievementRecognitionCodeFull = getQualificationRecognitionLabel(firstEducation.AchievementRecognitionCode);

      console.log('📝 Flattened Education History for Power Automate:', {
        QualificationName: firstEducation.QualificationName,
        InstituteName: firstEducation.InstituteName,
        InstituteLocation: firstEducation.InstituteLocation,
        EducationLevelCodeFull: powerAutomateData.EducationLevelCodeFull,
        EducationAchievementRecognitionCodeFull: powerAutomateData.EducationAchievementRecognitionCodeFull
      });
    }

    // Add Employment fields with full labels (only for Power Automate)
    if (formData.currentEmploymentStatus) {
      powerAutomateData.CurrentEmploymentStatus = formData.currentEmploymentStatus;
      powerAutomateData.CurrentEmploymentStatusFull = getEmploymentStatusLabel(formData.currentEmploymentStatus);
      console.log('📝 Added Current Employment Status:', formData.currentEmploymentStatus, '→', powerAutomateData.CurrentEmploymentStatusFull);
    }
    if (formData.industryOfEmployment) {
      powerAutomateData.IndustryOfEmployment = formData.industryOfEmployment;
      powerAutomateData.IndustryOfEmploymentFull = getIndustryOfEmploymentLabel(formData.industryOfEmployment);
      console.log('📝 Added Industry Of Employment:', formData.industryOfEmployment, '→', powerAutomateData.IndustryOfEmploymentFull);
    }
    if (formData.occupationIdentifier) {
      powerAutomateData.OccupationIdentifier = formData.occupationIdentifier;
      powerAutomateData.OccupationIdentifierFull = getOccupationIdentifierLabel(formData.occupationIdentifier);
      console.log('📝 Added Occupation Identifier:', formData.occupationIdentifier, '→', powerAutomateData.OccupationIdentifierFull);
    }

    // Add Education fields with full labels (only for Power Automate)
    if (formData.qualificationLevel) {
      powerAutomateData.QualificationLevel = formData.qualificationLevel;
      powerAutomateData.QualificationLevelFull = getQualificationLevelLabel(formData.qualificationLevel);
      console.log('📝 Added Qualification Level:', formData.qualificationLevel, '→', powerAutomateData.QualificationLevelFull);
    }
    if (formData.qualificationRecognition) {
      powerAutomateData.QualificationRecognition = formData.qualificationRecognition;
      powerAutomateData.QualificationRecognitionFull = getQualificationRecognitionLabel(formData.qualificationRecognition);
      console.log('📝 Added Qualification Recognition:', formData.qualificationRecognition, '→', powerAutomateData.QualificationRecognitionFull);
    }
    if (formData.highestSchoolLevel) {
      powerAutomateData.HighestSchoolLevel = formData.highestSchoolLevel;
      powerAutomateData.HighestSchoolLevelFull = getHighestSchoolLevelLabel(formData.highestSchoolLevel);
      console.log('📝 Added Highest School Level:', formData.highestSchoolLevel, '→', powerAutomateData.HighestSchoolLevelFull);
    }

    // Add How did you hear about us fields (only for Power Automate)
    if (formData.howDidYouHearAboutUs) {
      powerAutomateData.HowDidYouHearAboutUs = formData.howDidYouHearAboutUs;
      console.log('📝 Added How Did You Hear About Us:', formData.howDidYouHearAboutUs);
    }
    if (formData.howDidYouHearDetails) {
      powerAutomateData.HowDidYouHearDetails = formData.howDidYouHearDetails;
      console.log('📝 Added How Did You Hear Details:', formData.howDidYouHearDetails);
    }

    // Add Agent Details fields (only for Power Automate)
    if (formData.agentName) {
      powerAutomateData.AgentName = formData.agentName;
      console.log('📝 Added Agent Name:', formData.agentName);
    }
    if (formData.agentEmail) {
      powerAutomateData.AgentEmail = formData.agentEmail;
      console.log('📝 Added Agent Email:', formData.agentEmail);
    }
    if (formData.selectedAgent) {
      powerAutomateData.SelectedAgent = formData.selectedAgent;
      console.log('📝 Added Selected Agent:', formData.selectedAgent);
    }

    // Step 5: Prepare HTTP request body
    const requestBody = JSON.stringify(powerAutomateData);
    console.log('📤 Preparing HTTP request to Power Automate...');

    // Step 6: Send HTTP POST request to Power Automate endpoint
    const startTime = performance.now();

    const response = await fetch(flowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: requestBody
    });

    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    console.log(`📊 HTTP Response Status: ${response.status}`);
    console.log(`⏱️ Response Time: ${responseTime}ms`);

    // Step 7: Process response
    let responseData;
    let responseText;

    try {
      responseText = await response.text();
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.warn('⚠️ Could not parse response as JSON, using text response');
      responseData = { rawResponse: responseText };
    }

    const result = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseTime: `${responseTime}ms`,
      generatedJSON: mappedData,
      powerAutomateResponse: responseData,
      rawResponse: responseText,
      headers: Object.fromEntries(response.headers.entries()),
      flowUrl: flowUrl,
      flowType: flowType,
      timestamp: new Date().toISOString()
    };

    if (response.ok) {
      console.log('✅ Power Automate test successful!');
      result.message = 'JSON validation test passed! Power Automate endpoint accepted the data.';
    } else {
      console.error('❌ Power Automate test failed:', response.status, responseText);
      result.error = `Power Automate request failed: ${response.status} ${response.statusText}`;
      result.message = `Test failed with HTTP ${response.status}. Check response details.`;
    }

    return result;

  } catch (error) {
    console.error('🚨 Power Automate validation test error:', error);

    return {
      success: false,
      error: error.message,
      errorType: error.name,
      generatedJSON: null,
      powerAutomateResponse: null,
      timestamp: new Date().toISOString(),
      message: `Network or configuration error: ${error.message}`
    };
  }
};

/**
 * Test with sample form data
 * @param {string} flowType - 'student' or 'agent'
 * @returns {Object} Test result
 */
export const testWithSampleData = async (flowType = 'student') => {
  const sampleStudentData = {
    title: 'Mr',
    firstName: 'Test',
    middleName: '',
    familyName: 'Student',
    preferredName: 'Tester',
    gender: 'Male',
    dateOfBirth: '1995-01-01',
    email: 'test.student@example.com',
    birthplace: 'Beijing',
    countryOfBirth: 'China',
    nationality: 'Chinese',
    passportNumber: 'A12345678',
    passportExpiryDate: '2025-12-31',
    // Address fields
    streetNumber: '123',
    streetName: 'Test Street',
    cityTownSuburb: 'Melbourne',
    state: 'VIC',
    postcode: '3000',
    currentCountry: 'Australia',
    mobilePhone: '+61 400 000 000',
    // Additional required fields for complete JSON
    isEnglishMainLanguage: 'No',
    languageSpokenAtHome: 'Mandarin',
    currentEmploymentStatus: '02',
    industryOfEmployment: 'O',
    occupationIdentifier: '5',
    isAboriginal: 'No',
    isTorresStraitIslander: 'No',
    wasEnglishInstructionLanguage: 'Yes',
    hasCompletedEnglishTest: 'English test',
    highestSchoolLevel: '02 - Did not go to school',
    isStillAttendingSchool: 'No',
    hasAchievedQualifications: 'Yes',
    qualificationName: 'Test Qualification',
    institutionName: 'Test Institution',
    stateCountry: 'China',
    qualificationLevel: '008',
    qualificationRecognition: 'E',
    // Emergency contact
    contactType: 'Guardian',
    relationship: 'Parent',
    contactGivenName: 'Test',
    contactFamilyName: 'Parent',
    contactEmail: 'parent@example.com',
    contactMobile: '+61 400 000 001',
    contactStreetAddress: '123 Test Street',
    contactCityTownSuburb: 'Melbourne',
    contactState: 'VIC',
    contactPostcode: '3000',
    contactCountry: 'Australia',
    contactLanguagesSpoken: 'English, Mandarin',
    // Marketing
    howDidYouHearAboutUs: 'Agent',
    howDidYouHearDetails: 'Referred by agent',
    // Agent Details
    agentName: 'Test Agent Name',
    agentEmail: 'testagent@example.com',
    selectedAgent: 'Test Agent Company'
  };

  const sampleAgentData = {
    formType: 'agent-application',
    agencyName: 'Test Education Agency',
    contactPerson: 'Test Agent',
    primaryEmail: 'agent@test.com',
    tel: '+86 138 0000 0000',
    country: 'China',
    address: '123 Test Road',
    cityTownSuburb: 'Beijing',
    stateProvince: 'Beijing',
    postcode: '100000',
    acn: 'TEST123',
    abn: 'TEST456',
    targetRecruitmentCountry: 'China'
  };

  const testData = flowType === 'agent' ? sampleAgentData : sampleStudentData;

  console.log(`🧪 Running ${flowType} validation test with sample data...`);
  return await testValidationWithPowerAutomate(testData, [], flowType);
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

/**
 * Test value to label conversion functions
 * @returns {Object} Test results
 */
export const testValueToLabelConversions = () => {
  console.log('🧪 Testing Value to Label Conversions...');

  const testResults = {
    employmentStatus: {
      input: '02',
      expected: '02: Part-time employee',
      actual: getEmploymentStatusLabel('02'),
      passed: false
    },
    industryOfEmployment: {
      input: 'O',
      expected: 'O - Public Administration and Safety',
      actual: getIndustryOfEmploymentLabel('O'),
      passed: false
    },
    occupationIdentifier: {
      input: '5',
      expected: '5 - Clerical and Administrative Workers',
      actual: getOccupationIdentifierLabel('5'),
      passed: false
    },
    qualificationLevel: {
      input: '008',
      expected: '008 - Bachelor Degree or Higher Degree Level',
      actual: getQualificationLevelLabel('008'),
      passed: false
    },
    qualificationRecognition: {
      input: 'E',
      expected: 'E - Australian equivalent',
      actual: getQualificationRecognitionLabel('E'),
      passed: false
    },
    highestSchoolLevel: {
      input: '02 - Did not go to school',
      expected: '02 - Did not go to school',
      actual: getHighestSchoolLevelLabel('02 - Did not go to school'),
      passed: false
    }
  };

  // Check if conversions are working correctly
  Object.keys(testResults).forEach(key => {
    const test = testResults[key];
    test.passed = test.actual === test.expected;
    console.log(`${test.passed ? '✅' : '❌'} ${key}: "${test.input}" → "${test.actual}" ${test.passed ? '' : `(expected: "${test.expected}")`}`);
  });

  const allPassed = Object.values(testResults).every(test => test.passed);
  console.log(`🎯 Overall conversion test: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);

  return {
    success: allPassed,
    results: testResults,
    summary: {
      total: Object.keys(testResults).length,
      passed: Object.values(testResults).filter(test => test.passed).length,
      failed: Object.values(testResults).filter(test => !test.passed).length
    }
  };
};

const powerAutomateValidator = {
  testValidationWithPowerAutomate,
  testWithSampleData,
  checkPowerAutomateConfiguration,
  testValueToLabelConversions
};

export default powerAutomateValidator;