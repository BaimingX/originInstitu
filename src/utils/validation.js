// English and numbers only validation function
const validateEnglishAndNumbersOnly = (value) => {
  if (!value) return true; // Skip validation for empty values (let required validation handle it)
  // Allow letters, numbers, spaces, and common punctuation marks
  const englishAndNumbersPattern = /^[a-zA-Z0-9\s\-.,'"()&@#$%/\\:;!?]*$/;
  return englishAndNumbersPattern.test(value) || 'Please use English letters and numbers only';
};

export const validationRules = {
  // Personal Information
  title: {
    required: 'Please select your title'
  },
  firstName: {
    required: 'Please enter your first name',
    minLength: {
      value: 2,
      message: 'First name must be at least 2 characters'
    },
    maxLength: {
      value: 50,
      message: 'First name cannot exceed 50 characters'
    },
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  middleName: {
    maxLength: {
      value: 50,
      message: 'Middle name cannot exceed 50 characters'
    },
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  familyName: {
    required: 'Please enter your family name',
    minLength: {
      value: 2,
      message: 'Family name must be at least 2 characters'
    },
    maxLength: {
      value: 50,
      message: 'Family name cannot exceed 50 characters'
    },
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  preferredName: {
    maxLength: {
      value: 50,
      message: 'Preferred name cannot exceed 50 characters'
    },
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  gender: {
    required: 'Please select your gender'
  },
  dateOfBirth: {
    required: 'Please select your date of birth',
    validate: {
      minimumAge: (value) => {
        if (!value) return true; // Let required validation handle empty values

        const birthDate = new Date(value);
        const today = new Date();
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(today.getFullYear() - 10);

        if (birthDate > tenYearsAgo) {
          return 'Date of Birth must be at least 10 years ago';
        }

        if (birthDate > today) {
          return 'Date of Birth cannot be in the future';
        }

        return true;
      }
    }
  },
  email: {
    required: 'Please enter your email address',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address'
    }
  },
  birthplace: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  countryOfBirth: {
    required: 'Please select your country of birth'
  },
  nationality: {
    required: 'Please select your nationality'
  },
  passportNumber: {
    required: 'Please enter your passport number',
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  passportExpiryDate: {
    required: 'Please select passport expiry date',
    validate: {
      futureDate: (value) => {
        if (!value) return true; // Let required validation handle empty values

        const expiryDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison

        if (expiryDate <= today) {
          return 'Passport expiry date must be in the future';
        }

        return true;
      }
    }
  },
  visaType: {
    required: 'Please select your visa type/status'
  },
  usi: {
    minLength: {
      value: 10,
      message: 'USI must be at least 10 characters'
    },
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },

  // Current Address
  currentCountry: {
    required: 'Please select your country'
  },
  buildingPropertyName: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  flatUnitDetails: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  streetNumber: {
    required: 'Please enter street number',
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  streetName: {
    required: 'Please enter street name',
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  cityTownSuburb: {
    required: 'Please enter city/town/suburb',
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  state: {
    required: 'Please enter state',
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  postcode: {
    required: 'Please enter postcode',
    pattern: {
      value: /^[0-9]+$/,
      message: 'Please enter a valid postcode'
    }
  },
  mobilePhone: {
    required: 'Please enter your mobile phone number',
    pattern: {
      value: /^[0-9]+$/,
      message: 'Please enter a valid mobile phone number (numbers only)'
    }
  },
  hasPostalAddress: {
    required: 'Please select if you have a different postal address'
  },

  // Postal Address (conditional)
  postalCountry: {},
  postalBuildingPropertyName: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  postalFlatUnitDetails: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  postalStreetNumber: {},
  postalStreetName: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  postalCityTownSuburb: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  postalState: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  postalPostcode: {
    pattern: {
      value: /^[0-9]+$/,
      message: 'Please enter a valid postcode'
    }
  },
  postalMobilePhone: {
    pattern: {
      value: /^[0-9]+$/,
      message: 'Please enter a valid mobile phone number (numbers only)'
    }
  },

  // Language and Cultural Diversity
  isAboriginal: {
    required: 'Please select if you are of Aboriginal origin'
  },
  isTorresStraitIslander: {
    required: 'Please select if you are of Torres Strait Islander origin'
  },
  isEnglishMainLanguage: {
    required: 'Please select if English is your main language'
  },
  languageSpokenAtHome: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  wasEnglishInstructionLanguage: {
    required: 'Please select if English was the language of instruction'
  },
  hasCompletedEnglishTest: {
    required: 'Please select how you complete English Language Proficiency'
  },

  // English Test (conditional)
  englishTestType: {
    required: 'Please select English test type'
  },
  listeningScore: {
    required: 'Please enter listening score',
    pattern: {
      value: /^\d*\.?\d*$/,
      message: 'Please enter a valid number'
    },
    min: {
      value: 0,
      message: 'Score must be 0 or greater'
    }
  },
  readingScore: {
    required: 'Please enter reading score',
    pattern: {
      value: /^\d*\.?\d*$/,
      message: 'Please enter a valid number'
    },
    min: {
      value: 0,
      message: 'Score must be 0 or greater'
    }
  },
  writingScore: {
    required: 'Please enter writing score',
    pattern: {
      value: /^\d*\.?\d*$/,
      message: 'Please enter a valid number'
    },
    min: {
      value: 0,
      message: 'Score must be 0 or greater'
    }
  },
  speakingScore: {
    required: 'Please enter speaking score',
    pattern: {
      value: /^\d*\.?\d*$/,
      message: 'Please enter a valid number'
    },
    min: {
      value: 0,
      message: 'Score must be 0 or greater'
    }
  },
  overallScore: {
    required: 'Please enter overall score',
    pattern: {
      value: /^\d*\.?\d*$/,
      message: 'Please enter a valid number'
    },
    min: {
      value: 0,
      message: 'Score must be 0 or greater'
    }
  },
  engTestDate: {
    required: 'Please select test date',
    validate: {
      notFuture: (value) => {
        if (!value) return true; // Let required validation handle empty values
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Set to end of today
        return selectedDate <= today || 'Test date must be today or in the past';
      }
    }
  },

  // Education History
  highestSchoolLevel: {
    required: 'Please select your highest completed school level'
  },
  isStillAttendingSchool: {},
  hasAchievedQualifications: {
    required: 'Please select if you have achieved any qualifications'
  },

  // Qualification Details (conditional)
  qualificationLevel: {
    required: 'Please select your qualification level'
  },
  qualificationName: {
    required: 'Please enter your qualification name',
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  qualificationRecognition: {
    required: 'Please select your qualification recognition'
  },
  institutionName: {
    required: 'Please enter your institution name',
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  stateCountry: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },

  // Employment
  currentEmploymentStatus: {
    required: 'Please select your current employment status'
  },
  industryOfEmployment: {},
  occupationIdentifier: {},

  // Marketing
  howDidYouHearAboutUs: {
    required: 'Please select how you heard about us'
  },
  howDidYouHearDetails: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },

  // Agent Details (conditional)
  agentName: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  agentEmail: {
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address'
    }
  },

  // Emergency/Guardian Contact
  contactType: {
    required: 'Please select contact type'
  },
  relationship: {
    required: 'Please enter relationship',
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  contactGivenName: {
    required: 'Please enter contact given name',
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  contactFamilyName: {
    required: 'Please enter contact family name',
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  contactFlatUnitDetails: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  contactStreetAddress: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  contactCityTownSuburb: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  contactPostcode: {
    pattern: {
      value: /^[0-9]+$/,
      message: 'Please enter a valid postcode (numbers only)'
    }
  },
  contactState: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  contactCountry: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },
  contactEmail: {
    required: 'Please enter contact email',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address'
    }
  },
  contactMobile: {
    required: 'Please enter contact mobile number',
    pattern: {
      value: /^[0-9]+$/,
      message: 'Please enter a valid mobile number'
    }
  },
  contactLanguagesSpoken: {
    validate: {
      englishOnly: validateEnglishAndNumbersOnly
    }
  },

  // Course Intake Selection
  selectedIntake: {
    required: 'Please select your preferred intake date'
  },

  // Terms and Conditions
  agreeToTerms: {
    required: 'Please agree to the terms and conditions'
  },

  // Agent Selection
  selectedAgent: {
    required: 'Please select an agent',
    validate: {
      validFormat: (value) => {
        if (!value) return true; // Required validation handles empty values
        // Check if value follows the expected "name|country" format
        const parts = value.split('|');
        return (parts.length === 2 && parts[0].trim() && parts[1].trim()) || 'Invalid agent selection format';
      }
    }
  }
};

export const FORM_FIELDS = {
  // Personal Information Section
  title: {
    name: 'title',
    label: 'Title',
    type: 'select',
    required: true,
    placeholder: 'Please select your title',
    options: [
      { value: 'Mr', label: 'Mr' },
      { value: 'Mrs', label: 'Mrs' },
      { value: 'Miss', label: 'Miss' },
      { value: 'Ms', label: 'Ms' },
      { value: 'Dr', label: 'Dr' },
      { value: 'Rev', label: 'Rev' },
      { value: 'Hon', label: 'Hon' },
      { value: 'Not Specified', label: 'Not Specified' }
    ]
  },
  firstName: {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    required: true,
    maxLength: 50,
    placeholder: 'Enter your first name'
  },
  middleName: {
    name: 'middleName',
    label: 'Middle Name',
    type: 'text',
    required: false,
    maxLength: 50,
    placeholder: 'Enter your middle name (optional)'
  },
  familyName: {
    name: 'familyName',
    label: 'Family Name',
    type: 'text',
    required: true,
    maxLength: 50,
    placeholder: 'Enter your family name'
  },
  gender: {
    name: 'gender',
    label: 'Gender',
    type: 'select',
    required: true,
    placeholder: 'Please select gender',
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'X', label: 'X' },
      { value: 'Other/Not specified', label: 'Other/Not specified' }
    ]
  },
  preferredName: {
    name: 'preferredName',
    label: 'Preferred Name',
    type: 'text',
    required: false,
    maxLength: 50,
    placeholder: 'Enter your preferred name (optional)'
  },
  dateOfBirth: {
    name: 'dateOfBirth',
    label: 'Date of Birth',
    type: 'date',
    required: true
  },
  email: {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    placeholder: 'example@email.com'
  },
  birthplace: {
    name: 'birthplace',
    label: 'Birthplace',
    type: 'text',
    required: false,
    placeholder: 'Enter your birthplace'
  },
  countryOfBirth: {
    name: 'countryOfBirth',
    label: 'Country of Birth',
    type: 'select',
    required: true,
    placeholder: 'Please select country of birth',
    options: [
      { value: '', label: '--Please select country--' },
      { value: 'China (excludes SARs and Taiwan)', label: 'China (excludes SARs and Taiwan)' },
      { value: 'Hong Kong (SAR of China)', label: 'Hong Kong (SAR of China)' },
      { value: 'Macau (SAR of China)', label: 'Macau (SAR of China)' },
      { value: 'Taiwan', label: 'Taiwan' },
      { value: 'Australia', label: 'Australia' },
      { value: 'United States of America', label: 'United States of America' },
      { value: '---', label: '--- Other Countries ---', disabled: true },
      { value: 'Adelie Land (France)', label: 'Adelie Land (France)' },
      { value: 'Afghanistan', label: 'Afghanistan' },
      { value: 'Aland Islands', label: 'Aland Islands' },
      { value: 'Albania', label: 'Albania' },
      { value: 'Algeria', label: 'Algeria' },
      { value: 'Andorra', label: 'Andorra' },
      { value: 'Angola', label: 'Angola' },
      { value: 'Anguilla', label: 'Anguilla' },
      { value: 'Antigua and Barbuda', label: 'Antigua and Barbuda' },
      { value: 'Argentina', label: 'Argentina' },
      { value: 'Argentinian Antarctic Territory', label: 'Argentinian Antarctic Territory' },
      { value: 'Armenia', label: 'Armenia' },
      { value: 'Aruba', label: 'Aruba' },
      { value: 'Australian Antarctic Territory', label: 'Australian Antarctic Territory' },
      { value: 'Australian External Territories, nec', label: 'Australian External Territories, nec' },
      { value: 'Austria', label: 'Austria' },
      { value: 'Azerbaijan', label: 'Azerbaijan' },
      { value: 'Bahamas', label: 'Bahamas' },
      { value: 'Bahrain', label: 'Bahrain' },
      { value: 'Bangladesh', label: 'Bangladesh' },
      { value: 'Barbados', label: 'Barbados' },
      { value: 'Belarus', label: 'Belarus' },
      { value: 'Belgium', label: 'Belgium' },
      { value: 'Belize', label: 'Belize' },
      { value: 'Benin', label: 'Benin' },
      { value: 'Bermuda', label: 'Bermuda' },
      { value: 'Bhutan', label: 'Bhutan' },
      { value: 'Bolivia', label: 'Bolivia' },
      { value: 'Bonaire, Sint Eustatius and Saba', label: 'Bonaire, Sint Eustatius and Saba' },
      { value: 'Bosnia and Herzegovina', label: 'Bosnia and Herzegovina' },
      { value: 'Botswana', label: 'Botswana' },
      { value: 'Brazil', label: 'Brazil' },
      { value: 'British Antarctic Territory', label: 'British Antarctic Territory' },
      { value: 'Brunei Darussalam', label: 'Brunei Darussalam' },
      { value: 'Bulgaria', label: 'Bulgaria' },
      { value: 'Burkina Faso', label: 'Burkina Faso' },
      { value: 'Burma (Republic of the Union of Myanmar)', label: 'Burma (Republic of the Union of Myanmar)' },
      { value: 'Burundi', label: 'Burundi' },
      { value: 'Cambodia', label: 'Cambodia' },
      { value: 'Cameroon', label: 'Cameroon' },
      { value: 'Canada', label: 'Canada' },
      { value: 'Cape Verde', label: 'Cape Verde' },
      { value: 'Cayman Islands', label: 'Cayman Islands' },
      { value: 'Central African Republic', label: 'Central African Republic' },
      { value: 'Chad', label: 'Chad' },
      { value: 'Chile', label: 'Chile' },
      { value: 'Chilean Antarctic Territory', label: 'Chilean Antarctic Territory' },
      { value: 'China', label: 'China' },
      { value: 'Colombia', label: 'Colombia' },
      { value: 'Comoros', label: 'Comoros' },
      { value: 'Congo', label: 'Congo' },
      { value: 'Congo, Democratic Republic of', label: 'Congo, Democratic Republic of' },
      { value: 'Cook Islands', label: 'Cook Islands' },
      { value: 'Costa Rica', label: 'Costa Rica' },
      { value: 'Cote d\'Ivoire', label: 'Cote d\'Ivoire' },
      { value: 'Croatia', label: 'Croatia' },
      { value: 'Cuba', label: 'Cuba' },
      { value: 'Curacao', label: 'Curacao' },
      { value: 'Cyprus', label: 'Cyprus' },
      { value: 'Czech Republic', label: 'Czech Republic' },
      { value: 'Denmark', label: 'Denmark' },
      { value: 'Djibouti', label: 'Djibouti' },
      { value: 'Dominica', label: 'Dominica' },
      { value: 'Dominican Republic', label: 'Dominican Republic' },
      { value: 'Ecuador', label: 'Ecuador' },
      { value: 'Egypt', label: 'Egypt' },
      { value: 'El Salvador', label: 'El Salvador' },
      { value: 'England', label: 'England' },
      { value: 'Equatorial Guinea', label: 'Equatorial Guinea' },
      { value: 'Eritrea', label: 'Eritrea' },
      { value: 'Estonia', label: 'Estonia' },
      { value: 'Ethiopia', label: 'Ethiopia' },
      { value: 'Falkland Islands', label: 'Falkland Islands' },
      { value: 'Faroe Islands', label: 'Faroe Islands' },
      { value: 'Fiji', label: 'Fiji' },
      { value: 'Finland', label: 'Finland' },
      { value: 'France', label: 'France' },
      { value: 'French Guiana', label: 'French Guiana' },
      { value: 'French Polynesia', label: 'French Polynesia' },
      { value: 'Gabon', label: 'Gabon' },
      { value: 'Gambia', label: 'Gambia' },
      { value: 'Gaza Strip and West Bank', label: 'Gaza Strip and West Bank' },
      { value: 'Georgia', label: 'Georgia' },
      { value: 'Germany', label: 'Germany' },
      { value: 'Ghana', label: 'Ghana' },
      { value: 'Gibraltar', label: 'Gibraltar' },
      { value: 'Greece', label: 'Greece' },
      { value: 'Greenland', label: 'Greenland' },
      { value: 'Grenada', label: 'Grenada' },
      { value: 'Guadeloupe', label: 'Guadeloupe' },
      { value: 'Guam', label: 'Guam' },
      { value: 'Guatemala', label: 'Guatemala' },
      { value: 'Guernsey', label: 'Guernsey' },
      { value: 'Guinea', label: 'Guinea' },
      { value: 'Guinea-Bissau', label: 'Guinea-Bissau' },
      { value: 'Guyana', label: 'Guyana' },
      { value: 'Haiti', label: 'Haiti' },
      { value: 'Holy See', label: 'Holy See' },
      { value: 'Honduras', label: 'Honduras' },
      { value: 'Hungary', label: 'Hungary' },
      { value: 'Iceland', label: 'Iceland' },
      { value: 'India', label: 'India' },
      { value: 'Indonesia', label: 'Indonesia' },
      { value: 'Iran', label: 'Iran' },
      { value: 'Iraq', label: 'Iraq' },
      { value: 'Ireland', label: 'Ireland' },
      { value: 'Isle of Man', label: 'Isle of Man' },
      { value: 'Israel', label: 'Israel' },
      { value: 'Italy', label: 'Italy' },
      { value: 'Jamaica', label: 'Jamaica' },
      { value: 'Japan', label: 'Japan' },
      { value: 'Jersey', label: 'Jersey' },
      { value: 'Jordan', label: 'Jordan' },
      { value: 'Kazakhstan', label: 'Kazakhstan' },
      { value: 'Kenya', label: 'Kenya' },
      { value: 'Kiribati', label: 'Kiribati' },
      { value: 'Korea', label: 'Korea' },
      { value: 'Korea, Democratic People\'s Republic of (North)', label: 'Korea, Democratic People\'s Republic of (North)' },
      { value: 'Korea, Republic of (South)', label: 'Korea, Republic of (South)' },
      { value: 'Kosovo', label: 'Kosovo' },
      { value: 'Kuwait', label: 'Kuwait' },
      { value: 'Kyrgyzstan ', label: 'Kyrgyzstan ' },
      { value: 'Laos', label: 'Laos' },
      { value: 'Latvia', label: 'Latvia' },
      { value: 'Lebanon', label: 'Lebanon' },
      { value: 'Lesotho', label: 'Lesotho' },
      { value: 'Liberia', label: 'Liberia' },
      { value: 'Libya', label: 'Libya' },
      { value: 'Liechtenstein', label: 'Liechtenstein' },
      { value: 'Lithuania', label: 'Lithuania' },
      { value: 'Luxembourg', label: 'Luxembourg' },
      { value: 'Macau (SAR of China)', label: 'Macau (SAR of China)' },
      { value: 'Macedonia', label: 'Macedonia' },
      { value: 'Madagascar', label: 'Madagascar' },
      { value: 'Malawi', label: 'Malawi' },
      { value: 'Malaysia', label: 'Malaysia' },
      { value: 'Maldives', label: 'Maldives' },
      { value: 'Mali', label: 'Mali' },
      { value: 'Malta', label: 'Malta' },
      { value: 'Marshall Islands', label: 'Marshall Islands' },
      { value: 'Martinique', label: 'Martinique' },
      { value: 'Mauritania', label: 'Mauritania' },
      { value: 'Mauritius', label: 'Mauritius' },
      { value: 'Mayotte', label: 'Mayotte' },
      { value: 'Mexico', label: 'Mexico' },
      { value: 'Micronesia, Federated States of', label: 'Micronesia, Federated States of' },
      { value: 'Moldova', label: 'Moldova' },
      { value: 'Monaco', label: 'Monaco' },
      { value: 'Mongolia', label: 'Mongolia' },
      { value: 'Montenegro', label: 'Montenegro' },
      { value: 'Montserrat', label: 'Montserrat' },
      { value: 'Morocco', label: 'Morocco' },
      { value: 'Mozambique', label: 'Mozambique' },
      { value: 'Myanmar', label: 'Myanmar' },
      { value: 'Namibia', label: 'Namibia' },
      { value: 'Nauru', label: 'Nauru' },
      { value: 'Nepal', label: 'Nepal' },
      { value: 'Netherlands', label: 'Netherlands' },
      { value: 'Netherlands Antilles', label: 'Netherlands Antilles' },
      { value: 'New Caledonia', label: 'New Caledonia' },
      { value: 'New Zealand', label: 'New Zealand' },
      { value: 'Nicaragua', label: 'Nicaragua' },
      { value: 'Niger', label: 'Niger' },
      { value: 'Nigeria', label: 'Nigeria' },
      { value: 'Niue', label: 'Niue' },
      { value: 'Norfolk Island', label: 'Norfolk Island' },
      { value: 'Northern Ireland', label: 'Northern Ireland' },
      { value: 'Northern Mariana Islands', label: 'Northern Mariana Islands' },
      { value: 'Norway', label: 'Norway' },
      { value: 'Not Specified', label: 'Not Specified' },
      { value: 'Oman', label: 'Oman' },
      { value: 'Pakistan', label: 'Pakistan' },
      { value: 'Palau', label: 'Palau' },
      { value: 'Panama', label: 'Panama' },
      { value: 'Papua New Guinea', label: 'Papua New Guinea' },
      { value: 'Paraguay', label: 'Paraguay' },
      { value: 'Peru', label: 'Peru' },
      { value: 'Philippines', label: 'Philippines' },
      { value: 'Pitcairn Islands', label: 'Pitcairn Islands' },
      { value: 'Poland', label: 'Poland' },
      { value: 'Polynesia (excludes Hawaii), nec', label: 'Polynesia (excludes Hawaii), nec' },
      { value: 'Portugal', label: 'Portugal' },
      { value: 'Puerto Rico', label: 'Puerto Rico' },
      { value: 'Qatar', label: 'Qatar' },
      { value: 'Queen Maud Land (Norway)', label: 'Queen Maud Land (Norway)' },
      { value: 'Reunion', label: 'Reunion' },
      { value: 'Romania', label: 'Romania' },
      { value: 'Ross Dependency (New Zealand)', label: 'Ross Dependency (New Zealand)' },
      { value: 'Russia', label: 'Russia' },
      { value: 'Russian Federation', label: 'Russian Federation' },
      { value: 'Rwanda', label: 'Rwanda' },
      { value: 'Samoa', label: 'Samoa' },
      { value: 'Samoa, American', label: 'Samoa, American' },
      { value: 'San Marino', label: 'San Marino' },
      { value: 'Sao Tome and Principe', label: 'Sao Tome and Principe' },
      { value: 'Saudi Arabia', label: 'Saudi Arabia' },
      { value: 'Scotland', label: 'Scotland' },
      { value: 'Senegal', label: 'Senegal' },
      { value: 'Serbia', label: 'Serbia' },
      { value: 'Seychelles', label: 'Seychelles' },
      { value: 'Sierra Leone', label: 'Sierra Leone' },
      { value: 'Singapore', label: 'Singapore' },
      { value: 'Sint Maarten', label: 'Sint Maarten' },
      { value: 'Slovakia', label: 'Slovakia' },
      { value: 'Slovenia', label: 'Slovenia' },
      { value: 'Solomon Islands', label: 'Solomon Islands' },
      { value: 'Somalia', label: 'Somalia' },
      { value: 'South Africa', label: 'South Africa' },
      { value: 'South America, nec', label: 'South America, nec' },
      { value: 'South Sudan', label: 'South Sudan' },
      { value: 'Southern and East Africa, nec', label: 'Southern and East Africa, nec' },
      { value: 'Spain', label: 'Spain' },
      { value: 'Spanish North Africa', label: 'Spanish North Africa' },
      { value: 'Sri Lanka', label: 'Sri Lanka' },
      { value: 'St Barthelemy', label: 'St Barthelemy' },
      { value: 'St Helena', label: 'St Helena' },
      { value: 'St Kitts and Nevis', label: 'St Kitts and Nevis' },
      { value: 'St Lucia', label: 'St Lucia' },
      { value: 'St Martin (French part)', label: 'St Martin (French part)' },
      { value: 'St Pierre and Miquelon', label: 'St Pierre and Miquelon' },
      { value: 'St Vincent and the Grenadines', label: 'St Vincent and the Grenadines' },
      { value: 'Sudan', label: 'Sudan' },
      { value: 'Suriname', label: 'Suriname' },
      { value: 'Swaziland', label: 'Swaziland' },
      { value: 'Sweden', label: 'Sweden' },
      { value: 'Switzerland', label: 'Switzerland' },
      { value: 'Syria', label: 'Syria' },
      { value: 'Tajikistan', label: 'Tajikistan' },
      { value: 'Tanzania', label: 'Tanzania' },
      { value: 'Thailand', label: 'Thailand' },
      { value: 'The former Yugoslav Republic of Macedonia', label: 'The former Yugoslav Republic of Macedonia' },
      { value: 'Timor-Leste', label: 'Timor-Leste' },
      { value: 'Togo', label: 'Togo' },
      { value: 'Tokelau', label: 'Tokelau' },
      { value: 'Tonga', label: 'Tonga' },
      { value: 'Trinidad and Tobago', label: 'Trinidad and Tobago' },
      { value: 'Tunisia', label: 'Tunisia' },
      { value: 'Turkey', label: 'Turkey' },
      { value: 'Turkmenistan', label: 'Turkmenistan' },
      { value: 'Turks and Caicos Islands', label: 'Turks and Caicos Islands' },
      { value: 'Tuvalu', label: 'Tuvalu' },
      { value: 'Uganda', label: 'Uganda' },
      { value: 'Ukraine', label: 'Ukraine' },
      { value: 'United Arab Emirates', label: 'United Arab Emirates' },
      { value: 'United Kingdom', label: 'United Kingdom' },
      { value: 'Uruguay', label: 'Uruguay' },
      { value: 'Uzbekistan', label: 'Uzbekistan' },
      { value: 'Vanuatu', label: 'Vanuatu' },
      { value: 'Venezuela', label: 'Venezuela' },
      { value: 'Vietnam', label: 'Vietnam' },
      { value: 'Virgin Islands, British', label: 'Virgin Islands, British' },
      { value: 'Virgin Islands, United States', label: 'Virgin Islands, United States' },
      { value: 'Wales', label: 'Wales' },
      { value: 'Wallis and Futuna', label: 'Wallis and Futuna' },
      { value: 'Western Sahara', label: 'Western Sahara' },
      { value: 'Yemen', label: 'Yemen' },
      { value: 'Zambia', label: 'Zambia' },
      { value: 'Zimbabwe', label: 'Zimbabwe' }
    ]
  },
  nationality: {
    name: 'nationality',
    label: 'Nationality',
    type: 'select',
    required: true,
    placeholder: 'Please select nationality',
    options: [
      { value: '', label: '--Please select nationality--' },
      { value: 'Chinese', label: 'Chinese' },
      { value: 'Hong Konger', label: 'Hong Konger' },
      { value: 'Taiwanese', label: 'Taiwanese' },
      { value: 'Australian', label: 'Australian' },
      { value: 'American', label: 'American' },
      { value: '---', label: '--- Other Nationalities ---', disabled: true },
      { value: 'Afghan', label: 'Afghan' },
      { value: 'African', label: 'African' },
      { value: 'Aland Islander', label: 'Aland Islander' },
      { value: 'Albanian', label: 'Albanian' },
      { value: 'Algerian', label: 'Algerian' },
      { value: 'Amercian Samoan', label: 'Amercian Samoan' },
      { value: 'Andorran', label: 'Andorran' },
      { value: 'Angolan', label: 'Angolan' },
      { value: 'Anguillan', label: 'Anguillan' },
      { value: 'Antiguan', label: 'Antiguan' },
      { value: 'Argentinian', label: 'Argentinian' },
      { value: 'Armenian', label: 'Armenian' },
      { value: 'Aruban', label: 'Aruban' },
      { value: 'Austrian', label: 'Austrian' },
      { value: 'Azerbaijani', label: 'Azerbaijani' },
      { value: 'Bahamian', label: 'Bahamian' },
      { value: 'Bahraini', label: 'Bahraini' },
      { value: 'Bangladeshi', label: 'Bangladeshi' },
      { value: 'Barbadian', label: 'Barbadian' },
      { value: 'Belgian', label: 'Belgian' },
      { value: 'Belizian', label: 'Belizian' },
      { value: 'Belorussian', label: 'Belorussian' },
      { value: 'Beninese', label: 'Beninese' },
      { value: 'Bermudian', label: 'Bermudian' },
      { value: 'Bhutanese', label: 'Bhutanese' },
      { value: 'Bolivian', label: 'Bolivian' },
      { value: 'Bonaire, Sint Eustatius and Saba People', label: 'Bonaire, Sint Eustatius and Saba People' },
      { value: 'Bosnian', label: 'Bosnian' },
      { value: 'Botswanan', label: 'Botswanan' },
      { value: 'Brazilian', label: 'Brazilian' },
      { value: 'British Virgin Islander', label: 'British Virgin Islander' },
      { value: 'Bruneian', label: 'Bruneian' },
      { value: 'Bulgarian', label: 'Bulgarian' },
      { value: 'Burkinabe', label: 'Burkinabe' },
      { value: 'Burmese', label: 'Burmese' },
      { value: 'Burundian', label: 'Burundian' },
      { value: 'Cambodian', label: 'Cambodian' },
      { value: 'Cameroonian', label: 'Cameroonian' },
      { value: 'Canadian', label: 'Canadian' },
      { value: 'Cape Verdean', label: 'Cape Verdean' },
      { value: 'Caymanian', label: 'Caymanian' },
      { value: 'Central African', label: 'Central African' },
      { value: 'Chadian', label: 'Chadian' },
      { value: 'Channel Islander', label: 'Channel Islander' },
      { value: 'Chilean', label: 'Chilean' },
      { value: 'Colombian', label: 'Colombian' },
      { value: 'Comoran', label: 'Comoran' },
      { value: 'Congolese', label: 'Congolese' },
      { value: 'Cook Islander', label: 'Cook Islander' },
      { value: 'Costa Rican', label: 'Costa Rican' },
      { value: 'Croat ', label: 'Croat ' },
      { value: 'Cuban', label: 'Cuban' },
      { value: 'Curacao People', label: 'Curacao People' },
      { value: 'Cypriot', label: 'Cypriot' },
      { value: 'Czech', label: 'Czech' },
      { value: 'Danish', label: 'Danish' },
      { value: 'Djiboutian', label: 'Djiboutian' },
      { value: 'Dominican', label: 'Dominican' },
      { value: 'Dutch', label: 'Dutch' },
      { value: 'Dutch Antillean', label: 'Dutch Antillean' },
      { value: 'East Timorese', label: 'East Timorese' },
      { value: 'Ecuadorean', label: 'Ecuadorean' },
      { value: 'Egyptian', label: 'Egyptian' },
      { value: 'Emirati', label: 'Emirati' },
      { value: 'English', label: 'English' },
      { value: 'Equatorial Guinean', label: 'Equatorial Guinean' },
      { value: 'Eritrean', label: 'Eritrean' },
      { value: 'Estonian', label: 'Estonian' },
      { value: 'Ethiopian', label: 'Ethiopian' },
      { value: 'Falkland Islander', label: 'Falkland Islander' },
      { value: 'Faroe Islander', label: 'Faroe Islander' },
      { value: 'Fijian', label: 'Fijian' },
      { value: 'Filipino', label: 'Filipino' },
      { value: 'Finnish', label: 'Finnish' },
      { value: 'French', label: 'French' },
      { value: 'French Polynesian', label: 'French Polynesian' },
      { value: 'Gabonese', label: 'Gabonese' },
      { value: 'Gambian', label: 'Gambian' },
      { value: 'Georgian', label: 'Georgian' },
      { value: 'German', label: 'German' },
      { value: 'Ghanaian', label: 'Ghanaian' },
      { value: 'Gibraltarian', label: 'Gibraltarian' },
      { value: 'Greek', label: 'Greek' },
      { value: 'Greenlander', label: 'Greenlander' },
      { value: 'Grenadian', label: 'Grenadian' },
      { value: 'Guamanian', label: 'Guamanian' },
      { value: 'Guatemalan', label: 'Guatemalan' },
      { value: 'Guinean', label: 'Guinean' },
      { value: 'Guinean-Bissau', label: 'Guinean-Bissau' },
      { value: 'Guyanese', label: 'Guyanese' },
      { value: 'Haitian', label: 'Haitian' },
      { value: 'Honduran', label: 'Honduran' },
      { value: 'Hungarian', label: 'Hungarian' },
      { value: 'Icelander', label: 'Icelander' },
      { value: 'I-Kiribati', label: 'I-Kiribati' },
      { value: 'Indian', label: 'Indian' },
      { value: 'Indonesian', label: 'Indonesian' },
      { value: 'Iranian', label: 'Iranian' },
      { value: 'Iraqi', label: 'Iraqi' },
      { value: 'Irish', label: 'Irish' },
      { value: 'Israeli', label: 'Israeli' },
      { value: 'Italian', label: 'Italian' },
      { value: 'Ivoirian', label: 'Ivoirian' },
      { value: 'Jamaican', label: 'Jamaican' },
      { value: 'Japanese', label: 'Japanese' },
      { value: 'Jordanian', label: 'Jordanian' },
      { value: 'Kazakh', label: 'Kazakh' },
      { value: 'Kenyan', label: 'Kenyan' },
      { value: 'Kittitian', label: 'Kittitian' },
      { value: 'Korean', label: 'Korean' },
      { value: 'Kosovac', label: 'Kosovac' },
      { value: 'Kuwaiti', label: 'Kuwaiti' },
      { value: 'Kyrgyzstani', label: 'Kyrgyzstani' },
      { value: 'Laotian', label: 'Laotian' },
      { value: 'Latvian', label: 'Latvian' },
      { value: 'Lebanese', label: 'Lebanese' },
      { value: 'Liberian', label: 'Liberian' },
      { value: 'Libyan', label: 'Libyan' },
      { value: 'Liechtensteiner', label: 'Liechtensteiner' },
      { value: 'Lithuanian', label: 'Lithuanian' },
      { value: 'Luxembourger', label: 'Luxembourger' },
      { value: 'Macedonian', label: 'Macedonian' },
      { value: 'Mahorais', label: 'Mahorais' },
      { value: 'Malagasay', label: 'Malagasay' },
      { value: 'Malawian', label: 'Malawian' },
      { value: 'Malaysian', label: 'Malaysian' },
      { value: 'Maldivian', label: 'Maldivian' },
      { value: 'Malian', label: 'Malian' },
      { value: 'Maltese', label: 'Maltese' },
      { value: 'Manx', label: 'Manx' },
      { value: 'Marshall Islander', label: 'Marshall Islander' },
      { value: 'Mauritanian', label: 'Mauritanian' },
      { value: 'Mauritian', label: 'Mauritian' },
      { value: 'Mexican', label: 'Mexican' },
      { value: 'Micronesian', label: 'Micronesian' },
      { value: 'Moldovan', label: 'Moldovan' },
      { value: 'Monacan', label: 'Monacan' },
      { value: 'Mongolian', label: 'Mongolian' },
      { value: 'Montenegrin', label: 'Montenegrin' },
      { value: 'Montserratian', label: 'Montserratian' },
      { value: 'Moroccan', label: 'Moroccan' },
      { value: 'Mosotho', label: 'Mosotho' },
      { value: 'Mozambican', label: 'Mozambican' },
      { value: 'Namibian', label: 'Namibian' },
      { value: 'Nauruan', label: 'Nauruan' },
      { value: 'Nepalese', label: 'Nepalese' },
      { value: 'New Caledonian', label: 'New Caledonian' },
      { value: 'New Zealander', label: 'New Zealander' },
      { value: 'Nicaraguan', label: 'Nicaraguan' },
      { value: 'Nigerian', label: 'Nigerian' },
      { value: 'Nigerien', label: 'Nigerien' },
      { value: 'Niuean', label: 'Niuean' },
      { value: 'None', label: 'None' },
      { value: 'Norfolk Islander', label: 'Norfolk Islander' },
      { value: 'North Korean', label: 'North Korean' },
      { value: 'Northern Irish', label: 'Northern Irish' },
      { value: 'Northern Mariana Islander', label: 'Northern Mariana Islander' },
      { value: 'Norwegian', label: 'Norwegian' },
      { value: 'Omani', label: 'Omani' },
      { value: 'Pakistani', label: 'Pakistani' },
      { value: 'Palauan', label: 'Palauan' },
      { value: 'Palestinian', label: 'Palestinian' },
      { value: 'Panamanian', label: 'Panamanian' },
      { value: 'Papua New Guinean', label: 'Papua New Guinean' },
      { value: 'Paraguayan', label: 'Paraguayan' },
      { value: 'Peruvian', label: 'Peruvian' },
      { value: 'Pitcairn Islander', label: 'Pitcairn Islander' },
      { value: 'Polish', label: 'Polish' },
      { value: 'Polynesian', label: 'Polynesian' },
      { value: 'Portuguese', label: 'Portuguese' },
      { value: 'Puerto Rican', label: 'Puerto Rican' },
      { value: 'Qatari', label: 'Qatari' },
      { value: 'Reunionese', label: 'Reunionese' },
      { value: 'Romanian', label: 'Romanian' },
      { value: 'Russian', label: 'Russian' },
      { value: 'Rwandan', label: 'Rwandan' },
      { value: 'Sahrawi', label: 'Sahrawi' },
      { value: 'Salvadorean', label: 'Salvadorean' },
      { value: 'Sammarinese', label: 'Sammarinese' },
      { value: 'Samoan', label: 'Samoan' },
      { value: 'Sao Tomean', label: 'Sao Tomean' },
      { value: 'Saudi', label: 'Saudi' },
      { value: 'Scottish', label: 'Scottish' },
      { value: 'Senegalese', label: 'Senegalese' },
      { value: 'Serb', label: 'Serb' },
      { value: 'Seychellois', label: 'Seychellois' },
      { value: 'Sierra Leonian', label: 'Sierra Leonian' },
      { value: 'Singaporean', label: 'Singaporean' },
      { value: 'Sint Maarten People', label: 'Sint Maarten People' },
      { value: 'Slovak', label: 'Slovak' },
      { value: 'Slovenian', label: 'Slovenian' },
      { value: 'Solomon Islander', label: 'Solomon Islander' },
      { value: 'Somali', label: 'Somali' },
      { value: 'South African', label: 'South African' },
      { value: 'South American', label: 'South American' },
      { value: 'South Korean', label: 'South Korean' },
      { value: 'South Sudanese', label: 'South Sudanese' },
      { value: 'Spanish', label: 'Spanish' },
      { value: 'Spanish North African', label: 'Spanish North African' },
      { value: 'Sri Lankan', label: 'Sri Lankan' },
      { value: 'St Barthelemy People', label: 'St Barthelemy People' },
      { value: 'St Helena English', label: 'St Helena English' },
      { value: 'St Lucian', label: 'St Lucian' },
      { value: 'St Martin People', label: 'St Martin People' },
      { value: 'Sudanese', label: 'Sudanese' },
      { value: 'Surinamese', label: 'Surinamese' },
      { value: 'Swazi', label: 'Swazi' },
      { value: 'Swedish', label: 'Swedish' },
      { value: 'Swiss', label: 'Swiss' },
      { value: 'Syrian', label: 'Syrian' },
      { value: 'Tajikistani', label: 'Tajikistani' },
      { value: 'Tanzanian', label: 'Tanzanian' },
      { value: 'Thai', label: 'Thai' },
      { value: 'Togolese', label: 'Togolese' },
      { value: 'Tokelauan', label: 'Tokelauan' },
      { value: 'Tongan', label: 'Tongan' },
      { value: 'Trinidadian', label: 'Trinidadian' },
      { value: 'Tunisian', label: 'Tunisian' },
      { value: 'Turkish', label: 'Turkish' },
      { value: 'Turkmen ', label: 'Turkmen ' },
      { value: 'Turks and Caicos Islander', label: 'Turks and Caicos Islander' },
      { value: 'Tuvaluan', label: 'Tuvaluan' },
      { value: 'Ugandan', label: 'Ugandan' },
      { value: 'Ukrainian', label: 'Ukrainian' },
      { value: 'Uruguayan', label: 'Uruguayan' },
      { value: 'US Virgin Islander', label: 'US Virgin Islander' },
      { value: 'Uzbek', label: 'Uzbek' },
      { value: 'Vanuatuan', label: 'Vanuatuan' },
      { value: 'Venezuelan', label: 'Venezuelan' },
      { value: 'Vietnamese', label: 'Vietnamese' },
      { value: 'Vincentian', label: 'Vincentian' },
      { value: 'Wallis and Futuna Islanders', label: 'Wallis and Futuna Islanders' },
      { value: 'Welsh', label: 'Welsh' },
      { value: 'Yemeni', label: 'Yemeni' },
      { value: 'Zambian', label: 'Zambian' },
      { value: 'Zimbabwean', label: 'Zimbabwean' }
    ]
  },
  passportNumber: {
    name: 'passportNumber',
    label: 'Passport Number',
    type: 'text',
    required: true,
    placeholder: 'Enter your passport number'
  },
  passportExpiryDate: {
    name: 'passportExpiryDate',
    label: 'Passport Expiry Date',
    type: 'date',
    required: true
  },
  visaType: {
    name: 'visaType',
    label: 'Visa Type/Status or Residential Status',
    type: 'select',
    required: true,
    placeholder: 'Please select visa type/status',
    options: [] // Will be populated dynamically via API
  },
  usi: {
    name: 'usi',
    label: 'USI (Unique Student Identifier)',
    type: 'text',
    required: false,
    placeholder: 'Enter your USI if you have one (optional)',
    minLength: 10
  },
  // Current Address Section
  currentCountry: {
    name: 'currentCountry',
    label: 'Country',
    type: 'select',
    required: true,
    placeholder: 'Please select country',
    options: [
      { value: '', label: '--Please select country--' },
      { value: 'China (excludes SARs and Taiwan)', label: 'China (excludes SARs and Taiwan)' },
      { value: 'Hong Kong (SAR of China)', label: 'Hong Kong (SAR of China)' },
      { value: 'Macau (SAR of China)', label: 'Macau (SAR of China)' },
      { value: 'Taiwan', label: 'Taiwan' },
      { value: 'Australia', label: 'Australia' },
      { value: 'United States of America', label: 'United States of America' },
      { value: '---', label: '--- Other Countries ---', disabled: true },
      { value: 'Adelie Land (France)', label: 'Adelie Land (France)' },
      { value: 'Afghanistan', label: 'Afghanistan' },
      { value: 'Aland Islands', label: 'Aland Islands' },
      { value: 'Albania', label: 'Albania' },
      { value: 'Algeria', label: 'Algeria' },
      { value: 'Andorra', label: 'Andorra' },
      { value: 'Angola', label: 'Angola' },
      { value: 'Anguilla', label: 'Anguilla' },
      { value: 'Antigua and Barbuda', label: 'Antigua and Barbuda' },
      { value: 'Argentina', label: 'Argentina' },
      { value: 'Argentinian Antarctic Territory', label: 'Argentinian Antarctic Territory' },
      { value: 'Armenia', label: 'Armenia' },
      { value: 'Aruba', label: 'Aruba' },
      { value: 'Australian Antarctic Territory', label: 'Australian Antarctic Territory' },
      { value: 'Australian External Territories, nec', label: 'Australian External Territories, nec' },
      { value: 'Austria', label: 'Austria' },
      { value: 'Azerbaijan', label: 'Azerbaijan' },
      { value: 'Bahamas', label: 'Bahamas' },
      { value: 'Bahrain', label: 'Bahrain' },
      { value: 'Bangladesh', label: 'Bangladesh' },
      { value: 'Barbados', label: 'Barbados' },
      { value: 'Belarus', label: 'Belarus' },
      { value: 'Belgium', label: 'Belgium' },
      { value: 'Belize', label: 'Belize' },
      { value: 'Benin', label: 'Benin' },
      { value: 'Bermuda', label: 'Bermuda' },
      { value: 'Bhutan', label: 'Bhutan' },
      { value: 'Bolivia', label: 'Bolivia' },
      { value: 'Bonaire, Sint Eustatius and Saba', label: 'Bonaire, Sint Eustatius and Saba' },
      { value: 'Bosnia and Herzegovina', label: 'Bosnia and Herzegovina' },
      { value: 'Botswana', label: 'Botswana' },
      { value: 'Brazil', label: 'Brazil' },
      { value: 'British Antarctic Territory', label: 'British Antarctic Territory' },
      { value: 'Brunei Darussalam', label: 'Brunei Darussalam' },
      { value: 'Bulgaria', label: 'Bulgaria' },
      { value: 'Burkina Faso', label: 'Burkina Faso' },
      { value: 'Burma (Republic of the Union of Myanmar)', label: 'Burma (Republic of the Union of Myanmar)' },
      { value: 'Burundi', label: 'Burundi' },
      { value: 'Cambodia', label: 'Cambodia' },
      { value: 'Cameroon', label: 'Cameroon' },
      { value: 'Canada', label: 'Canada' },
      { value: 'Cape Verde', label: 'Cape Verde' },
      { value: 'Cayman Islands', label: 'Cayman Islands' },
      { value: 'Central African Republic', label: 'Central African Republic' },
      { value: 'Chad', label: 'Chad' },
      { value: 'Chile', label: 'Chile' },
      { value: 'Chilean Antarctic Territory', label: 'Chilean Antarctic Territory' },
      { value: 'China', label: 'China' },
      { value: 'Colombia', label: 'Colombia' },
      { value: 'Comoros', label: 'Comoros' },
      { value: 'Congo', label: 'Congo' },
      { value: 'Congo, Democratic Republic of', label: 'Congo, Democratic Republic of' },
      { value: 'Cook Islands', label: 'Cook Islands' },
      { value: 'Costa Rica', label: 'Costa Rica' },
      { value: 'Cote d\'Ivoire', label: 'Cote d\'Ivoire' },
      { value: 'Croatia', label: 'Croatia' },
      { value: 'Cuba', label: 'Cuba' },
      { value: 'Curacao', label: 'Curacao' },
      { value: 'Cyprus', label: 'Cyprus' },
      { value: 'Czech Republic', label: 'Czech Republic' },
      { value: 'Denmark', label: 'Denmark' },
      { value: 'Djibouti', label: 'Djibouti' },
      { value: 'Dominica', label: 'Dominica' },
      { value: 'Dominican Republic', label: 'Dominican Republic' },
      { value: 'Ecuador', label: 'Ecuador' },
      { value: 'Egypt', label: 'Egypt' },
      { value: 'El Salvador', label: 'El Salvador' },
      { value: 'England', label: 'England' },
      { value: 'Equatorial Guinea', label: 'Equatorial Guinea' },
      { value: 'Eritrea', label: 'Eritrea' },
      { value: 'Estonia', label: 'Estonia' },
      { value: 'Ethiopia', label: 'Ethiopia' },
      { value: 'Falkland Islands', label: 'Falkland Islands' },
      { value: 'Faroe Islands', label: 'Faroe Islands' },
      { value: 'Fiji', label: 'Fiji' },
      { value: 'Finland', label: 'Finland' },
      { value: 'France', label: 'France' },
      { value: 'French Guiana', label: 'French Guiana' },
      { value: 'French Polynesia', label: 'French Polynesia' },
      { value: 'Gabon', label: 'Gabon' },
      { value: 'Gambia', label: 'Gambia' },
      { value: 'Gaza Strip and West Bank', label: 'Gaza Strip and West Bank' },
      { value: 'Georgia', label: 'Georgia' },
      { value: 'Germany', label: 'Germany' },
      { value: 'Ghana', label: 'Ghana' },
      { value: 'Gibraltar', label: 'Gibraltar' },
      { value: 'Greece', label: 'Greece' },
      { value: 'Greenland', label: 'Greenland' },
      { value: 'Grenada', label: 'Grenada' },
      { value: 'Guadeloupe', label: 'Guadeloupe' },
      { value: 'Guam', label: 'Guam' },
      { value: 'Guatemala', label: 'Guatemala' },
      { value: 'Guernsey', label: 'Guernsey' },
      { value: 'Guinea', label: 'Guinea' },
      { value: 'Guinea-Bissau', label: 'Guinea-Bissau' },
      { value: 'Guyana', label: 'Guyana' },
      { value: 'Haiti', label: 'Haiti' },
      { value: 'Holy See', label: 'Holy See' },
      { value: 'Honduras', label: 'Honduras' },
      { value: 'Hungary', label: 'Hungary' },
      { value: 'Iceland', label: 'Iceland' },
      { value: 'India', label: 'India' },
      { value: 'Indonesia', label: 'Indonesia' },
      { value: 'Iran', label: 'Iran' },
      { value: 'Iraq', label: 'Iraq' },
      { value: 'Ireland', label: 'Ireland' },
      { value: 'Isle of Man', label: 'Isle of Man' },
      { value: 'Israel', label: 'Israel' },
      { value: 'Italy', label: 'Italy' },
      { value: 'Jamaica', label: 'Jamaica' },
      { value: 'Japan', label: 'Japan' },
      { value: 'Jersey', label: 'Jersey' },
      { value: 'Jordan', label: 'Jordan' },
      { value: 'Kazakhstan', label: 'Kazakhstan' },
      { value: 'Kenya', label: 'Kenya' },
      { value: 'Kiribati', label: 'Kiribati' },
      { value: 'Korea', label: 'Korea' },
      { value: 'Korea, Democratic People\'s Republic of (North)', label: 'Korea, Democratic People\'s Republic of (North)' },
      { value: 'Korea, Republic of (South)', label: 'Korea, Republic of (South)' },
      { value: 'Kosovo', label: 'Kosovo' },
      { value: 'Kuwait', label: 'Kuwait' },
      { value: 'Kyrgyzstan ', label: 'Kyrgyzstan ' },
      { value: 'Laos', label: 'Laos' },
      { value: 'Latvia', label: 'Latvia' },
      { value: 'Lebanon', label: 'Lebanon' },
      { value: 'Lesotho', label: 'Lesotho' },
      { value: 'Liberia', label: 'Liberia' },
      { value: 'Libya', label: 'Libya' },
      { value: 'Liechtenstein', label: 'Liechtenstein' },
      { value: 'Lithuania', label: 'Lithuania' },
      { value: 'Luxembourg', label: 'Luxembourg' },
      { value: 'Macau (SAR of China)', label: 'Macau (SAR of China)' },
      { value: 'Macedonia', label: 'Macedonia' },
      { value: 'Madagascar', label: 'Madagascar' },
      { value: 'Malawi', label: 'Malawi' },
      { value: 'Malaysia', label: 'Malaysia' },
      { value: 'Maldives', label: 'Maldives' },
      { value: 'Mali', label: 'Mali' },
      { value: 'Malta', label: 'Malta' },
      { value: 'Marshall Islands', label: 'Marshall Islands' },
      { value: 'Martinique', label: 'Martinique' },
      { value: 'Mauritania', label: 'Mauritania' },
      { value: 'Mauritius', label: 'Mauritius' },
      { value: 'Mayotte', label: 'Mayotte' },
      { value: 'Mexico', label: 'Mexico' },
      { value: 'Micronesia, Federated States of', label: 'Micronesia, Federated States of' },
      { value: 'Moldova', label: 'Moldova' },
      { value: 'Monaco', label: 'Monaco' },
      { value: 'Mongolia', label: 'Mongolia' },
      { value: 'Montenegro', label: 'Montenegro' },
      { value: 'Montserrat', label: 'Montserrat' },
      { value: 'Morocco', label: 'Morocco' },
      { value: 'Mozambique', label: 'Mozambique' },
      { value: 'Myanmar', label: 'Myanmar' },
      { value: 'Namibia', label: 'Namibia' },
      { value: 'Nauru', label: 'Nauru' },
      { value: 'Nepal', label: 'Nepal' },
      { value: 'Netherlands', label: 'Netherlands' },
      { value: 'Netherlands Antilles', label: 'Netherlands Antilles' },
      { value: 'New Caledonia', label: 'New Caledonia' },
      { value: 'New Zealand', label: 'New Zealand' },
      { value: 'Nicaragua', label: 'Nicaragua' },
      { value: 'Niger', label: 'Niger' },
      { value: 'Nigeria', label: 'Nigeria' },
      { value: 'Niue', label: 'Niue' },
      { value: 'Norfolk Island', label: 'Norfolk Island' },
      { value: 'Northern Ireland', label: 'Northern Ireland' },
      { value: 'Northern Mariana Islands', label: 'Northern Mariana Islands' },
      { value: 'Norway', label: 'Norway' },
      { value: 'Not Specified', label: 'Not Specified' },
      { value: 'Oman', label: 'Oman' },
      { value: 'Pakistan', label: 'Pakistan' },
      { value: 'Palau', label: 'Palau' },
      { value: 'Panama', label: 'Panama' },
      { value: 'Papua New Guinea', label: 'Papua New Guinea' },
      { value: 'Paraguay', label: 'Paraguay' },
      { value: 'Peru', label: 'Peru' },
      { value: 'Philippines', label: 'Philippines' },
      { value: 'Pitcairn Islands', label: 'Pitcairn Islands' },
      { value: 'Poland', label: 'Poland' },
      { value: 'Polynesia (excludes Hawaii), nec', label: 'Polynesia (excludes Hawaii), nec' },
      { value: 'Portugal', label: 'Portugal' },
      { value: 'Puerto Rico', label: 'Puerto Rico' },
      { value: 'Qatar', label: 'Qatar' },
      { value: 'Queen Maud Land (Norway)', label: 'Queen Maud Land (Norway)' },
      { value: 'Reunion', label: 'Reunion' },
      { value: 'Romania', label: 'Romania' },
      { value: 'Ross Dependency (New Zealand)', label: 'Ross Dependency (New Zealand)' },
      { value: 'Russia', label: 'Russia' },
      { value: 'Russian Federation', label: 'Russian Federation' },
      { value: 'Rwanda', label: 'Rwanda' },
      { value: 'Samoa', label: 'Samoa' },
      { value: 'Samoa, American', label: 'Samoa, American' },
      { value: 'San Marino', label: 'San Marino' },
      { value: 'Sao Tome and Principe', label: 'Sao Tome and Principe' },
      { value: 'Saudi Arabia', label: 'Saudi Arabia' },
      { value: 'Scotland', label: 'Scotland' },
      { value: 'Senegal', label: 'Senegal' },
      { value: 'Serbia', label: 'Serbia' },
      { value: 'Seychelles', label: 'Seychelles' },
      { value: 'Sierra Leone', label: 'Sierra Leone' },
      { value: 'Singapore', label: 'Singapore' },
      { value: 'Sint Maarten', label: 'Sint Maarten' },
      { value: 'Slovakia', label: 'Slovakia' },
      { value: 'Slovenia', label: 'Slovenia' },
      { value: 'Solomon Islands', label: 'Solomon Islands' },
      { value: 'Somalia', label: 'Somalia' },
      { value: 'South Africa', label: 'South Africa' },
      { value: 'South America, nec', label: 'South America, nec' },
      { value: 'South Sudan', label: 'South Sudan' },
      { value: 'Southern and East Africa, nec', label: 'Southern and East Africa, nec' },
      { value: 'Spain', label: 'Spain' },
      { value: 'Spanish North Africa', label: 'Spanish North Africa' },
      { value: 'Sri Lanka', label: 'Sri Lanka' },
      { value: 'St Barthelemy', label: 'St Barthelemy' },
      { value: 'St Helena', label: 'St Helena' },
      { value: 'St Kitts and Nevis', label: 'St Kitts and Nevis' },
      { value: 'St Lucia', label: 'St Lucia' },
      { value: 'St Martin (French part)', label: 'St Martin (French part)' },
      { value: 'St Pierre and Miquelon', label: 'St Pierre and Miquelon' },
      { value: 'St Vincent and the Grenadines', label: 'St Vincent and the Grenadines' },
      { value: 'Sudan', label: 'Sudan' },
      { value: 'Suriname', label: 'Suriname' },
      { value: 'Swaziland', label: 'Swaziland' },
      { value: 'Sweden', label: 'Sweden' },
      { value: 'Switzerland', label: 'Switzerland' },
      { value: 'Syria', label: 'Syria' },
      { value: 'Tajikistan', label: 'Tajikistan' },
      { value: 'Tanzania', label: 'Tanzania' },
      { value: 'Thailand', label: 'Thailand' },
      { value: 'The former Yugoslav Republic of Macedonia', label: 'The former Yugoslav Republic of Macedonia' },
      { value: 'Timor-Leste', label: 'Timor-Leste' },
      { value: 'Togo', label: 'Togo' },
      { value: 'Tokelau', label: 'Tokelau' },
      { value: 'Tonga', label: 'Tonga' },
      { value: 'Trinidad and Tobago', label: 'Trinidad and Tobago' },
      { value: 'Tunisia', label: 'Tunisia' },
      { value: 'Turkey', label: 'Turkey' },
      { value: 'Turkmenistan', label: 'Turkmenistan' },
      { value: 'Turks and Caicos Islands', label: 'Turks and Caicos Islands' },
      { value: 'Tuvalu', label: 'Tuvalu' },
      { value: 'Uganda', label: 'Uganda' },
      { value: 'Ukraine', label: 'Ukraine' },
      { value: 'United Arab Emirates', label: 'United Arab Emirates' },
      { value: 'United Kingdom', label: 'United Kingdom' },
      { value: 'Uruguay', label: 'Uruguay' },
      { value: 'Uzbekistan', label: 'Uzbekistan' },
      { value: 'Vanuatu', label: 'Vanuatu' },
      { value: 'Venezuela', label: 'Venezuela' },
      { value: 'Vietnam', label: 'Vietnam' },
      { value: 'Virgin Islands, British', label: 'Virgin Islands, British' },
      { value: 'Virgin Islands, United States', label: 'Virgin Islands, United States' },
      { value: 'Wales', label: 'Wales' },
      { value: 'Wallis and Futuna', label: 'Wallis and Futuna' },
      { value: 'Western Sahara', label: 'Western Sahara' },
      { value: 'Yemen', label: 'Yemen' },
      { value: 'Zambia', label: 'Zambia' },
      { value: 'Zimbabwe', label: 'Zimbabwe' }
    ]
  },
  buildingPropertyName: {
    name: 'buildingPropertyName',
    label: 'Building/Property Name',
    type: 'text',
    required: false,
    placeholder: 'Enter building or property name (optional)'
  },
  flatUnitDetails: {
    name: 'flatUnitDetails',
    label: 'Flat/Unit Details',
    type: 'text',
    required: false,
    placeholder: 'Enter flat or unit details (optional)'
  },
  streetNumber: {
    name: 'streetNumber',
    label: 'Street Number',
    type: 'text',
    required: true,
    placeholder: 'Enter street number'
  },
  streetName: {
    name: 'streetName',
    label: 'Street Name',
    type: 'text',
    required: true,
    placeholder: 'Enter street name'
  },
  cityTownSuburb: {
    name: 'cityTownSuburb',
    label: 'City/Town/Suburb',
    type: 'text',
    required: true,
    placeholder: 'Enter city, town or suburb'
  },
  state: {
    name: 'state',
    label: 'State',
    type: 'text',
    required: true,
    placeholder: 'Enter state'
  },
  postcode: {
    name: 'postcode',
    label: 'Postcode',
    type: 'text',
    required: true,
    placeholder: 'Enter postcode'
  },
  mobilePhone: {
    name: 'mobilePhone',
    label: 'Mobile Phone',
    type: 'tel',
    required: true,
    placeholder: 'Enter your mobile phone number'
  },
  hasPostalAddress: {
    name: 'hasPostalAddress',
    label: 'Do you have a postal address? (if different to your current street address)',
    type: 'select',
    required: true,
    placeholder: 'Please select',
    options: [
      { value: 'No', label: 'No, my postal address and current address are the same.' },
      { value: 'Yes', label: 'Yes, I have different postal address.' }
    ]
  },
  // Postal Address Section (conditional)
  postalCountry: {
    name: 'postalCountry',
    label: 'Country',
    type: 'select',
    required: false,
    placeholder: 'Please select country',
    options: [
      { value: '', label: '--Please select country--' },
      { value: 'China (excludes SARs and Taiwan)', label: 'China (excludes SARs and Taiwan)' },
      { value: 'Hong Kong (SAR of China)', label: 'Hong Kong (SAR of China)' },
      { value: 'Macau (SAR of China)', label: 'Macau (SAR of China)' },
      { value: 'Taiwan', label: 'Taiwan' },
      { value: 'Australia', label: 'Australia' },
      { value: 'United States of America', label: 'United States of America' },
      { value: '---', label: '--- Other Countries ---', disabled: true },
      { value: 'Adelie Land (France)', label: 'Adelie Land (France)' },
      { value: 'Afghanistan', label: 'Afghanistan' },
      { value: 'Aland Islands', label: 'Aland Islands' },
      { value: 'Albania', label: 'Albania' },
      { value: 'Algeria', label: 'Algeria' },
      { value: 'Andorra', label: 'Andorra' },
      { value: 'Angola', label: 'Angola' },
      { value: 'Anguilla', label: 'Anguilla' },
      { value: 'Antigua and Barbuda', label: 'Antigua and Barbuda' },
      { value: 'Argentina', label: 'Argentina' },
      { value: 'Argentinian Antarctic Territory', label: 'Argentinian Antarctic Territory' },
      { value: 'Armenia', label: 'Armenia' },
      { value: 'Aruba', label: 'Aruba' },
      { value: 'Australian Antarctic Territory', label: 'Australian Antarctic Territory' },
      { value: 'Australian External Territories, nec', label: 'Australian External Territories, nec' },
      { value: 'Austria', label: 'Austria' },
      { value: 'Azerbaijan', label: 'Azerbaijan' },
      { value: 'Bahamas', label: 'Bahamas' },
      { value: 'Bahrain', label: 'Bahrain' },
      { value: 'Bangladesh', label: 'Bangladesh' },
      { value: 'Barbados', label: 'Barbados' },
      { value: 'Belarus', label: 'Belarus' },
      { value: 'Belgium', label: 'Belgium' },
      { value: 'Belize', label: 'Belize' },
      { value: 'Benin', label: 'Benin' },
      { value: 'Bermuda', label: 'Bermuda' },
      { value: 'Bhutan', label: 'Bhutan' },
      { value: 'Bolivia', label: 'Bolivia' },
      { value: 'Bonaire, Sint Eustatius and Saba', label: 'Bonaire, Sint Eustatius and Saba' },
      { value: 'Bosnia and Herzegovina', label: 'Bosnia and Herzegovina' },
      { value: 'Botswana', label: 'Botswana' },
      { value: 'Brazil', label: 'Brazil' },
      { value: 'British Antarctic Territory', label: 'British Antarctic Territory' },
      { value: 'Brunei Darussalam', label: 'Brunei Darussalam' },
      { value: 'Bulgaria', label: 'Bulgaria' },
      { value: 'Burkina Faso', label: 'Burkina Faso' },
      { value: 'Burma (Republic of the Union of Myanmar)', label: 'Burma (Republic of the Union of Myanmar)' },
      { value: 'Burundi', label: 'Burundi' },
      { value: 'Cambodia', label: 'Cambodia' },
      { value: 'Cameroon', label: 'Cameroon' },
      { value: 'Canada', label: 'Canada' },
      { value: 'Cape Verde', label: 'Cape Verde' },
      { value: 'Cayman Islands', label: 'Cayman Islands' },
      { value: 'Central African Republic', label: 'Central African Republic' },
      { value: 'Chad', label: 'Chad' },
      { value: 'Chile', label: 'Chile' },
      { value: 'Chilean Antarctic Territory', label: 'Chilean Antarctic Territory' },
      { value: 'China', label: 'China' },
      { value: 'Colombia', label: 'Colombia' },
      { value: 'Comoros', label: 'Comoros' },
      { value: 'Congo', label: 'Congo' },
      { value: 'Congo, Democratic Republic of', label: 'Congo, Democratic Republic of' },
      { value: 'Cook Islands', label: 'Cook Islands' },
      { value: 'Costa Rica', label: 'Costa Rica' },
      { value: 'Cote d\'Ivoire', label: 'Cote d\'Ivoire' },
      { value: 'Croatia', label: 'Croatia' },
      { value: 'Cuba', label: 'Cuba' },
      { value: 'Curacao', label: 'Curacao' },
      { value: 'Cyprus', label: 'Cyprus' },
      { value: 'Czech Republic', label: 'Czech Republic' },
      { value: 'Denmark', label: 'Denmark' },
      { value: 'Djibouti', label: 'Djibouti' },
      { value: 'Dominica', label: 'Dominica' },
      { value: 'Dominican Republic', label: 'Dominican Republic' },
      { value: 'Ecuador', label: 'Ecuador' },
      { value: 'Egypt', label: 'Egypt' },
      { value: 'El Salvador', label: 'El Salvador' },
      { value: 'England', label: 'England' },
      { value: 'Equatorial Guinea', label: 'Equatorial Guinea' },
      { value: 'Eritrea', label: 'Eritrea' },
      { value: 'Estonia', label: 'Estonia' },
      { value: 'Ethiopia', label: 'Ethiopia' },
      { value: 'Falkland Islands', label: 'Falkland Islands' },
      { value: 'Faroe Islands', label: 'Faroe Islands' },
      { value: 'Fiji', label: 'Fiji' },
      { value: 'Finland', label: 'Finland' },
      { value: 'France', label: 'France' },
      { value: 'French Guiana', label: 'French Guiana' },
      { value: 'French Polynesia', label: 'French Polynesia' },
      { value: 'Gabon', label: 'Gabon' },
      { value: 'Gambia', label: 'Gambia' },
      { value: 'Gaza Strip and West Bank', label: 'Gaza Strip and West Bank' },
      { value: 'Georgia', label: 'Georgia' },
      { value: 'Germany', label: 'Germany' },
      { value: 'Ghana', label: 'Ghana' },
      { value: 'Gibraltar', label: 'Gibraltar' },
      { value: 'Greece', label: 'Greece' },
      { value: 'Greenland', label: 'Greenland' },
      { value: 'Grenada', label: 'Grenada' },
      { value: 'Guadeloupe', label: 'Guadeloupe' },
      { value: 'Guam', label: 'Guam' },
      { value: 'Guatemala', label: 'Guatemala' },
      { value: 'Guernsey', label: 'Guernsey' },
      { value: 'Guinea', label: 'Guinea' },
      { value: 'Guinea-Bissau', label: 'Guinea-Bissau' },
      { value: 'Guyana', label: 'Guyana' },
      { value: 'Haiti', label: 'Haiti' },
      { value: 'Holy See', label: 'Holy See' },
      { value: 'Honduras', label: 'Honduras' },
      { value: 'Hungary', label: 'Hungary' },
      { value: 'Iceland', label: 'Iceland' },
      { value: 'India', label: 'India' },
      { value: 'Indonesia', label: 'Indonesia' },
      { value: 'Iran', label: 'Iran' },
      { value: 'Iraq', label: 'Iraq' },
      { value: 'Ireland', label: 'Ireland' },
      { value: 'Isle of Man', label: 'Isle of Man' },
      { value: 'Israel', label: 'Israel' },
      { value: 'Italy', label: 'Italy' },
      { value: 'Jamaica', label: 'Jamaica' },
      { value: 'Japan', label: 'Japan' },
      { value: 'Jersey', label: 'Jersey' },
      { value: 'Jordan', label: 'Jordan' },
      { value: 'Kazakhstan', label: 'Kazakhstan' },
      { value: 'Kenya', label: 'Kenya' },
      { value: 'Kiribati', label: 'Kiribati' },
      { value: 'Korea', label: 'Korea' },
      { value: 'Korea, Democratic People\'s Republic of (North)', label: 'Korea, Democratic People\'s Republic of (North)' },
      { value: 'Korea, Republic of (South)', label: 'Korea, Republic of (South)' },
      { value: 'Kosovo', label: 'Kosovo' },
      { value: 'Kuwait', label: 'Kuwait' },
      { value: 'Kyrgyzstan ', label: 'Kyrgyzstan ' },
      { value: 'Laos', label: 'Laos' },
      { value: 'Latvia', label: 'Latvia' },
      { value: 'Lebanon', label: 'Lebanon' },
      { value: 'Lesotho', label: 'Lesotho' },
      { value: 'Liberia', label: 'Liberia' },
      { value: 'Libya', label: 'Libya' },
      { value: 'Liechtenstein', label: 'Liechtenstein' },
      { value: 'Lithuania', label: 'Lithuania' },
      { value: 'Luxembourg', label: 'Luxembourg' },
      { value: 'Macau (SAR of China)', label: 'Macau (SAR of China)' },
      { value: 'Macedonia', label: 'Macedonia' },
      { value: 'Madagascar', label: 'Madagascar' },
      { value: 'Malawi', label: 'Malawi' },
      { value: 'Malaysia', label: 'Malaysia' },
      { value: 'Maldives', label: 'Maldives' },
      { value: 'Mali', label: 'Mali' },
      { value: 'Malta', label: 'Malta' },
      { value: 'Marshall Islands', label: 'Marshall Islands' },
      { value: 'Martinique', label: 'Martinique' },
      { value: 'Mauritania', label: 'Mauritania' },
      { value: 'Mauritius', label: 'Mauritius' },
      { value: 'Mayotte', label: 'Mayotte' },
      { value: 'Mexico', label: 'Mexico' },
      { value: 'Micronesia, Federated States of', label: 'Micronesia, Federated States of' },
      { value: 'Moldova', label: 'Moldova' },
      { value: 'Monaco', label: 'Monaco' },
      { value: 'Mongolia', label: 'Mongolia' },
      { value: 'Montenegro', label: 'Montenegro' },
      { value: 'Montserrat', label: 'Montserrat' },
      { value: 'Morocco', label: 'Morocco' },
      { value: 'Mozambique', label: 'Mozambique' },
      { value: 'Myanmar', label: 'Myanmar' },
      { value: 'Namibia', label: 'Namibia' },
      { value: 'Nauru', label: 'Nauru' },
      { value: 'Nepal', label: 'Nepal' },
      { value: 'Netherlands', label: 'Netherlands' },
      { value: 'Netherlands Antilles', label: 'Netherlands Antilles' },
      { value: 'New Caledonia', label: 'New Caledonia' },
      { value: 'New Zealand', label: 'New Zealand' },
      { value: 'Nicaragua', label: 'Nicaragua' },
      { value: 'Niger', label: 'Niger' },
      { value: 'Nigeria', label: 'Nigeria' },
      { value: 'Niue', label: 'Niue' },
      { value: 'Norfolk Island', label: 'Norfolk Island' },
      { value: 'Northern Ireland', label: 'Northern Ireland' },
      { value: 'Northern Mariana Islands', label: 'Northern Mariana Islands' },
      { value: 'Norway', label: 'Norway' },
      { value: 'Not Specified', label: 'Not Specified' },
      { value: 'Oman', label: 'Oman' },
      { value: 'Pakistan', label: 'Pakistan' },
      { value: 'Palau', label: 'Palau' },
      { value: 'Panama', label: 'Panama' },
      { value: 'Papua New Guinea', label: 'Papua New Guinea' },
      { value: 'Paraguay', label: 'Paraguay' },
      { value: 'Peru', label: 'Peru' },
      { value: 'Philippines', label: 'Philippines' },
      { value: 'Pitcairn Islands', label: 'Pitcairn Islands' },
      { value: 'Poland', label: 'Poland' },
      { value: 'Polynesia (excludes Hawaii), nec', label: 'Polynesia (excludes Hawaii), nec' },
      { value: 'Portugal', label: 'Portugal' },
      { value: 'Puerto Rico', label: 'Puerto Rico' },
      { value: 'Qatar', label: 'Qatar' },
      { value: 'Queen Maud Land (Norway)', label: 'Queen Maud Land (Norway)' },
      { value: 'Reunion', label: 'Reunion' },
      { value: 'Romania', label: 'Romania' },
      { value: 'Ross Dependency (New Zealand)', label: 'Ross Dependency (New Zealand)' },
      { value: 'Russia', label: 'Russia' },
      { value: 'Russian Federation', label: 'Russian Federation' },
      { value: 'Rwanda', label: 'Rwanda' },
      { value: 'Samoa', label: 'Samoa' },
      { value: 'Samoa, American', label: 'Samoa, American' },
      { value: 'San Marino', label: 'San Marino' },
      { value: 'Sao Tome and Principe', label: 'Sao Tome and Principe' },
      { value: 'Saudi Arabia', label: 'Saudi Arabia' },
      { value: 'Scotland', label: 'Scotland' },
      { value: 'Senegal', label: 'Senegal' },
      { value: 'Serbia', label: 'Serbia' },
      { value: 'Seychelles', label: 'Seychelles' },
      { value: 'Sierra Leone', label: 'Sierra Leone' },
      { value: 'Singapore', label: 'Singapore' },
      { value: 'Sint Maarten', label: 'Sint Maarten' },
      { value: 'Slovakia', label: 'Slovakia' },
      { value: 'Slovenia', label: 'Slovenia' },
      { value: 'Solomon Islands', label: 'Solomon Islands' },
      { value: 'Somalia', label: 'Somalia' },
      { value: 'South Africa', label: 'South Africa' },
      { value: 'South America, nec', label: 'South America, nec' },
      { value: 'South Sudan', label: 'South Sudan' },
      { value: 'Southern and East Africa, nec', label: 'Southern and East Africa, nec' },
      { value: 'Spain', label: 'Spain' },
      { value: 'Spanish North Africa', label: 'Spanish North Africa' },
      { value: 'Sri Lanka', label: 'Sri Lanka' },
      { value: 'St Barthelemy', label: 'St Barthelemy' },
      { value: 'St Helena', label: 'St Helena' },
      { value: 'St Kitts and Nevis', label: 'St Kitts and Nevis' },
      { value: 'St Lucia', label: 'St Lucia' },
      { value: 'St Martin (French part)', label: 'St Martin (French part)' },
      { value: 'St Pierre and Miquelon', label: 'St Pierre and Miquelon' },
      { value: 'St Vincent and the Grenadines', label: 'St Vincent and the Grenadines' },
      { value: 'Sudan', label: 'Sudan' },
      { value: 'Suriname', label: 'Suriname' },
      { value: 'Swaziland', label: 'Swaziland' },
      { value: 'Sweden', label: 'Sweden' },
      { value: 'Switzerland', label: 'Switzerland' },
      { value: 'Syria', label: 'Syria' },
      { value: 'Tajikistan', label: 'Tajikistan' },
      { value: 'Tanzania', label: 'Tanzania' },
      { value: 'Thailand', label: 'Thailand' },
      { value: 'The former Yugoslav Republic of Macedonia', label: 'The former Yugoslav Republic of Macedonia' },
      { value: 'Timor-Leste', label: 'Timor-Leste' },
      { value: 'Togo', label: 'Togo' },
      { value: 'Tokelau', label: 'Tokelau' },
      { value: 'Tonga', label: 'Tonga' },
      { value: 'Trinidad and Tobago', label: 'Trinidad and Tobago' },
      { value: 'Tunisia', label: 'Tunisia' },
      { value: 'Turkey', label: 'Turkey' },
      { value: 'Turkmenistan', label: 'Turkmenistan' },
      { value: 'Turks and Caicos Islands', label: 'Turks and Caicos Islands' },
      { value: 'Tuvalu', label: 'Tuvalu' },
      { value: 'Uganda', label: 'Uganda' },
      { value: 'Ukraine', label: 'Ukraine' },
      { value: 'United Arab Emirates', label: 'United Arab Emirates' },
      { value: 'United Kingdom', label: 'United Kingdom' },
      { value: 'Uruguay', label: 'Uruguay' },
      { value: 'Uzbekistan', label: 'Uzbekistan' },
      { value: 'Vanuatu', label: 'Vanuatu' },
      { value: 'Venezuela', label: 'Venezuela' },
      { value: 'Vietnam', label: 'Vietnam' },
      { value: 'Virgin Islands, British', label: 'Virgin Islands, British' },
      { value: 'Virgin Islands, United States', label: 'Virgin Islands, United States' },
      { value: 'Wales', label: 'Wales' },
      { value: 'Wallis and Futuna', label: 'Wallis and Futuna' },
      { value: 'Western Sahara', label: 'Western Sahara' },
      { value: 'Yemen', label: 'Yemen' },
      { value: 'Zambia', label: 'Zambia' },
      { value: 'Zimbabwe', label: 'Zimbabwe' }
    ]
  },
  postalBuildingPropertyName: {
    name: 'postalBuildingPropertyName',
    label: 'Building/Property Name',
    type: 'text',
    required: false,
    placeholder: 'Enter building or property name (optional)'
  },
  postalFlatUnitDetails: {
    name: 'postalFlatUnitDetails',
    label: 'Flat/Unit Details',
    type: 'text',
    required: false,
    placeholder: 'Enter flat or unit details (optional)'
  },
  postalStreetNumber: {
    name: 'postalStreetNumber',
    label: 'Street Number',
    type: 'text',
    required: false,
    placeholder: 'Enter street number'
  },
  postalStreetName: {
    name: 'postalStreetName',
    label: 'Street Name',
    type: 'text',
    required: false,
    placeholder: 'Enter street name'
  },
  postalCityTownSuburb: {
    name: 'postalCityTownSuburb',
    label: 'City/Town/Suburb',
    type: 'text',
    required: false,
    placeholder: 'Enter city, town or suburb'
  },
  postalState: {
    name: 'postalState',
    label: 'State',
    type: 'text',
    required: false,
    placeholder: 'Enter state'
  },
  postalPostcode: {
    name: 'postalPostcode',
    label: 'Postcode',
    type: 'text',
    required: false,
    placeholder: 'Enter postcode'
  },
  postalMobilePhone: {
    name: 'postalMobilePhone',
    label: 'Mobile Phone',
    type: 'tel',
    required: false,
    placeholder: 'Enter mobile phone number'
  },

  // Language and Cultural Diversity Section
  isAboriginal: {
    name: 'isAboriginal',
    label: 'Are you of Australian Aboriginal origin?',
    type: 'select',
    required: true,
    placeholder: 'Please select',
    options: [
      { value: 'No', label: 'No' },
      { value: 'Yes', label: 'Yes' }
    ]
  },
  isTorresStraitIslander: {
    name: 'isTorresStraitIslander',
    label: 'Are you of Torres Strait Islander origin?',
    type: 'select',
    required: true,
    placeholder: 'Please select',
    options: [
      { value: 'No', label: 'No' },
      { value: 'Yes', label: 'Yes' }
    ]
  },
  isEnglishMainLanguage: {
    name: 'isEnglishMainLanguage',
    label: 'Is English your main language?',
    type: 'select',
    required: true,
    placeholder: 'Please select',
    options: [
      { value: 'No', label: 'No' },
      { value: 'Yes', label: 'Yes' }
    ]
  },
  languageSpokenAtHome: {
    name: 'languageSpokenAtHome',
    label: 'If no, what is your language spoken at home?',
    type: 'select',
    required: false,
    placeholder: 'Please select',
    optgroups: [
      {
        label: 'East Asia',
        options: [
          { value: 'Chinese - Mandarin', label: 'Chinese – Mandarin (普通话)' },
          { value: 'Chinese - Cantonese', label: 'Chinese – Cantonese (粤语)' },
          { value: 'Chinese - Shanghainese', label: 'Chinese – Shanghainese (吴语/上海话)' },
          { value: 'Chinese - Hokkien/Taiwanese', label: 'Chinese – Hokkien/Taiwanese (闽南语/台语)' },
          { value: 'Chinese - Teochew/Chaozhou', label: 'Chinese – Teochew/Chaozhou (潮汕话)' },
          { value: 'Chinese - Hakka', label: 'Chinese – Hakka (客家话)' },
          { value: 'Chinese - Fuzhou/Min Dong', label: 'Chinese – Fuzhou/Min Dong (福州话/闽东语)' },
          { value: 'Tibetan', label: 'Tibetan (藏语)' },
          { value: 'Mongolian', label: 'Mongolian (蒙古语)' },
          { value: 'Korean', label: 'Korean (한국어/朝鲜语)' },
          { value: 'Japanese', label: 'Japanese (日本語)' },
          { value: 'Other (East Asia)', label: 'Other (East Asia) – please specify' }
        ]
      },
      {
        label: 'South Asia',
        options: [
          { value: 'Hindi', label: 'Hindi (हिन्दी)' },
          { value: 'Urdu', label: 'Urdu (اُردُو)' },
          { value: 'Bengali/Bangla', label: 'Bengali/Bangla (বাংলা)' },
          { value: 'Punjabi (Gurmukhi)', label: 'Punjabi (Gurmukhi) (ਪੰਜਾਬੀ)' },
          { value: 'Punjabi (Shahmukhi)', label: 'Punjabi (Shahmukhi) (پنجابی)' },
          { value: 'Gujarati', label: 'Gujarati (ગુજરાતી)' },
          { value: 'Marathi', label: 'Marathi (मराठी)' },
          { value: 'Tamil', label: 'Tamil (தமிழ்)' },
          { value: 'Telugu', label: 'Telugu (తెలుగు)' },
          { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
          { value: 'Malayalam', label: 'Malayalam (മലയാളം)' },
          { value: 'Odia/Oriya', label: 'Odia/Oriya (ଓଡ଼ିଆ)' },
          { value: 'Sinhala/Sinhalese', label: 'Sinhala/Sinhalese (සිංහල)' },
          { value: 'Nepali', label: 'Nepali (नेपाली)' },
          { value: 'Sindhi', label: 'Sindhi (سنڌي/सिन्धी)' },
          { value: 'Kashmiri', label: 'Kashmiri (کٲشُر/कॉशुर)' },
          { value: 'Dhivehi/Maldivian', label: 'Dhivehi/Maldivian (ދިވެހި)' },
          { value: 'Pashto', label: 'Pashto (پښتو)' },
          { value: 'Other (South Asia)', label: 'Other (South Asia) – please specify' }
        ]
      },
      {
        label: 'Southeast Asia',
        options: [
          { value: 'Vietnamese', label: 'Vietnamese (Tiếng Việt)' },
          { value: 'Khmer/Cambodian', label: 'Khmer/Cambodian (ភាសាខ្មែរ)' },
          { value: 'Lao', label: 'Lao (ລາວ)' },
          { value: 'Thai', label: 'Thai (ไทย)' },
          { value: 'Burmese/Myanmar', label: 'Burmese/Myanmar (မြန်မာ)' },
          { value: 'Karen - S\'gaw', label: 'Karen – S\'gaw (ကညီကျိ)' },
          { value: 'Karen - Pwo', label: 'Karen – Pwo' },
          { value: 'Hmong/Miao', label: 'Hmong/Miao (Hmong Daw/Njua)' },
          { value: 'Indonesian', label: 'Indonesian / Bahasa Indonesia' },
          { value: 'Javanese', label: 'Javanese (Basa Jawa)' },
          { value: 'Sundanese', label: 'Sundanese (Basa Sunda)' },
          { value: 'Malay', label: 'Malay / Bahasa Melayu' },
          { value: 'Filipino', label: 'Filipino' },
          { value: 'Tagalog', label: 'Tagalog' },
          { value: 'Cebuano/Bisaya', label: 'Cebuano/Bisaya' },
          { value: 'Ilocano', label: 'Ilocano' },
          { value: 'Tetum', label: 'Tetum (Timor-Leste)' },
          { value: 'Mon', label: 'Mon (ဘာသာ မန်)' },
          { value: 'Other (Southeast Asia)', label: 'Other (Southeast Asia) – please specify' }
        ]
      },
      {
        label: 'General',
        options: [
          { value: 'Multiple languages', label: 'Multiple languages – specify primary' },
          { value: 'Other', label: 'Other – please specify' },
          { value: 'Prefer not to say / Unknown', label: 'Prefer not to say / Unknown' }
        ]
      }
    ]
  },
  languageSpokenAtHomeOther: {
    name: 'languageSpokenAtHomeOther',
    label: 'Please specify the language',
    type: 'text',
    required: false,
    placeholder: 'Enter language name'
  },
  wasEnglishInstructionLanguage: {
    name: 'wasEnglishInstructionLanguage',
    label: 'Was English the language of instruction in previous secondary or tertiary studies?',
    type: 'select',
    required: true,
    placeholder: 'Please select',
    options: [
      { value: 'No', label: 'No' },
      { value: 'Yes', label: 'Yes' }
    ]
  },
  hasCompletedEnglishTest: {
    name: 'hasCompletedEnglishTest',
    label: 'How do you complete English Language Proficiency?',
    type: 'select',
    required: true,
    placeholder: 'Please select',
    options: [
      { value: 'English test', label: 'English test' },
      { value: 'ELICOS Training', label: 'ELICOS Training' }
    ]
  },
  // English Test Section (conditional)
  englishTestType: {
    name: 'englishTestType',
    label: 'What test did you sit?',
    type: 'select',
    required: false,
    placeholder: 'Please select test type',
    options: [
      { value: 'IELTS', label: 'IELTS' },
      { value: 'PTE', label: 'PTE' },
      { value: 'TOEFL', label: 'TOEFL' }
    ]
  },
  listeningScore: {
    name: 'listeningScore',
    label: 'Listening Score',
    type: 'number',
    required: false,
    placeholder: 'Enter listening score',
    step: '0.1'
  },
  readingScore: {
    name: 'readingScore',
    label: 'Reading Score',
    type: 'number',
    required: false,
    placeholder: 'Enter reading score',
    step: '0.1'
  },
  writingScore: {
    name: 'writingScore',
    label: 'Writing Score',
    type: 'number',
    required: false,
    placeholder: 'Enter writing score',
    step: '0.1'
  },
  speakingScore: {
    name: 'speakingScore',
    label: 'Speaking Score',
    type: 'number',
    required: false,
    placeholder: 'Enter speaking score',
    step: '0.1'
  },
  overallScore: {
    name: 'overallScore',
    label: 'Overall Score',
    type: 'number',
    required: false,
    placeholder: 'Enter overall score',
    step: '0.1'
  },
  engTestDate: {
    name: 'engTestDate',
    label: 'Test Date',
    type: 'date',
    required: false,
    placeholder: 'Select test date'
  },

  // Education History Section
  highestSchoolLevel: {
    name: 'highestSchoolLevel',
    label: 'What is your highest completed school level?',
    type: 'select',
    required: true,
    placeholder: 'Please select',
    options: [
      { value: '@@ - Not Specified', label: '@@ - Not Specified' },
      { value: '02 - Did not go to school', label: '02 - Did not go to school' },
      { value: '08 - Year 8 or below', label: '08 - Year 8 or below' },
      { value: '09 - Year 9 or equivalent', label: '09 - Year 9 or equivalent' },
      { value: '10 - Completed Year 10', label: '10 - Completed Year 10' },
      { value: '11 - Completed Year 11', label: '11 - Completed Year 11' },
      { value: '12 - Completed Year 12', label: '12 - Completed Year 12' }
    ]
  },
  isStillAttendingSchool: {
    name: 'isStillAttendingSchool',
    label: 'Are you still attending secondary school?',
    type: 'select',
    required: false,
    placeholder: 'Please select',
    options: [
      { value: 'No', label: 'No' },
      { value: 'Yes', label: 'Yes' }
    ]
  },
  hasAchievedQualifications: {
    name: 'hasAchievedQualifications',
    label: 'Have you achieved any education qualifications?',
    type: 'select',
    required: true,
    placeholder: 'Please select',
    options: [
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' }
    ]
  },

  // Qualification Details Section (conditional)
  qualificationLevel: {
    name: 'qualificationLevel',
    label: 'Your latest educational qualification',
    type: 'select',
    required: false,
    placeholder: 'Please select',
    options: [
      { value: 'Bachelor Degree or Higher Degree Level', label: 'Bachelor Degree or Higher Degree Level' },
      { value: 'Advanced Diploma or Associate Degree Level', label: 'Advanced Diploma or Associate Degree Level' },
      { value: 'Diploma Level', label: 'Diploma Level' },
      { value: 'Certificate IV', label: 'Certificate IV' },
      { value: 'Certificate III', label: 'Certificate III' },
      { value: 'Certificate II', label: 'Certificate II' },
      { value: 'Certificate I', label: 'Certificate I' },
      { value: 'Miscellaneous Education', label: 'Miscellaneous Education' }
    ]
  },
  qualificationName: {
    name: 'qualificationName',
    label: 'Qualification Name',
    type: 'text',
    required: false,
    placeholder: 'Enter qualification name'
  },
  qualificationRecognition: {
    name: 'qualificationRecognition',
    label: 'Qualification Recognition',
    type: 'select',
    required: false,
    placeholder: 'Please select',
    options: [
      { value: 'I - International', label: 'I - International' },
      { value: 'A - Australian qualification', label: 'A - Australian qualification' },
      { value: 'E - Australian equivalent', label: 'E - Australian equivalent' }
    ]
  },
  institutionName: {
    name: 'institutionName',
    label: 'School/Institution Name',
    type: 'text',
    required: false,
    placeholder: 'Enter institution name'
  },
  stateCountry: {
    name: 'stateCountry',
    label: 'State/Country',
    type: 'text',
    required: false,
    placeholder: 'Enter state/country'
  },

  // Employment Section
  currentEmploymentStatus: {
    name: 'currentEmploymentStatus',
    label: 'Which best describes your current employment status?',
    type: 'select',
    required: true,
    placeholder: 'Please select',
    options: [
      { value: '01: Full-time employee', label: '01: Full-time employee' },
      { value: '02: Part-time employee', label: '02: Part-time employee' },
      { value: '03: Self-employed - not employing others', label: '03: Self-employed - not employing others' },
      { value: '04: Self employed - employing others', label: '04: Self employed - employing others' },
      { value: '05: Employed - unpaid worker in a family business', label: '05: Employed - unpaid worker in a family business' },
      { value: '06: Unemployed - seeking full-time work', label: '06: Unemployed - seeking full-time work' },
      { value: '07: Unemployed - seeking part-time work', label: '07: Unemployed - seeking part-time work' },
      { value: '08: Not employed - not seeking employment', label: '08: Not employed - not seeking employment' },
      { value: '@@ - Not Specified', label: '@@ - Not Specified' }
    ]
  },
  industryOfEmployment: {
    name: 'industryOfEmployment',
    label: 'Industry of Employment',
    type: 'select',
    required: false,
    placeholder: 'Please select',
    options: [
      { value: 'Not specified', label: 'Not specified' },
      { value: 'A - Agriculture, Forestry and Fishing', label: 'A - Agriculture, Forestry and Fishing' },
      { value: 'B - Mining', label: 'B - Mining' },
      { value: 'C - Manufacturing', label: 'C - Manufacturing' },
      { value: 'D - Electricity, Gas, Water and Waste Services', label: 'D - Electricity, Gas, Water and Waste Services' },
      { value: 'E - Construction', label: 'E - Construction' },
      { value: 'F - Wholesale Trade', label: 'F - Wholesale Trade' },
      { value: 'G - Retail Trade', label: 'G - Retail Trade' },
      { value: 'H - Accommodation and Food Services', label: 'H - Accommodation and Food Services' },
      { value: 'I - Transport, Postal and Warehousing', label: 'I - Transport, Postal and Warehousing' },
      { value: 'J- Information Media and telecommunications', label: 'J- Information Media and telecommunications' },
      { value: 'K - Financial and Insurance Services', label: 'K - Financial and Insurance Services' },
      { value: 'L - Rental, Hiring and real Estate Services', label: 'L - Rental, Hiring and real Estate Services' },
      { value: 'M - Professional, Scientific and Technical Services', label: 'M - Professional, Scientific and Technical Services' },
      { value: 'N - Administrative and Support Services', label: 'N - Administrative and Support Services' },
      { value: 'O - Public Administration and Safety', label: 'O - Public Administration and Safety' },
      { value: 'P - Education and Training', label: 'P - Education and Training' },
      { value: 'Q - Health Care and Social Assistance', label: 'Q - Health Care and Social Assistance' },
      { value: 'R - Arts and recreation Services', label: 'R - Arts and recreation Services' },
      { value: 'S - Other Services', label: 'S - Other Services' }
    ]
  },
  occupationIdentifier: {
    name: 'occupationIdentifier',
    label: 'Occupation Identifier',
    type: 'select',
    required: false,
    placeholder: 'Please select',
    options: [
      { value: 'Not specified', label: 'Not specified' },
      { value: '1 - Manager', label: '1 - Manager' },
      { value: '2 - Professionals', label: '2 - Professionals' },
      { value: '3 - Technicians and Trades Workers', label: '3 - Technicians and Trades Workers' },
      { value: '4 - Community and personal Service Workers', label: '4 - Community and personal Service Workers' },
      { value: '5 - Clerical and Administrative Workers', label: '5 - Clerical and Administrative Workers' },
      { value: '6 - Sales Workers', label: '6 - Sales Workers' },
      { value: '7 - Machinery Operators and Drivers', label: '7 - Machinery Operators and Drivers' },
      { value: '8 - Labourers', label: '8 - Labourers' },
      { value: 'Option 109 - Other', label: 'Option 109 - Other' }
    ]
  },

  // Marketing Section
  howDidYouHearAboutUs: {
    name: 'howDidYouHearAboutUs',
    label: 'How did you hear about us?',
    type: 'select',
    required: true,
    placeholder: 'Please select',
    options: [
      { value: 'Agent', label: 'Agent' },
      { value: 'Other', label: 'Other' }
    ]
  },
  howDidYouHearDetails: {
    name: 'howDidYouHearDetails',
    label: 'Please specify how you hear about us?',
    type: 'text',
    required: false,
    placeholder: 'Please describe'
  },
  // Agent Details Section (conditional)
  agentName: {
    name: 'agentName',
    label: 'Agent Name',
    type: 'text',
    required: false,
    placeholder: 'Enter agent name'
  },
  agentEmail: {
    name: 'agentEmail',
    label: 'Agent Email',
    type: 'email',
    required: false,
    placeholder: 'Enter agent email'
  },

  // Emergency/Guardian Contact Section
  contactType: {
    name: 'contactType',
    label: 'Contact Type',
    type: 'select',
    required: true,
    placeholder: 'Please select',
    options: [
      { value: 'Guardian', label: 'Guardian' },
      { value: 'Emergency', label: 'Emergency' }
    ]
  },
  relationship: {
    name: 'relationship',
    label: 'Relationship',
    type: 'text',
    required: true,
    placeholder: 'Enter relationship'
  },
  contactGivenName: {
    name: 'contactGivenName',
    label: 'Given Name',
    type: 'text',
    required: true,
    placeholder: 'Enter given name'
  },
  contactFamilyName: {
    name: 'contactFamilyName',
    label: 'Family Name',
    type: 'text',
    required: true,
    placeholder: 'Enter family name'
  },
  contactFlatUnitDetails: {
    name: 'contactFlatUnitDetails',
    label: 'Flat/unit Details',
    type: 'text',
    required: false,
    placeholder: 'Enter flat/unit details (optional)'
  },
  contactStreetAddress: {
    name: 'contactStreetAddress',
    label: 'Street Address',
    type: 'text',
    required: false,
    placeholder: 'Enter street address (optional)'
  },
  contactCityTownSuburb: {
    name: 'contactCityTownSuburb',
    label: 'City/Town/Suburb',
    type: 'text',
    required: false,
    placeholder: 'Enter city/town/suburb (optional)'
  },
  contactPostcode: {
    name: 'contactPostcode',
    label: 'Postcode',
    type: 'text',
    required: false,
    placeholder: 'Enter postcode (optional)'
  },
  contactState: {
    name: 'contactState',
    label: 'State',
    type: 'text',
    required: false,
    placeholder: 'Enter state (optional)'
  },
  contactCountry: {
    name: 'contactCountry',
    label: 'Country',
    type: 'text',
    required: false,
    placeholder: 'Enter country (optional)'
  },
  contactEmail: {
    name: 'contactEmail',
    label: 'Email',
    type: 'email',
    required: true,
    placeholder: 'Enter contact email'
  },
  contactMobile: {
    name: 'contactMobile',
    label: 'Mobile',
    type: 'tel',
    required: true,
    placeholder: 'Enter mobile number'
  },
  contactLanguagesSpoken: {
    name: 'contactLanguagesSpoken',
    label: 'Language(s) Spoken',
    type: 'text',
    required: false,
    placeholder: 'Enter languages spoken (optional)'
  },

  // Course Intake Selection Section
  selectedIntake: {
    name: 'selectedIntake',
    label: 'Preferred Course Intake Date',
    type: 'select',
    required: true,
    placeholder: 'Please select your preferred intake date',
    options: [] // Will be populated dynamically from API
  },

  // Terms and Conditions Section
  agreeToTerms: {
    name: 'agreeToTerms',
    label: 'I agree to the enrolment terms and conditions.',
    type: 'checkbox',
    required: true
  },

  // Agent Selection Field - Dynamic loading via AgentSelector component
  selectedAgent: {
    name: 'selectedAgent',
    label: 'Selected Agent',
    type: 'custom', // Uses AgentSelector component instead of standard select
    required: true,
    placeholder: 'Search and select your assigned agent',
    description: 'Select your assigned agent from the dynamically loaded list'
  }
};

// Agent Application Form Fields
export const AGENT_FORM_FIELDS = {
  agentApplicationId: {
    name: 'agentApplicationId',
    type: 'hidden',
    label: 'Agent Application ID',
    required: true,
    generated: true // 标记为自动生成的字段
  },
  agencyName: {
    name: 'agencyName',
    type: 'text',
    label: 'Agency Name',
    required: true,
    placeholder: 'Enter agency name'
  },
  contactPerson: {
    name: 'contactPerson',
    type: 'text',
    label: 'Contact Person',
    required: true,
    placeholder: 'Enter contact person name'
  },
  primaryEmail: {
    name: 'primaryEmail',
    type: 'email',
    label: 'Primary Email',
    required: true,
    placeholder: 'Enter primary email address'
  },
  alternateEmail: {
    name: 'alternateEmail',
    type: 'email',
    label: 'Alternate Email',
    required: false,
    placeholder: 'Enter alternate email address (optional)'
  },
  tel: {
    name: 'tel',
    type: 'tel',
    label: 'Telephone Number',
    required: true,
    placeholder: 'Enter telephone number'
  },
  country: {
    name: 'country',
    type: 'text',
    label: 'Country',
    required: true,
    placeholder: 'Enter country'
  },
  address: {
    name: 'address',
    type: 'text',
    label: 'Address',
    required: true,
    placeholder: 'Enter full address'
  },
  cityTownSuburb: {
    name: 'cityTownSuburb',
    type: 'text',
    label: 'City/Town/Suburb',
    required: true,
    placeholder: 'Enter city, town or suburb'
  },
  stateProvince: {
    name: 'stateProvince',
    type: 'text',
    label: 'State/Province',
    required: true,
    placeholder: 'Enter state or province'
  },
  postcode: {
    name: 'postcode',
    type: 'text',
    label: 'Postcode',
    required: true,
    placeholder: 'Enter postcode'
  },
  acn: {
    name: 'acn',
    type: 'text',
    label: 'ACN (Australian Company Number)',
    required: false,
    placeholder: 'Enter ACN (if applicable)'
  },
  abn: {
    name: 'abn',
    type: 'text',
    label: 'ABN (Australian Business Number)',
    required: false,
    placeholder: 'Enter ABN (if applicable)'
  },
  targetRecruitmentCountry: {
    name: 'targetRecruitmentCountry',
    type: 'select',
    label: 'Target Recruitment Country - Primary',
    required: true,
    options: [
      { value: '', label: 'Select target recruitment country' },
      { value: 'China', label: 'China' },
      { value: 'India', label: 'India' },
      { value: 'Vietnam', label: 'Vietnam' },
      { value: 'Nepal', label: 'Nepal' },
      { value: 'Bangladesh', label: 'Bangladesh' },
      { value: 'Philippines', label: 'Philippines' },
      { value: 'Sri Lanka', label: 'Sri Lanka' },
      { value: 'Indonesia', label: 'Indonesia' },
      { value: 'Thailand', label: 'Thailand' },
      { value: 'Malaysia', label: 'Malaysia' },
      { value: 'Korea', label: 'Korea' },
      { value: 'Japan', label: 'Japan' },
      { value: 'Brazil', label: 'Brazil' },
      { value: 'Colombia', label: 'Colombia' },
      { value: 'Other', label: 'Other' }
    ]
  }
}; 