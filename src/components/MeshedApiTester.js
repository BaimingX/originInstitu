import React, { useState } from 'react';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_MESHED_API_ENDPOINT;
const API_USERNAME = process.env.REACT_APP_MESHED_API_USERNAME;
const API_PASSWORD = process.env.REACT_APP_MESHED_API_PASSWORD;
const OFFER_ENDPOINT_PATH = 'api/offer';

const DEFAULT_OFFER_BODY_TEMPLATE = JSON.stringify(
  {
    Title: 'Mr',
    FirstName: 'Test',
    LastName: 'User',
    Gender: 'M',
    DateOfBirth: '1995-01-01',
    PersonalEmail: 'test@example.com',
    StudentOrigin: 'OverseasStudent',
    CountryOfBirth: 'China',
    Nationality: 'Chinese',
    ResidentialType: 'Student Visa',
    PrimarySpokenLanguage: 'English',
    HowWellEnglishSpeak: 'Very well',
    CurrentEmploymentStatus: 'Employed - full-time',
    IsAboriginal: false,
    IsTorresStraitIslander: false,
    OfferAddresses: [],
    OfferAppliedCourses: []
  },
  null,
  2
);

const PRESET_ENDPOINTS = [
  {
    id: 'current-employment-status',
    label: 'Current Employment Status',
    method: 'GET',
    path: 'api/Classification/CurrentEmploymentStatus',
    query: ''
  },
  {
    id: 'education-level',
    label: 'Education Level',
    method: 'GET',
    path: 'api/Classification/EducationLevel',
    query: ''
  },
  {
    id: 'residential-visa-type',
    label: 'Residential Visa Type',
    method: 'GET',
    path: 'api/Classification/ResidentialVisaType',
    query: ''
  },
  {
    id: 'offer-document-checklist',
    label: 'Get Offer Documents Checklist',
    method: 'GET',
    path: 'api/Classification/OfferDocumentChecklist',
    query: 'StudentOrigin=Overseas Student&IsMandatory=true'
  },
  {
    id: 'custom-fields',
    label: 'Get Custom Fields',
    method: 'GET',
    path: 'api/Classification/CustomField',
    query: 'IsMandatory=true&IsOpenedForAppliedByStudent=true&StudentOrigin=Overseas Student'
  },
  {
    id: 'intake',
    label: 'Intake List',
    method: 'GET',
    path: 'api/Intake',
    query: 'courseid=CPC50220&publish=true&pageSize=50'
  },
  {
    id: 'course',
    label: 'Course List',
    method: 'GET',
    path: 'api/Course',
    query: 'active=true'
  },
  {
    id: 'offer-submit',
    label: 'Submit Offer (POST)',
    method: 'POST',
    path: 'api/Offer',
    query: '',
    bodyType: 'form',
    body: DEFAULT_OFFER_BODY_TEMPLATE
  }
];

const getNormalizedBaseUrl = () => (API_BASE_URL || '').trim().replace(/\/+$/, '');
const normalizePath = (path) => (path || '').trim().replace(/^\/+/, '').toLowerCase();
const isOfferEndpoint = (path) => normalizePath(path) === OFFER_ENDPOINT_PATH;
const VALID_STUDENT_ORIGIN_VALUES = [
  'Overseas Student',
  'Overseas Student in Australia',
  'Resident Student'
];
const VALID_HOW_WELL_ENGLISH_VALUES = ['1', '2', '3', '4', 'Not stated'];
const VALID_EMPLOYMENT_STATUS_VALUES = ['01', '02', '03', '04', '05', '06', '07', '08', '@@'];
const VALID_ADDRESS_TYPE_VALUES = [
  'Current Street Address',
  'Postal Address',
  'Overseas/Permanent Address'
];

const STUDENT_ORIGIN_MAP = {
  overseasstudent: 'Overseas Student',
  overseasstudentoffshore: 'Overseas Student',
  mainlandchinastudent: 'Overseas Student',
  'overseas student': 'Overseas Student',
  overseasstudentinaustralia: 'Overseas Student in Australia',
  'overseas student in australia': 'Overseas Student in Australia',
  residentstudent: 'Resident Student',
  'resident student': 'Resident Student'
};

