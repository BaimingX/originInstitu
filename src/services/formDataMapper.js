/**
 * Form Data to JSON Mapper Service
 * Maps form data to the required JSON structure for Origin Institute Enrolment Form
 */

/**
 * Generates a unique offer ID in the format used by compose_offer_robust.py
 * @returns {string} Generated offer ID like "OFFER_20250929_143215"
 */
const generateOfferId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `OFFER_${year}${month}${day}_${hours}${minutes}${seconds}`;
};

/**
 * Formats date to ISO string with timezone
 * @param {string|Date} date - Date to format
 * @returns {string} ISO formatted date string
 */
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString();
};

/**
 * Maps gender value to required format
 * @param {string} gender - Gender from form
 * @returns {string} Mapped gender value
 */
const mapGender = (gender) => {
  const genderMap = {
    'Male': 'M',
    'Female': 'F',
    'X': 'X',
    'Other/Not specified': 'X'
  };
  return genderMap[gender] || 'X';
};

/**
 * Maps nationality from form input
 * @param {string} nationality - Nationality from form
 * @param {string} countryOfBirth - Country of birth from form (not used in current logic)
 * @returns {string} Mapped nationality value
 */
const mapNationality = (nationality, countryOfBirth) => {
  // Use the selected nationality directly without mapping
  return nationality || "";
};

/**
 * Maps form data to required JSON structure
 * @param {Object} formData - Form data from react-hook-form
 * @returns {Object} Mapped JSON object
 */