const HOW_WELL_ENG_SPEAK_MAP = {
  'very well': '1',
  well: '2',
  'not well': '3',
  'not at all': '4',
  '@': 'Not stated',
  '@@': 'Not stated',
  'not stated': 'Not stated'
};

const CURRENT_EMPLOYMENT_STATUS_MAP = {
  'full-time employee': '01',
  'part-time employee': '02',
  'self-employed - not employing others': '03',
  'self employed - not employing others': '03',
  'self employed - employing others': '04',
  'self-employed - employing others': '04',
  'employed - unpaid worker in a family business': '05',
  'unemployed -  seeking full-time work': '06',
  'unemployed - seeking full-time work': '06',
  'unemployed -  seeking part-time work': '07',
  'unemployed - seeking part-time work': '07',
  'not employed -  not seeking employment': '08',
  'not employed - not seeking employment': '08',
  'not specified': '@@'
};

const toDateOnly = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const toDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
};

const normalizeStudentOrigin = (value) => {
  const normalized = (value || '').toString().trim();
  if (!normalized) return 'Overseas Student';
  if (VALID_STUDENT_ORIGIN_VALUES.includes(normalized)) return normalized;

  const mapped = STUDENT_ORIGIN_MAP[normalized.toLowerCase()];
  return mapped || normalized;
};

const normalizeHowWellEnglishSpeak = (value) => {
  const normalized = (value || '').toString().trim();
  if (!normalized) return 'Not stated';
  if (VALID_HOW_WELL_ENGLISH_VALUES.includes(normalized)) return normalized;

  const mapped = HOW_WELL_ENG_SPEAK_MAP[normalized.toLowerCase()];
  return mapped || 'Not stated';
};

const normalizeCurrentEmploymentStatus = (value) => {
  const normalized = (value || '').toString().trim();
  if (!normalized) return '@@';
  if (VALID_EMPLOYMENT_STATUS_VALUES.includes(normalized)) return normalized;

  const mapped = CURRENT_EMPLOYMENT_STATUS_MAP[normalized.toLowerCase()];
  return mapped || '@@';
};

const normalizeAddressType = (value) => {
  const normalized = (value || '').toString().trim();
  if (!normalized) return 'Current Street Address';
  if (VALID_ADDRESS_TYPE_VALUES.includes(normalized)) return normalized;

  const lower = normalized.toLowerCase();
  if (lower.includes('current')) return 'Current Street Address';
  if (lower.includes('postal')) return 'Postal Address';
  if (lower.includes('overseas') || lower.includes('permanent')) return 'Overseas/Permanent Address';

  return normalized;
};

const toNumberOrDefault = (value, defaultValue = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : defaultValue;
};

const ensureNonEmptyString = (value, fallback = 'N/A') => {
  const normalized = (value ?? '').toString().trim();
  return normalized || fallback;
};

const normalizeStudyReason = (value) => {
  const normalized = (value || '').toString().trim();
  if (!normalized) return '11';
  if (normalized.length === 1 && /^[0-9]$/.test(normalized)) return `0${normalized}`;
  return normalized;
};

const mapOfferAddresses = (addresses = []) => {
  if (!Array.isArray(addresses)) return [];

  return addresses.map((address) => {
    const mobile = ensureNonEmptyString(address.Mobile ?? address.mobile, '0000000000');
    const fallbackContact = mobile;

    return {
      addressType: normalizeAddressType(address.AddressType || address.addressType),
      buildingPropertyName: ensureNonEmptyString(address.BuildingName ?? address.buildingPropertyName, 'N/A'),
      flatUnitDetails: ensureNonEmptyString(address.FlatUnitDetail ?? address.flatUnitDetails, 'N/A'),
      streetNumber: ensureNonEmptyString(address.StreetNumber ?? address.streetNumber, 'N/A'),
      streetName: ensureNonEmptyString(address.StreetName ?? address.streetName, 'N/A'),
      suburb: ensureNonEmptyString(address.Suburb ?? address.suburb, 'N/A'),
      state: ensureNonEmptyString(address.State ?? address.state, 'N/A'),
      postcode: ensureNonEmptyString(address.Postcode ?? address.postcode, '0000'),
      country: ensureNonEmptyString(address.Country ?? address.country, 'Australia'),
      phone: ensureNonEmptyString(address.Phone ?? address.phone, fallbackContact),
      workPhone: ensureNonEmptyString(address.WorkPhone ?? address.workPhone, fallbackContact),
      fax: ensureNonEmptyString(address.Fax ?? address.fax, fallbackContact),
      mobile: mobile
    };
  });
};

const mapOfferAppliedCourses = (courses = [], complianceAndOtherInfo = {}, fallbackAgentId = 1) => {
  if (!Array.isArray(courses)) return [];

  return courses.map((course) => ({
    courseId: course.CourseId ?? course.courseId ?? '',
    agentId: toNumberOrDefault(course.AgentId ?? course.agentId, fallbackAgentId),
    campusId: toNumberOrDefault(course.CampusId ?? course.campusId, 1),
    intakeDate: toDateTime(course.IntakeDate ?? course.intakeDate),
    startDate: toDateTime(course.StartDate ?? course.startDate ?? course.IntakeDate ?? course.intakeDate),
    finishDate: toDateTime(course.FinishDate ?? course.finishDate),
    elicoS_NumOfWeeks: toNumberOrDefault(course.ELICOS_NumOfWeeks ?? course.elicoS_NumOfWeeks, 0),
    tuitionFee: toNumberOrDefault(course.TuitionFee ?? course.tuitionFee, 0),
    upfrontFee: toNumberOrDefault(course.UpfrontFee ?? course.upfrontFee, 0),
    enrolmentFee: toNumberOrDefault(course.EnrolmentFee ?? course.enrolmentFee, 0),
    materialFee: toNumberOrDefault(course.MaterialFee ?? course.materialFee, 0),
    specialCondition: ensureNonEmptyString(course.SpecialCondition ?? course.specialCondition, 'N/A'),
    applicationRequest: ensureNonEmptyString(course.ApplicationRequest ?? course.applicationRequest, 'N/A'),
    creditTransferRequest: ensureNonEmptyString(course.CreditTransferRequest ?? course.creditTransferRequest, 'N/A'),
    studyReason: normalizeStudyReason(complianceAndOtherInfo.StudyReason || course.StudyReason || course.studyReason || '11')
  }));
};

const looksLikeCricosOfferPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return false;
  return Boolean(
    payload.ComplianceAndOtherInfo ||
    payload.AppliedCourses ||
    payload.Addresses ||
    payload.Email ||
    payload.DoB
  );
};

const toMeshedOfferPayload = (rawPayload, fallbackAgentId = 1) => {
  if (!rawPayload || typeof rawPayload !== 'object') {
    return {};
  }

  if (!looksLikeCricosOfferPayload(rawPayload)) {
    return rawPayload;
  }

  const complianceAndOtherInfo = rawPayload.ComplianceAndOtherInfo || {};
  const marketing = rawPayload.Leads_MarketingCampaign || {};

  const studentOrigin = normalizeStudentOrigin(rawPayload.StudentOrigin);
  const usi = (complianceAndOtherInfo.USI || '').toString().trim();
  const middleName = (rawPayload.MiddleName || '').toString().trim() || 'N/A';
  const nickName = (rawPayload.PreferredName || '').toString().trim() || (rawPayload.FirstName || '').toString().trim() || 'N/A';
  const countryOfBirth = complianceAndOtherInfo.CountryBirth || '';
  const cityOfBirth = (rawPayload.Birthplace || '').toString().trim() || countryOfBirth || 'Unknown';
  const nationality = complianceAndOtherInfo.Nationality || '';
  const personalEmail = rawPayload.Email || '';
  const primarySpokenLanguage = complianceAndOtherInfo.FirstLanguage || 'English';
  const residentialType = complianceAndOtherInfo.VisaType || (studentOrigin === 'Resident Student' ? 'Australian Citizen' : 'Student Visa');
  const howWellEnglishSpeak = normalizeHowWellEnglishSpeak(complianceAndOtherInfo.HowWellEngSpeak);
  const currentEmploymentStatus = normalizeCurrentEmploymentStatus(complianceAndOtherInfo.CurrentEmployStatus);
  const visaNumber = (complianceAndOtherInfo.VisaNumber || '').toString().trim();
  const visaExpiredDate = toDateOnly(complianceAndOtherInfo.VisaExpiryDate);
  const includeVisa = Boolean(visaNumber && visaExpiredDate);

  const meshedPayload = {
    OfferAddresses: mapOfferAddresses(rawPayload.Addresses || []),
    OfferAppliedCourses: mapOfferAppliedCourses(rawPayload.AppliedCourses || [], complianceAndOtherInfo, fallbackAgentId),
    Title: rawPayload.Title || '',
    FirstName: rawPayload.FirstName || '',
    MiddleName: middleName,
    LastName: rawPayload.LastName || '',
    NickName: nickName,
    Gender: rawPayload.Gender || '',
    DateOfBirth: toDateOnly(rawPayload.DoB),
    PersonalEmail: personalEmail,
    StudentOrigin: studentOrigin,
    CityOfBirth: cityOfBirth,
    CountryOfBirth: countryOfBirth,
    Nationality: nationality,
    PassportNumber: complianceAndOtherInfo.PassportNumber || '',
    PassportExpiredDate: toDateOnly(complianceAndOtherInfo.PassportExpiryDate),
    ResidentialType: residentialType,
    PrimarySpokenLanguage: primarySpokenLanguage,
    HowWellEnglishSpeak: howWellEnglishSpeak,
    CurrentEmploymentStatus: currentEmploymentStatus,
    IsAboriginal: Boolean(complianceAndOtherInfo.IsAboriginal),
    IsTorresStraitIslander: Boolean(complianceAndOtherInfo.IsTorresStraitIslander),
    LeadSource: marketing.LeadSource || '',
    KnowFrom: marketing.KnowFrom || ''
  };

  if (usi) {
    meshedPayload.USI = usi;
  }

  if (includeVisa) {
    meshedPayload.VisaNumber = visaNumber;
    meshedPayload.VisaExpiredDate = visaExpiredDate;
  }

  return meshedPayload;
};