export const mapFormDataToJSON = (formData) => {
  const offerId = generateOfferId();
  const timestamp = formatDate(new Date());

  // Base structure
  const mappedData = {
    OfferId: offerId,
    TimeStamp: timestamp,
    Title: formData.title || "",
    FirstName: formData.firstName || "",
    MiddleName: formData.middleName || "",
    LastName: formData.familyName || "",
    PreferredName: formData.preferredName || "",
    Gender: mapGender(formData.gender),
    DoB: formatDate(formData.dateOfBirth),
    Email: formData.email || "",
    Birthplace: formData.birthplace || "",
    StudentOrigin: "OverseasStudent", // Default for offshore course

    // Compliance and Other Information
    ComplianceAndOtherInfo: {
      OfferId: offerId,
      CountryBirth: formData.countryOfBirth || "",
      Nationality: mapNationality(formData.nationality, formData.countryOfBirth),
      PassportNumber: formData.passportNumber || "",
      PassportExpiryDate: formatDate(formData.passportExpiryDate),
      VisaType: "Student Visa",
      VisaNumber: "V0000000",
      VisaExpiryDate: "",
      FirstLanguage: formData.isEnglishMainLanguage === 'Yes' ? 'English' : (formData.languageSpokenAtHome || ""),
      HowWellEngSpeak: "",
      StudyReason: "04", // Default value
      CurrentEmployStatus: formData.currentEmploymentStatus || "",
      IndustryEmployment: formData.industryOfEmployment || "",
      OccupationCode: formData.occupationIdentifier || "",
      USI: formData.usi || "",
      IsAboriginal: formData.isAboriginal === 'Yes',
      IsTorresStraitIslander: formData.isTorresStraitIslander === 'Yes',
      IsEngLanguageInClass: formData.wasEnglishInstructionLanguage === 'Yes',
      EngTestType: formData.englishTestType || "",
      EngTestDate: formatDate(formData.engTestDate) || null,
      EngTestListeningScore: formData.listeningScore || "",
      EngTestReadingScore: formData.readingScore || "",
      EngTestWritingScore: formData.writingScore || "",
      EngTestSpeakingScore: formData.speakingScore || "",
      EngTestOverallScore: formData.overallScore || "",
      HighSchoolLevel: formData.highestSchoolLevel || "",
      HighSchoolYearCompleted: "",
      IsStillAtHighSchool: formData.isStillAttendingSchool === 'Yes',
      SchoolType: "Government", // Default value
      IsDisabled: false, // Default value - would need additional form fields
      IsRequestHelpForDisabled: false // Default value - would need additional form fields
    },

    // Addresses array
    Addresses: [
      // Current Address
      {
        OfferId: offerId,
        AddressType: "Current",
        IsPrimary: true,
        BuildingName: formData.buildingPropertyName || "",
        FlatUnitDetail: formData.flatUnitDetails || "",
        StreetNumber: formData.streetNumber || "",
        StreetName: formData.streetName || "",
        Suburb: formData.cityTownSuburb || "",
        State: formData.state || "",
        Postcode: formData.postcode || "",
        Country: formData.currentCountry || "",
        Phone: "",
        Fax: "",
        Mobile: formData.mobilePhone || ""
      }
    ],

    // Applied Courses array
    AppliedCourses: [
      {
        OfferId: offerId,
        CourseId: "CPC50220", // Default to Diploma course mentioned in PDF
        CampusId: 1, // Default campus
        IntakeDate: formData.selectedIntake || formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // Use user selected intake date
        StartDate: formData.selectedIntake || formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // Use user selected intake date
        FinishDate: (() => {
          // Calculate finish date: 66 weeks (462 days) after intake date
          const intakeDate = formData.selectedIntake ? new Date(formData.selectedIntake) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          const finishDate = new Date(intakeDate.getTime() + 462 * 24 * 60 * 60 * 1000); // 66 weeks = 462 days
          return formatDate(finishDate);
        })(),
        ELICOS_NumOfWeeks: 0, // Default - not applicable for this course
        TuitionFee: 0.0, // Would come from course pricing
        EnrolmentFee: 0.0, // Would come from course pricing
        MaterialFee: 0.0, // Would come from course pricing
        UpfrontFee: 0.0, // Would come from course pricing
        SpecialCondition: "",
        ApplicationRequest: "",
        Status: "Pending"
      }
    ],

    // Disabilities array - empty by default as not collected in form
    Disabilities: [],

    // Emergency Contact
    EmergencyContact: {
      OfferId: offerId,
      ContactType: formData.contactType || "",
      Relationship: formData.relationship || "",
      ContactName: `${formData.contactGivenName || ""} ${formData.contactFamilyName || ""}`.trim(),
      Address: `${formData.contactFlatUnitDetails || ""} ${formData.contactStreetAddress || ""} ${formData.contactCityTownSuburb || ""} ${formData.contactState || ""} ${formData.contactPostcode || ""} ${formData.contactCountry || ""}`.trim(),
      Phone: formData.contactMobile || "",
      Email: formData.contactEmail || "",
      LanguagesSpoken: formData.contactLanguagesSpoken || ""
    },

    // Education History List
    EducationHistoryList: [],

    // Employment History List
    EmploymentHistoryList: [],

    // Marketing Campaign
    Leads_MarketingCampaign: {
      OfferId: offerId,
      KnowFrom: formData.howDidYouHearAboutUs || "",
      LeadSource: formData.howDidYouHearAboutUs === 'Agent' ? 'Agent' : 'Direct',
      CampaignName: formData.howDidYouHearDetails || "Website"
    }
  };

  // Add postal address if different
  if (formData.hasPostalAddress === 'Yes') {
    mappedData.Addresses.push({
      OfferId: offerId,
      AddressType: "Postal",
      IsPrimary: false,
      BuildingName: formData.postalBuildingPropertyName || "",
      FlatUnitDetail: formData.postalFlatUnitDetails || "",
      StreetNumber: formData.postalStreetNumber || "",
      StreetName: formData.postalStreetName || "",
      Suburb: formData.postalCityTownSuburb || "",
      State: formData.postalState || "",
      Postcode: formData.postalPostcode || "",
      Country: formData.postalCountry || "",
      Phone: "",
      Fax: "",
      Mobile: formData.postalMobilePhone || ""
    });
  }

  // Add education history if qualifications achieved
  if (formData.hasAchievedQualifications === 'Yes') {
    mappedData.EducationHistoryList.push({
      OfferId: offerId,
      QualificationName: formData.qualificationName || "",
      InstituteName: formData.institutionName || "",
      InstituteLocation: formData.stateCountry || "",
      YearCompleted: new Date().getFullYear(), // Default to current year
      EducationLevelCode: formData.qualificationLevel || "",
      AchievementRecognitionCode: formData.qualificationRecognition || ""
    });
  }

  return mappedData;
};