const extractToken = (tokenResponse) => {
  if (!tokenResponse) return '';
  if (typeof tokenResponse === 'string') return tokenResponse;

  const candidates = [
    tokenResponse.access_token,
    tokenResponse.token,
    tokenResponse.jwtToken,
    tokenResponse.jwt,
    tokenResponse.bearerToken,
    tokenResponse?.data?.access_token,
    tokenResponse?.data?.token
  ];

  return candidates.find((value) => typeof value === 'string' && value.trim()) || '';
};

const parseAsJsonOrText = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
};

const safeJsonParse = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const isMeaningfulValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

const formatValuePreview = (value) => {
  if (value === null || value === undefined) return '(empty)';
  if (typeof value === 'string') return value.trim() === '' ? '(empty string)' : value;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);

  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
};

const flattenNonEmptyFields = (value, prefix = '') => {
  const fields = [];

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const path = prefix ? `${prefix}[${index}]` : `[${index}]`;
      fields.push(...flattenNonEmptyFields(item, path));
    });
    return fields;
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, childValue]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      fields.push(...flattenNonEmptyFields(childValue, path));
    });
    return fields;
  }

  if (!isMeaningfulValue(value)) {
    return fields;
  }

  fields.push({
    path: prefix || '(root)',
    value: formatValuePreview(value)
  });

  return fields;
};

const splitPathTokens = (path) => {
  if (!path || typeof path !== 'string') return [];

  const tokens = [];
  const tokenPattern = /([^[.\]]+)|\[(.*?)\]/g;
  let match;

  while ((match = tokenPattern.exec(path)) !== null) {
    const rawToken = (match[1] ?? match[2] ?? '').trim();
    if (!rawToken) continue;

    const unquotedToken = rawToken.replace(/^["']|["']$/g, '');
    if (/^\d+$/.test(unquotedToken)) {
      tokens.push({ type: 'index', value: Number(unquotedToken) });
    } else {
      tokens.push({ type: 'key', value: unquotedToken });
    }
  }

  return tokens;
};

const getCaseInsensitiveKey = (obj, targetKey) => {
  if (!obj || typeof obj !== 'object') return null;
  if (Object.prototype.hasOwnProperty.call(obj, targetKey)) return targetKey;

  const target = targetKey.toLowerCase();
  return Object.keys(obj).find((key) => key.toLowerCase() === target) || null;
};

const resolveValueByFieldPath = (payload, fieldPath) => {
  const tokens = splitPathTokens(fieldPath);
  if (tokens.length === 0) {
    return { exists: false, value: undefined };
  }

  let current = payload;
  for (const token of tokens) {
    if (Array.isArray(current)) {
      if (token.type === 'index') {
        if (token.value < 0 || token.value >= current.length) {
          return { exists: false, value: undefined };
        }
        current = current[token.value];
        continue;
      }

      // Support API error names like OfferCustomFields.[Field Name]
      const namedItem = current.find((item) => {
        if (!item || typeof item !== 'object') return false;
        const nameValue = item.name ?? item.documentName ?? item.fieldName;
        return (
          typeof nameValue === 'string' &&
          nameValue.toLowerCase() === token.value.toLowerCase()
        );
      });

      if (!namedItem) {
        return { exists: false, value: undefined };
      }

      current = namedItem;
      continue;
    }

    if (!current || typeof current !== 'object') {
      return { exists: false, value: undefined };
    }

    const matchedKey = token.type === 'key' ? getCaseInsensitiveKey(current, token.value) : null;
    if (!matchedKey) {
      return { exists: false, value: undefined };
    }

    current = current[matchedKey];
  }

  return { exists: true, value: current };
};

const isApiBusinessFailure = (responseData) => {
  if (!responseData || responseData.type !== 'api') return false;
  if (responseData.success === false) return true;

  if (
    responseData.data &&
    typeof responseData.data === 'object' &&
    responseData.data.isSuccess === false
  ) {
    return true;
  }

  return false;
};

const buildApiErrorAnalysis = (responseData) => {
  const parsedRequestBody = safeJsonParse(responseData?.requestBody) || {};
  const submittedFields = flattenNonEmptyFields(parsedRequestBody).slice(0, 500);

  const errorItemsFromApi = Array.isArray(responseData?.data?.data)
    ? responseData.data.data
    : [];

  const analyzedItems = errorItemsFromApi.map((item, index) => {
    const field = typeof item?.name === 'string' ? item.name : `UnknownField#${index + 1}`;
    const message = typeof item?.value === 'string' ? item.value : 'Validation failed';

    const resolved = resolveValueByFieldPath(parsedRequestBody, field);
    const hasMeaningfulValue = resolved.exists && isMeaningfulValue(resolved.value);

    return {
      field,
      message,
      existsInRequest: resolved.exists,
      hasMeaningfulValue,
      valuePreview: resolved.exists ? formatValuePreview(resolved.value) : '(not found in request body)'
    };
  });

  const existingButFailed = analyzedItems.filter((item) => item.hasMeaningfulValue);
  const missingOrEmpty = analyzedItems.filter((item) => !item.hasMeaningfulValue);

  return {
    submittedFields,
    totalSubmittedFields: submittedFields.length,
    totalValidationItems: analyzedItems.length,
    existingButFailed,
    missingOrEmpty
  };
};

const getAccessToken = async () => {
  if (!API_BASE_URL || !API_USERNAME || !API_PASSWORD) {
    throw new Error('Meshed API credentials are not fully configured');
  }

  const baseUrl = getNormalizedBaseUrl();
  const tokenUrl = `${baseUrl}/token`;

  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userName: API_USERNAME,
      password: API_PASSWORD
    })
  });

  const parsedTokenResponse = await parseAsJsonOrText(tokenResponse);

  if (!tokenResponse.ok) {
    throw new Error(`Failed to get token (${tokenResponse.status}): ${typeof parsedTokenResponse === 'string' ? parsedTokenResponse : JSON.stringify(parsedTokenResponse)}`);
  }

  const token = extractToken(parsedTokenResponse);
  if (!token) {
    throw new Error('Token response does not include a recognizable token field');
  }

  return {
    token,
    raw: parsedTokenResponse,
    tokenUrl
  };
};

const appendFormDataValue = (formData, key, value) => {
  if (value === null || value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      appendFormDataValue(formData, `${key}[${index}]`, item);
    });
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([childKey, childValue]) => {
      appendFormDataValue(formData, `${key}.${childKey}`, childValue);
    });
    return;
  }

  formData.append(key, String(value));
};