/**
 * Validates required fields in the mapped JSON
 * @param {Object} jsonData - Mapped JSON data
 * @returns {Object} Validation result with isValid and errors
 */
export const validateMappedData = (jsonData) => {
  const errors = [];

  // Check required fields
  if (!jsonData.FirstName) errors.push('First Name is required');
  if (!jsonData.LastName) errors.push('Last Name is required');
  if (!jsonData.Email) errors.push('Email is required');
  if (!jsonData.DoB) errors.push('Date of Birth is required');
  if (!jsonData.ComplianceAndOtherInfo.CountryBirth) errors.push('Country of Birth is required');
  if (!jsonData.ComplianceAndOtherInfo.Nationality) errors.push('Nationality is required');
  if (!jsonData.ComplianceAndOtherInfo.PassportNumber) errors.push('Passport Number is required');

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Maps form data to Power Automate friendly JSON structure (flattened addresses)
 * @param {Object} formData - Form data from react-hook-form
 * @returns {Object} Mapped JSON object with flattened addresses
 */
export const mapFormDataToPowerAutomateJSON = (formData) => {
  const offerId = generateOfferId();
  const timestamp = formatDate(new Date());

  // Base structure (same as original)
  const mappedData = {
    OfferId: offerId,
    TimeStamp: timestamp,
    Title: formData.title || "",
    FirstName: formData.firstName || "",
    MiddleName: formData.middleName || "",
    LastName: formData.familyName || "",
    PreferredName: formData.preferredName || "",
    Gender: mapGender(formData.gender),
    DoB: formatDate(formData.dateOfBirth),
    Email: formData.email || "",
    Birthplace: formData.birthplace || "",
    StudentOrigin: "OverseasStudent", // Default for offshore course

    // Compliance and Other Information (same as original)
    ComplianceAndOtherInfo: {
      OfferId: offerId,
      CountryBirth: formData.countryOfBirth || "",
      Nationality: mapNationality(formData.nationality, formData.countryOfBirth),
      PassportNumber: formData.passportNumber || "",
      PassportExpiryDate: formatDate(formData.passportExpiryDate),
      VisaType: "Student Visa",
      VisaNumber: "V0000000",
      VisaExpiryDate: "",
      FirstLanguage: formData.isEnglishMainLanguage === 'Yes' ? 'English' : (formData.languageSpokenAtHome || ""),
      HowWellEngSpeak: "",
      StudyReason: "04", // Default value
      CurrentEmployStatus: formData.currentEmploymentStatus || "",
      IndustryEmployment: formData.industryOfEmployment || "",
      OccupationCode: formData.occupationIdentifier || "",
      USI: formData.usi || "",
      IsAboriginal: formData.isAboriginal === 'Yes',
      IsTorresStraitIslander: formData.isTorresStraitIslander === 'Yes',
      IsEngLanguageInClass: formData.wasEnglishInstructionLanguage === 'Yes',
      EngTestType: formData.englishTestType || "",
      EngTestDate: formatDate(formData.engTestDate) || null,
      EngTestListeningScore: formData.listeningScore || "",
      EngTestReadingScore: formData.readingScore || "",
      EngTestWritingScore: formData.writingScore || "",
      EngTestSpeakingScore: formData.speakingScore || "",
      EngTestOverallScore: formData.overallScore || "",
      HighSchoolLevel: formData.highestSchoolLevel || "",
      HighSchoolYearCompleted: "",
      IsStillAtHighSchool: formData.isStillAttendingSchool === 'Yes',
      SchoolType: "Government", // Default value
      IsDisabled: false, // Default value - would need additional form fields
      IsRequestHelpForDisabled: false // Default value - would need additional form fields
    },

    // Flattened Current Address
    CurrentAddress: {
      OfferId: offerId,
      AddressType: "Current",
      IsPrimary: true,
      BuildingName: formData.buildingPropertyName || "",
      FlatUnitDetail: formData.flatUnitDetails || "",
      StreetNumber: formData.streetNumber || "",
      StreetName: formData.streetName || "",
      Suburb: formData.cityTownSuburb || "",
      State: formData.state || "",
      Postcode: formData.postcode || "",
      Country: formData.currentCountry || "",
      Phone: "",
      Fax: "",
      Mobile: formData.mobilePhone || ""
    },

    // Applied Courses array (same as original)
    AppliedCourses: [
      {
        OfferId: offerId,
        CourseId: "CPC50220", // Default to Diploma course mentioned in PDF
        CampusId: 1, // Default campus
        IntakeDate: formData.selectedIntake || formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // Use user selected intake date
        StartDate: formData.selectedIntake || formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // Use user selected intake date
        FinishDate: (() => {
          // Calculate finish date: 66 weeks (462 days) after intake date
          const intakeDate = formData.selectedIntake ? new Date(formData.selectedIntake) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          const finishDate = new Date(intakeDate.getTime() + 462 * 24 * 60 * 60 * 1000); // 66 weeks = 462 days
          return formatDate(finishDate);
        })(),
        ELICOS_NumOfWeeks: 0, // Default - not applicable for this course
        TuitionFee: 0.0, // Would come from course pricing
        EnrolmentFee: 0.0, // Would come from course pricing
        MaterialFee: 0.0, // Would come from course pricing
        UpfrontFee: 0.0, // Would come from course pricing
        SpecialCondition: "",
        ApplicationRequest: "",
        Status: "Pending"
      }
    ],

    // Disabilities array - empty by default as not collected in form
    Disabilities: [],

    // Emergency Contact (same as original)
    EmergencyContact: {
      OfferId: offerId,
      ContactType: formData.contactType || "",
      Relationship: formData.relationship || "",
      ContactName: `${formData.contactGivenName || ""} ${formData.contactFamilyName || ""}`.trim(),
      Address: `${formData.contactFlatUnitDetails || ""} ${formData.contactStreetAddress || ""} ${formData.contactCityTownSuburb || ""} ${formData.contactState || ""} ${formData.contactPostcode || ""} ${formData.contactCountry || ""}`.trim(),
      Phone: formData.contactMobile || "",
      Email: formData.contactEmail || "",
      LanguagesSpoken: formData.contactLanguagesSpoken || ""
    },

    // Education History List (same as original)
    EducationHistoryList: [],

    // Employment History List (same as original)
    EmploymentHistoryList: [],

    // Marketing Campaign (same as original)
    Leads_MarketingCampaign: {
      OfferId: offerId,
      KnowFrom: formData.howDidYouHearAboutUs || "",
      LeadSource: formData.howDidYouHearAboutUs === 'Agent' ? 'Agent' : 'Direct',
      CampaignName: formData.howDidYouHearDetails || "Website"
    }
  };

  // Add postal address if different (flattened)
  if (formData.hasPostalAddress === 'Yes') {
    mappedData.PostalAddress = {
      OfferId: offerId,
      AddressType: "Postal",
      IsPrimary: false,
      BuildingName: formData.postalBuildingPropertyName || "",
      FlatUnitDetail: formData.postalFlatUnitDetails || "",
      StreetNumber: formData.postalStreetNumber || "",
      StreetName: formData.postalStreetName || "",
      Suburb: formData.postalCityTownSuburb || "",
      State: formData.postalState || "",
      Postcode: formData.postalPostcode || "",
      Country: formData.postalCountry || "",
      Phone: "",
      Fax: "",
      Mobile: formData.postalMobilePhone || ""
    };
  } else {
    // Set PostalAddress to null when not provided
    mappedData.PostalAddress = null;
  }

  // Add education history if qualifications achieved
  if (formData.hasAchievedQualifications === 'Yes') {
    mappedData.EducationHistoryList.push({
      OfferId: offerId,
      QualificationName: formData.qualificationName || "",
      InstituteName: formData.institutionName || "",
      InstituteLocation: formData.stateCountry || "",
      YearCompleted: new Date().getFullYear(), // Default to current year
      EducationLevelCode: formData.qualificationLevel || "",
      AchievementRecognitionCode: formData.qualificationRecognition || ""
    });
  }

  return mappedData;
};

/**
 * Pretty prints JSON for debugging
 * @param {Object} jsonData - JSON data to format
 * @returns {string} Formatted JSON string
 */
export const formatJSONForDisplay = (jsonData) => {
  return JSON.stringify(jsonData, null, 2);
};