const MeshedApiTester = ({ isOpen, onClose, getCurrentJsonPreview }) => {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_ENDPOINTS[0].id);
  const [method, setMethod] = useState(PRESET_ENDPOINTS[0].method);
  const [apiEndpoint, setApiEndpoint] = useState(PRESET_ENDPOINTS[0].path);
  const [queryParams, setQueryParams] = useState(PRESET_ENDPOINTS[0].query || '');
  const [bodyType, setBodyType] = useState(PRESET_ENDPOINTS[0].bodyType || 'json');
  const [requestBody, setRequestBody] = useState(PRESET_ENDPOINTS[0].body || '');
  const [isTesting, setIsTesting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [showResponse, setShowResponse] = useState(false);
  const [errorAnalysis, setErrorAnalysis] = useState(null);
  const [showErrorAnalysisModal, setShowErrorAnalysisModal] = useState(false);

  if (!isOpen) return null;

  const getLiveFormPayload = () => {
    if (typeof getCurrentJsonPreview !== 'function') {
      return null;
    }

    try {
      const preview = getCurrentJsonPreview();
      if (!preview?.jsonData) {
        return null;
      }

      return {
        bodyString: JSON.stringify(preview.jsonData, null, 2),
        validation: preview.validation || null
      };
    } catch (error) {
      return null;
    }
  };

  const getDefaultBodyForPreset = (preset) => {
    if (preset?.id === 'offer-submit') {
      return getLiveFormPayload()?.bodyString || preset.body || DEFAULT_OFFER_BODY_TEMPLATE;
    }

    return preset?.body || '';
  };

  const handlePresetChange = (presetId) => {
    setSelectedPreset(presetId);

    const preset = PRESET_ENDPOINTS.find((item) => item.id === presetId);
    if (!preset) return;

    setMethod(preset.method);
    setApiEndpoint(preset.path);
    setQueryParams(preset.query || '');
    setBodyType(preset.bodyType || 'json');
    setRequestBody(getDefaultBodyForPreset(preset));
  };

  const handleTestToken = async () => {
    setIsTesting(true);
    setApiResponse(null);

    try {
      toast.loading('Testing Meshed token...', { id: 'meshed-api-test' });
      const tokenResult = await getAccessToken();

      const responseData = {
        success: true,
        type: 'token',
        tokenUrl: tokenResult.tokenUrl,
        tokenPreview: `${tokenResult.token.substring(0, 16)}...`,
        timestamp: new Date().toISOString(),
        rawResponse: tokenResult.raw
      };

      setApiResponse(responseData);
      setShowResponse(true);
      toast.success('Meshed token retrieved successfully', { id: 'meshed-api-test' });
    } catch (error) {
      const responseData = {
        success: false,
        type: 'token',
        error: error.message,
        timestamp: new Date().toISOString()
      };

      setApiResponse(responseData);
      setShowResponse(true);
      toast.error(`Token test failed: ${error.message}`, { id: 'meshed-api-test' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleLoadCurrentFormJson = () => {
    const livePayload = getLiveFormPayload();
    if (!livePayload?.bodyString) {
      toast.error('Current form JSON is not available');
      return;
    }

    setRequestBody(livePayload.bodyString);

    if (livePayload.validation?.isValid === false) {
      const errorCount = livePayload.validation.errors?.length || 0;
      toast(`Loaded current form JSON with ${errorCount} validation warning(s).`, {
        id: 'meshed-api-load-body'
      });
    } else {
      toast.success('Loaded current form JSON into request body', {
        id: 'meshed-api-load-body'
      });
    }
  };

  const handleTestApi = async () => {
    setIsTesting(true);
    setApiResponse(null);
    setErrorAnalysis(null);
    setShowErrorAnalysisModal(false);

    try {
      toast.loading(`Testing Meshed API: ${method} ${apiEndpoint}`, { id: 'meshed-api-test' });

      if (!API_USERNAME || !API_PASSWORD || !API_BASE_URL) {
        throw new Error('Meshed API env vars are missing. Please check REACT_APP_MESHED_API_ENDPOINT/USERNAME/PASSWORD.');
      }

      const tokenResult = await getAccessToken();
      const baseUrl = getNormalizedBaseUrl();

      let fullUrl = `${baseUrl}/${apiEndpoint.replace(/^\//, '')}`;
      if (queryParams.trim()) {
        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl += `${separator}${queryParams.trim()}`;
      }

      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${tokenResult.token}`
      };

      const options = {
        method,
        headers
      };
      let effectiveRequestBody = requestBody;
      const fallbackAgentId = 1;

      // Submit Offer should use current form payload by default.
      if (method === 'POST' && isOfferEndpoint(apiEndpoint)) {
        const livePayload = getLiveFormPayload();
        if (livePayload?.bodyString) {
          effectiveRequestBody = livePayload.bodyString;
          setRequestBody(livePayload.bodyString);
        }
      }

      if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
        let parsedBody = {};
        if (effectiveRequestBody.trim()) {
          try {
            parsedBody = JSON.parse(effectiveRequestBody);
          } catch (error) {
            throw new Error('Request body must be valid JSON object');
          }
        }

        if (method === 'POST' && isOfferEndpoint(apiEndpoint)) {
          parsedBody = toMeshedOfferPayload(parsedBody, fallbackAgentId);
          effectiveRequestBody = JSON.stringify(parsedBody, null, 2);
          setRequestBody(effectiveRequestBody);
        }

        if (bodyType === 'json') {
          headers['Content-Type'] = 'application/json';
          options.body = JSON.stringify(parsedBody);
        } else {
          const formData = new FormData();
          Object.entries(parsedBody).forEach(([key, value]) => appendFormDataValue(formData, key, value));
          options.body = formData;
        }
      }

      const response = await fetch(fullUrl, options);
      const parsedResponse = await parseAsJsonOrText(response);

      const responseData = {
        success: response.ok,
        type: 'api',
        method,
        endpoint: apiEndpoint,
        queryParams,
        requestBody: method === 'GET' ? null : (effectiveRequestBody || null),
        bodyType: method === 'GET' ? null : bodyType,
        status: response.status,
        statusText: response.statusText,
        url: fullUrl,
        timestamp: new Date().toISOString(),
        responseHeaders: Object.fromEntries(response.headers.entries()),
        transformedForMeshedOffer: method === 'POST' && isOfferEndpoint(apiEndpoint),
        data: parsedResponse
      };

      setApiResponse(responseData);
      setShowResponse(true);

      if (isApiBusinessFailure(responseData)) {
        const analysis = buildApiErrorAnalysis(responseData);
        setErrorAnalysis(analysis);
        setShowErrorAnalysisModal(true);
      }

      if (response.ok) {
        toast.success(`API call succeeded (${response.status})`, { id: 'meshed-api-test' });
      } else {
        toast.error(`API call failed (${response.status})`, { id: 'meshed-api-test' });
      }
    } catch (error) {
      const responseData = {
        success: false,
        type: 'api',
        method,
        endpoint: apiEndpoint,
        queryParams,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      setApiResponse(responseData);
      setShowResponse(true);
      setErrorAnalysis(buildApiErrorAnalysis(responseData));
      setShowErrorAnalysisModal(true);
      toast.error(`Meshed API test failed: ${error.message}`, { id: 'meshed-api-test' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[92vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Meshed API Tester</h2>
              <p className="text-sm text-gray-500 mt-1">
                Docs:{' '}
                <a
                  href="https://apisandbox.meshed.online/api-docs/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  apisandbox.meshed.online/api-docs
                </a>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              x
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preset endpoint
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PRESET_ENDPOINTS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTTP method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API path
              </label>
              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Example: api/Intake"
              />
              <p className="text-xs text-gray-500 mt-1">
                Base URL: {getNormalizedBaseUrl() || '(not configured)'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query params (optional)
              </label>
              <input
                type="text"
                value={queryParams}
                onChange={(e) => setQueryParams(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Example: courseid=CPC50220&publish=true&pageSize=50"
              />
            </div>

            {method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request body type
                  </label>
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    className="w-full md:w-72 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="json">application/json</option>
                    <option value="form">multipart/form-data</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request body
                  </label>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder='{"key":"value"}'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For multipart mode, provide a JSON object. Arrays/objects will be stringified before submit.
                  </p>
                  {method === 'POST' && isOfferEndpoint(apiEndpoint) && (
                    <div className="mt-3 p-3 border border-teal-200 bg-teal-50 rounded-lg">
                      <p className="text-xs text-teal-800 mb-2">
                        Submit Offer will use current form data and auto-convert it to Meshed Offer format.
                      </p>
                      <button
                        type="button"
                        onClick={handleLoadCurrentFormJson}
                        className="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-xs font-medium"
                      >
                        Load Current Form JSON
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleTestToken}
                disabled={isTesting}
                className="w-full bg-slate-700 text-white py-3 px-6 rounded-lg hover:bg-slate-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isTesting ? 'Testing...' : 'Test Token'}
              </button>

              <button
                onClick={handleTestApi}
                disabled={isTesting || !apiEndpoint.trim()}
                className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isTesting ? 'Testing...' : 'Test API'}
              </button>
            </div>

            {showResponse && apiResponse && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Response</h3>
                <div className="mb-3 text-sm">
                  <span className="font-medium">Result:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${apiResponse.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {apiResponse.success ? 'Success' : 'Failed'}
                  </span>
                  <span className="ml-4 text-gray-500">{apiResponse.timestamp}</span>
                  {apiResponse.type === 'api' && apiResponse.data && typeof apiResponse.data === 'object' && (
                    <span className={`ml-4 px-2 py-1 rounded text-xs ${apiResponse.data.isSuccess === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      Business: {apiResponse.data.isSuccess === false ? 'Failed' : 'Success'}
                    </span>
                  )}
                </div>

                {errorAnalysis && (
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={() => setShowErrorAnalysisModal(true)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs font-medium"
                    >
                      View Error Details
                    </button>
                  </div>
                )}

                <div className="bg-gray-900 text-green-300 p-4 rounded-md overflow-auto max-h-[45vh]">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showErrorAnalysisModal && errorAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">API Error Details</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Existing data and missing/unwritten data extracted from request body and API validation results.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowErrorAnalysisModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                x
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[76vh] space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border bg-red-50 border-red-200">
                  <p className="text-sm text-red-700 font-medium">Missing or Empty</p>
                  <p className="text-2xl text-red-800 font-semibold">{errorAnalysis.missingOrEmpty.length}</p>
                </div>
                <div className="p-3 rounded-lg border bg-yellow-50 border-yellow-200">
                  <p className="text-sm text-yellow-700 font-medium">Existing but Invalid</p>
                  <p className="text-2xl text-yellow-800 font-semibold">{errorAnalysis.existingButFailed.length}</p>
                </div>
                <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">Submitted Fields</p>
                  <p className="text-2xl text-blue-800 font-semibold">{errorAnalysis.totalSubmittedFields}</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-red-50 border-b">
                  <h4 className="text-sm font-semibold text-red-800">Unwritten or Empty Data</h4>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {errorAnalysis.missingOrEmpty.length === 0 ? (
                    <p className="p-4 text-sm text-gray-600">No missing or empty fields detected from current validation list.</p>
                  ) : (
                    errorAnalysis.missingOrEmpty.map((item, index) => (
                      <div key={`missing-${index}`} className="p-3 border-b last:border-b-0">
                        <p className="text-sm font-medium text-gray-900">{item.field}</p>
                        <p className="text-xs text-red-700 mt-1">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-yellow-50 border-b">
                  <h4 className="text-sm font-semibold text-yellow-800">Existing Data but Validation Failed</h4>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {errorAnalysis.existingButFailed.length === 0 ? (
                    <p className="p-4 text-sm text-gray-600">No existing-but-invalid fields in current validation list.</p>
                  ) : (
                    errorAnalysis.existingButFailed.map((item, index) => (
                      <div key={`invalid-${index}`} className="p-3 border-b last:border-b-0">
                        <p className="text-sm font-medium text-gray-900">{item.field}</p>
                        <p className="text-xs text-gray-700 mt-1">Submitted value: <span className="font-mono">{item.valuePreview}</span></p>
                        <p className="text-xs text-yellow-700 mt-1">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-blue-50 border-b">
                  <h4 className="text-sm font-semibold text-blue-800">Existing Submitted Data</h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {errorAnalysis.submittedFields.length === 0 ? (
                    <p className="p-4 text-sm text-gray-600">No submitted field values found.</p>
                  ) : (
                    errorAnalysis.submittedFields.map((field, index) => (
                      <div key={`submitted-${index}`} className="p-3 border-b last:border-b-0">
                        <p className="text-xs font-medium text-gray-900">{field.path}</p>
                        <p className="text-xs text-gray-700 mt-1 font-mono break-all">{field.value}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowErrorAnalysisModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeshedApiTester;
