import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Eraser,
  ExternalLink,
  Play,
  RefreshCw,
  RotateCcw,
  ServerCog,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import logoImage from '../image/Origin_logo.jpg';
import {
  MESHED_API_CATEGORIES,
  MESHED_TEST_FIELDS,
  MESHED_TEST_VALUE_DEFAULTS
} from './apiConnectivity/meshedApiCatalog';

const CRICOS_BASE_URL = process.env.REACT_APP_CRICOS_API_BASE_URL;
const CRICOS_USERNAME = process.env.REACT_APP_CRICOS_API_USERNAME;
const CRICOS_PASSWORD = process.env.REACT_APP_CRICOS_API_PASSWORD;
const MESHED_BASE_URL = process.env.REACT_APP_MESHED_API_ENDPOINT;
const MESHED_USERNAME = process.env.REACT_APP_MESHED_API_USERNAME;
const MESHED_PASSWORD = process.env.REACT_APP_MESHED_API_PASSWORD;
const LOCAL_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const TABS = {
  BRIDGE: 'bridge',
  MESHED: 'meshed'
};

const PREVIEW_ARRAY_ITEM_LIMIT = 25;
const INTAKE_OPERATION_ID = 'intake-get-api-intake';
const INTAKE_DATE_QUERY_PARAM = 'intakedate';

const copyTextToClipboard = async (text) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard is not available.');
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error('Copy command failed.');
  }
};

const TEST_SCENARIOS = [
  {
    id: 'agent-list',
    title: 'Agent List',
    source: {
      label: 'Current app source',
      provider: 'local',
      baseUrl: LOCAL_API_BASE_URL,
      path: 'agent-list',
      query: 'refresh=true'
    },
    target: {
      label: 'Meshed Agent',
      provider: 'meshed',
      baseUrl: MESHED_BASE_URL,
      method: 'GET',
      path: 'api/Agent',
      query: 'pageIndex=1&pageSize=5'
    }
  },
  {
    id: 'employment-status',
    title: 'Employment Status',
    source: {
      label: 'CRICOS',
      provider: 'cricos',
      baseUrl: CRICOS_BASE_URL,
      path: 'api/Classification/EmploymentStatuses'
    },
    target: {
      label: 'Meshed',
      provider: 'meshed',
      baseUrl: MESHED_BASE_URL,
      method: 'GET',
      path: 'api/Classification/CurrentEmploymentStatus'
    }
  },
  {
    id: 'education-level',
    title: 'Education Level',
    source: {
      label: 'CRICOS',
      provider: 'cricos',
      baseUrl: CRICOS_BASE_URL,
      path: 'api/Classification/QualificationLevels'
    },
    target: {
      label: 'Meshed',
      provider: 'meshed',
      baseUrl: MESHED_BASE_URL,
      method: 'GET',
      path: 'api/Classification/EducationLevel'
    }
  },
  {
    id: 'visa-type',
    title: 'Visa Type',
    source: {
      label: 'CRICOS',
      provider: 'cricos',
      baseUrl: CRICOS_BASE_URL,
      path: 'api/Classification/VisaStatuses',
      query: 'Origin=OverseasStudent'
    },
    target: {
      label: 'Meshed',
      provider: 'meshed',
      baseUrl: MESHED_BASE_URL,
      method: 'GET',
      path: 'api/Classification/ResidentialVisaType'
    }
  },
  {
    id: 'course-list',
    title: 'Course List',
    source: {
      label: 'CRICOS',
      provider: 'cricos',
      baseUrl: CRICOS_BASE_URL,
      path: 'api/V1/Courses',
      query: 'active=true&courseid=CPC50220'
    },
    target: {
      label: 'Meshed',
      provider: 'meshed',
      baseUrl: MESHED_BASE_URL,
      method: 'GET',
      path: 'api/Course',
      query: 'active=true'
    }
  },
  {
    id: 'intake-list',
    title: 'Intake List',
    source: {
      label: 'CRICOS',
      provider: 'cricos',
      baseUrl: CRICOS_BASE_URL,
      path: 'api/V1/CourseIntakes',
      query: 'courseid=CPC50220&publish=true'
    },
    target: {
      label: 'Meshed',
      provider: 'meshed',
      baseUrl: MESHED_BASE_URL,
      method: 'GET',
      path: 'api/Intake',
      query: 'pageIndex=1&pageSize=5&publish=true&courseid=CPC50220'
    }
  }
];

const SENSITIVE_KEY_PATTERN = /token|password|authorization|secret|signature|sig|credential/i;

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);
const normalizeBaseUrl = (baseUrl = '') => baseUrl.trim().replace(/\/+$/, '');
const normalizePath = (path = '') => path.trim().replace(/^\/+/, '');
const normalizeQuery = (query = '') => String(query ?? '').trim().replace(/^\?+/, '');

const buildUrl = (baseUrl, path, query = '') => {
  const base = normalizeBaseUrl(baseUrl);
  const cleanPath = normalizePath(path);
  const cleanQuery = normalizeQuery(query);
  const url = `${base}/${cleanPath}`;
  return cleanQuery ? `${url}${url.includes('?') ? '&' : '?'}${cleanQuery}` : url;
};

const formatPathWithQuery = (path, query = '') => {
  const cleanQuery = normalizeQuery(query);
  return `${path}${cleanQuery ? `?${cleanQuery}` : ''}`;
};

const getTodayDateInputValue = () => {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const formatDateInputValueForMeshed = (dateInputValue = '') => {
  const match = dateInputValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateInputValue;

  const [, year, month, day] = match;
  return `${Number(day)}/${Number(month)}/${year}`;
};

const parseMeshedDateForDateInput = (value = '') => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return '';

  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const safeDecodeURIComponent = (value = '') => {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
};

const getQueryParameterValue = (query = '', parameterName) => {
  const lowerParameterName = parameterName.toLowerCase();
  const queryPart = normalizeQuery(query)
    .split('&')
    .filter(Boolean)
    .find((part) => part.split('=')[0].toLowerCase() === lowerParameterName);

  if (!queryPart) return '';

  const [, ...valueParts] = queryPart.split('=');
  return safeDecodeURIComponent(valueParts.join('='));
};

const setQueryParameterValue = (query = '', parameterName, nextValue = '') => {
  const lowerParameterName = parameterName.toLowerCase();
  const cleanValue = String(nextValue ?? '').trim();
  const queryParts = normalizeQuery(query)
    .split('&')
    .filter(Boolean)
    .filter((part) => part.split('=')[0].toLowerCase() !== lowerParameterName);

  if (cleanValue) {
    queryParts.push(`${parameterName}=${cleanValue}`);
  }

  return queryParts.join('&');
};

const withDefaultIntakeDateQuery = (operationId, query = '') => {
  if (operationId !== INTAKE_OPERATION_ID || getQueryParameterValue(query, INTAKE_DATE_QUERY_PARAM)) {
    return query;
  }

  return setQueryParameterValue(
    query,
    INTAKE_DATE_QUERY_PARAM,
    formatDateInputValueForMeshed(getTodayDateInputValue())
  );
};

const parseResponseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
};

const sanitizeForPreview = (value, depth = 0) => {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    return value.length > 500 ? `${value.slice(0, 500)}...` : value;
  }
  if (typeof value !== 'object') return value;
  if (depth > 4) return '[Object]';

  if (Array.isArray(value)) {
    const previewItems = value
      .slice(0, PREVIEW_ARRAY_ITEM_LIMIT)
      .map((item) => sanitizeForPreview(item, depth + 1));

    if (value.length > PREVIEW_ARRAY_ITEM_LIMIT) {
      previewItems.push(`[${value.length - PREVIEW_ARRAY_ITEM_LIMIT} more items omitted]`);
    }

    return previewItems;
  }

  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 20)
      .map(([key, childValue]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key)
          ? '[redacted]'
          : sanitizeForPreview(childValue, depth + 1)
      ])
  );
};

const extractItems = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.Data)) return data.Data;
  return null;
};

const summarizeData = (data) => {
  const items = extractItems(data);
  const totalCount = data?.paging?.totalCount ?? data?.total ?? data?.Total ?? items?.length ?? null;

  return {
    totalCount,
    returnedCount: items ? items.length : null,
    preview: sanitizeForPreview(items || data)
  };
};

const extractMeshedToken = (tokenResponse) => {
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

const getStatusDetails = (response, data) => {
  const businessFailed =
    data &&
    typeof data === 'object' &&
    (data.isSuccess === false || data.IsSuccess === false || data?.paging?.totalCount === -1);

  return {
    success: response.ok && !businessFailed,
    businessFailed
  };
};

const requestJson = async (url, options = {}) => {
  const start = performance.now();
  const response = await fetch(url, options);
  const data = await parseResponseBody(response);
  const durationMs = Math.round(performance.now() - start);

  return {
    response,
    data,
    durationMs
  };
};

const createFailedResult = (config, error, authSummary = null) => ({
  success: false,
  status: 'N/A',
  durationMs: null,
  url: buildUrl(config.baseUrl || '', config.path || '', config.query || ''),
  error: error?.message || String(error),
  auth: authSummary
});

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const isWriteOperation = (operation) =>
  operation?.kind === 'write' || WRITE_METHODS.has((operation?.method || '').toUpperCase());

const resolveTemplateString = (template = '', values = {}) =>
  template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const value = values[key];
    return value === null || value === undefined ? '' : String(value);
  });

const resolveTemplateData = (value, values = {}) => {
  if (Array.isArray(value)) {
    return value.map((item) => resolveTemplateData(item, values));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, childValue]) => [key, resolveTemplateData(childValue, values)])
    );
  }

  if (typeof value !== 'string') {
    return value;
  }

  const exactMatch = value.match(/^\{\{([^}]+)\}\}$/);
  if (exactMatch) {
    const resolved = values[exactMatch[1]];
    return resolved === undefined ? '' : resolved;
  }

  return resolveTemplateString(value, values);
};

const appendFormDataValue = (formData, key, value) => {
  if (value === null || value === undefined || value === '') {
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

const buildOperationRuntimeConfig = (
  operation,
  testValues,
  operationBodies,
  operationQueryOverrides = {}
) => {
  const defaultQueryTemplate = withDefaultIntakeDateQuery(
    operation.id,
    operation.queryTemplate || operation.query || ''
  );
  const hasQueryOverride = hasOwn(operationQueryOverrides, operation.id);
  const editableQuery = hasQueryOverride
    ? operationQueryOverrides[operation.id]
    : resolveTemplateString(defaultQueryTemplate, testValues);
  const runtimeQueryTemplate = hasQueryOverride ? editableQuery : defaultQueryTemplate;

  return {
    ...operation,
    baseUrl: MESHED_BASE_URL,
    path: resolveTemplateString(operation.pathTemplate || operation.path || '', testValues),
    query: normalizeQuery(resolveTemplateString(runtimeQueryTemplate, testValues)),
    queryValue: editableQuery,
    defaultQuery: normalizeQuery(resolveTemplateString(defaultQueryTemplate, testValues)),
    hasQueryOverride,
    bodyText:
      operationBodies?.[operation.id] ??
      (operation.bodyTemplate ? JSON.stringify(operation.bodyTemplate, null, 2) : ''),
    bodyType: operation.bodyType || 'json',
    testValues
  };
};

const buildInitialOperationBodies = (operations) =>
  Object.fromEntries(
    operations
      .filter((operation) => operation.bodyTemplate)
      .map((operation) => [operation.id, JSON.stringify(operation.bodyTemplate, null, 2)])
  );

const getBridgeEndpointKey = (scenarioId, side) => `${scenarioId}:${side}`;

const resolveBridgeEndpointConfig = (scenario, side, bridgeQueryOverrides = {}) => {
  const config = scenario[side];
  const key = getBridgeEndpointKey(scenario.id, side);
  const hasQueryOverride = hasOwn(bridgeQueryOverrides, key);
  const defaultQuery = normalizeQuery(config.query || '');
  const queryValue = hasQueryOverride ? bridgeQueryOverrides[key] : defaultQuery;

  return {
    ...config,
    query: normalizeQuery(queryValue),
    queryValue,
    defaultQuery,
    hasQueryOverride
  };
};

const getCricosToken = async () => {
  if (!CRICOS_BASE_URL || !CRICOS_USERNAME || !CRICOS_PASSWORD) {
    throw new Error('CRICOS environment variables are missing.');
  }

  const tokenUrl = buildUrl(CRICOS_BASE_URL, 'token');
  const body = new URLSearchParams({
    grant_type: 'password',
    username: CRICOS_USERNAME,
    password: CRICOS_PASSWORD
  });
  const { response, data, durationMs } = await requestJson(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  if (!response.ok || !data?.access_token) {
    throw new Error(`CRICOS token failed (${response.status}).`);
  }

  return {
    token: data.access_token,
    summary: {
      status: response.status,
      durationMs,
      tokenPreview: `${data.access_token.slice(0, 12)}...`
    }
  };
};

const getMeshedToken = async () => {
  if (!MESHED_BASE_URL || !MESHED_USERNAME || !MESHED_PASSWORD) {
    throw new Error('Meshed environment variables are missing.');
  }

  const tokenUrl = buildUrl(MESHED_BASE_URL, 'token');
  const { response, data, durationMs } = await requestJson(tokenUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userName: MESHED_USERNAME,
      password: MESHED_PASSWORD
    })
  });
  const token = extractMeshedToken(data);

  if (!response.ok || !token) {
    throw new Error(`Meshed token failed (${response.status}).`);
  }

  return {
    token,
    raw: data,
    summary: {
      status: response.status,
      durationMs,
      tokenPreview: `${token.slice(0, 12)}...`
    }
  };
};

const runLocalEndpoint = async (config) => {
  if (!config.baseUrl) {
    throw new Error('Local API base URL is missing.');
  }

  const url = buildUrl(config.baseUrl, config.path, config.query || '');
  const { response, data, durationMs } = await requestJson(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });
  const statusDetails = getStatusDetails(response, data);

  return {
    success: statusDetails.success,
    status: response.status,
    durationMs,
    url,
    dataSummary: summarizeData(data)
  };
};

const runCricosEndpoint = async (config) => {
  const tokenResult = await getCricosToken();
  const url = buildUrl(config.baseUrl, config.path, config.query || '');
  const { response, data, durationMs } = await requestJson(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/json',
      Authorization: `Bearer ${tokenResult.token}`
    }
  });
  const statusDetails = getStatusDetails(response, data);

  return {
    success: statusDetails.success,
    status: response.status,
    durationMs,
    url,
    auth: tokenResult.summary,
    dataSummary: summarizeData(data)
  };
};

const runMeshedRequestWithToken = async (config, tokenResult) => {
  const url = buildUrl(config.baseUrl, config.path, config.query || '');
  const method = (config.method || 'GET').toUpperCase();
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${tokenResult.token}`
  };
  const options = {
    method,
    headers
  };

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    let parsedBody = {};
    if (config.bodyText?.trim()) {
      try {
        parsedBody = JSON.parse(config.bodyText);
      } catch (error) {
        throw new Error('Request body must be valid JSON.');
      }
    }

    const resolvedBody = resolveTemplateData(parsedBody, config.testValues || {});

    if (config.bodyType === 'form') {
      const formData = new FormData();
      Object.entries(resolvedBody || {}).forEach(([key, value]) => {
        appendFormDataValue(formData, key, value);
      });
      options.body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(resolvedBody || {});
    }
  }

  const { response, data, durationMs } = await requestJson(url, options);
  const statusDetails = getStatusDetails(response, data);

  return {
    success: statusDetails.success,
    status: response.status,
    durationMs,
    url,
    auth: tokenResult.summary,
    dataSummary: summarizeData(data)
  };
};

const runMeshedAuthOperation = async (config) => {
  const tokenResult = await getMeshedToken();

  return {
    success: true,
    status: tokenResult.summary.status,
    durationMs: tokenResult.summary.durationMs,
    url: buildUrl(config.baseUrl, config.path, config.query || ''),
    auth: tokenResult.summary,
    dataSummary: {
      totalCount: null,
      returnedCount: null,
      preview: sanitizeForPreview(tokenResult.raw)
    }
  };
};

const runMeshedOperation = async (config, tokenResult = null) => {
  try {
    if (config.provider === 'meshed-auth') {
      return await runMeshedAuthOperation(config);
    }

    const effectiveTokenResult = tokenResult || (await getMeshedToken());
    return await runMeshedRequestWithToken(config, effectiveTokenResult);
  } catch (error) {
    return createFailedResult(config, error);
  }
};

const runEndpoint = async (config) => {
  try {
    if (config.provider === 'local') {
      return await runLocalEndpoint(config);
    }

    if (config.provider === 'cricos') {
      return await runCricosEndpoint(config);
    }

    if (config.provider === 'meshed' || config.provider === 'meshed-auth') {
      return await runMeshedOperation(config);
    }

    throw new Error(`Unsupported provider: ${config.provider}`);
  } catch (error) {
    return createFailedResult(config, error);
  }
};

const StatusBadge = ({ result, loading }) => {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
        <RefreshCw size={13} className="animate-spin" />
        Running
      </span>
    );
  }

  if (!result) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
        <Activity size={13} />
        Not run
      </span>
    );
  }

  if (result.success) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
        <CheckCircle2 size={13} />
        Connected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
      <XCircle size={13} />
      Failed
    </span>
  );
};

const ResponseDetails = ({ result, showAuth = true }) => {
  if (!result) return null;

  const preview = result.dataSummary?.preview;
  const previewText = preview ? JSON.stringify(preview, null, 2) : '';

  const handleCopyPreview = async () => {
    try {
      await copyTextToClipboard(previewText);
      toast.success('Response preview copied');
    } catch (error) {
      toast.error('Failed to copy response preview');
    }
  };

  return (
    <div className="space-y-3 text-left">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md bg-gray-50 p-2">
          <p className="text-gray-500">HTTP</p>
          <p className="mt-1 font-semibold text-gray-900">{result.status}</p>
        </div>
        <div className="rounded-md bg-gray-50 p-2">
          <p className="text-gray-500">Duration</p>
          <p className="mt-1 font-semibold text-gray-900">
            {result.durationMs === null ? 'N/A' : `${result.durationMs} ms`}
          </p>
        </div>
        <div className="rounded-md bg-gray-50 p-2">
          <p className="text-gray-500">Returned</p>
          <p className="mt-1 font-semibold text-gray-900">
            {result.dataSummary?.returnedCount ?? 'N/A'}
          </p>
        </div>
        <div className="rounded-md bg-gray-50 p-2">
          <p className="text-gray-500">Total</p>
          <p className="mt-1 font-semibold text-gray-900">
            {result.dataSummary?.totalCount ?? 'N/A'}
          </p>
        </div>
      </div>

      {showAuth && result.auth && (
        <div className="rounded-md border border-emerald-100 bg-emerald-50 p-2 text-xs text-emerald-800">
          Token OK: HTTP {result.auth.status}, {result.auth.durationMs} ms, {result.auth.tokenPreview}
        </div>
      )}

      {result.error && (
        <div className="rounded-md border border-red-100 bg-red-50 p-2 text-xs text-red-700">
          {result.error}
        </div>
      )}

      {preview && (
        <details className="relative rounded-md border border-gray-200 bg-gray-50">
          <summary className="cursor-pointer px-3 py-2 pr-24 text-xs font-medium text-gray-700">
            Response preview
          </summary>
          <button
            type="button"
            onClick={handleCopyPreview}
            title="Copy response preview"
            className="absolute right-2 top-1.5 inline-flex items-center justify-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
          >
            <Copy size={13} />
            Copy
          </button>
          <pre className="max-h-64 overflow-auto border-t border-gray-200 p-3 text-left text-xs text-gray-800">
            {previewText}
          </pre>
        </details>
      )}
    </div>
  );
};

const QueryParameterEditor = ({
  value = '',
  defaultValue = '',
  hasOverride = false,
  disabled = false,
  onChange,
  onReset
}) => {
  const currentValue = value ?? '';

  return (
    <div className="mb-3 rounded-md border border-gray-100 bg-gray-50 p-3 text-left">
      <label className="block">
        <span className="text-xs font-medium text-gray-600">Query parameters</span>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={currentValue}
            onChange={(event) => onChange(event.target.value.replace(/^\?+/, ''))}
            disabled={disabled}
            placeholder="No query parameters"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-xs text-gray-900 outline-none transition-colors focus:border-teal-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={disabled || !currentValue}
              title="Clear query parameters"
              className="inline-flex items-center justify-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <Eraser size={14} />
              Clear
            </button>
            <button
              type="button"
              onClick={onReset}
              disabled={disabled || !hasOverride}
              title="Reset query parameters to default"
              className="inline-flex items-center justify-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <RotateCcw size={14} />
              Default
            </button>
          </div>
        </div>
      </label>
      {hasOverride && (
        <p className="mt-2 break-all text-xs text-gray-500">
          Default: <span className="font-mono">{defaultValue || '(none)'}</span>
        </p>
      )}
    </div>
  );
};

const EndpointResult = ({
  config,
  result,
  loading,
  disabled,
  onQueryChange,
  onQueryReset
}) => (
  <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 text-left">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{config.label}</p>
        <p className="mt-1 break-all font-mono text-xs text-gray-500">
          {formatPathWithQuery(config.path, config.query)}
        </p>
      </div>
      <StatusBadge result={result} loading={loading} />
    </div>

    {onQueryChange && onQueryReset && (
      <QueryParameterEditor
        value={config.queryValue ?? config.query ?? ''}
        defaultValue={config.defaultQuery ?? ''}
        hasOverride={config.hasQueryOverride}
        disabled={disabled}
        onChange={onQueryChange}
        onReset={onQueryReset}
      />
    )}

    <ResponseDetails result={result} />
  </div>
);

const ConfigCard = ({ label, value, configured }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      {configured ? (
        <CheckCircle2 size={17} className="flex-shrink-0 text-green-600" />
      ) : (
        <AlertCircle size={17} className="flex-shrink-0 text-red-600" />
      )}
    </div>
    <p className="mt-2 break-all font-mono text-xs text-gray-800">{value || '(not configured)'}</p>
  </div>
);

const TabButton = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-teal-600 text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    {children}
  </button>
);

const MethodBadge = ({ method }) => {
  const classes =
    method === 'POST'
      ? 'bg-purple-50 text-purple-700'
      : method === 'PATCH'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-slate-100 text-slate-700';

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold ${classes}`}>
      {method}
    </span>
  );
};

const TestValueField = ({ field, value, onChange }) => (
  <label className="block">
    <span className="text-xs font-medium text-gray-600">{field.label}</span>
    <input
      type={field.type}
      value={value}
      onChange={onChange}
      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition-colors focus:border-teal-500"
    />
  </label>
);

const IntakeDateFilter = ({ queryValue = '', disabled = false, onChange }) => {
  const intakeDate = parseMeshedDateForDateInput(
    getQueryParameterValue(queryValue, INTAKE_DATE_QUERY_PARAM)
  );

  return (
    <div className="mb-3 rounded-md border border-teal-100 bg-teal-50 p-3 text-left">
      <label className="block">
        <span className="text-xs font-medium text-teal-800">Intake date</span>
        <input
          type="date"
          value={intakeDate}
          onChange={(event) =>
            onChange(
              setQueryParameterValue(
                queryValue,
                INTAKE_DATE_QUERY_PARAM,
                formatDateInputValueForMeshed(event.target.value)
              )
            )
          }
          disabled={disabled}
          className="mt-1 w-full rounded-md border border-teal-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-teal-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 sm:max-w-56"
        />
      </label>
    </div>
  );
};

const MeshedOperationCard = ({
  operation,
  result,
  loading,
  disabled,
  onRun,
  onQueryChange,
  onQueryReset,
  bodyValue,
  onBodyChange
}) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 text-left">
    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <MethodBadge method={operation.method} />
          <p className="text-sm font-semibold text-gray-900">{operation.label}</p>
          {isWriteOperation(operation) && (
            <span className="rounded-md bg-orange-50 px-2 py-1 text-[11px] font-medium text-orange-700">
              Writes data
            </span>
          )}
        </div>
        <p className="mt-2 break-all font-mono text-xs text-gray-500">
          {formatPathWithQuery(operation.path, operation.query)}
        </p>
        {operation.bodyType && isWriteOperation(operation) && (
          <p className="mt-2 text-xs text-gray-500">Request body: {operation.bodyType === 'form' ? 'multipart/form-data' : 'application/json'}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge result={result} loading={loading} />
        <button
          type="button"
          onClick={onRun}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
          Run
        </button>
      </div>
    </div>

    {operation.id === INTAKE_OPERATION_ID && (
      <IntakeDateFilter
        queryValue={operation.queryValue ?? operation.query ?? ''}
        disabled={disabled}
        onChange={onQueryChange}
      />
    )}

    <QueryParameterEditor
      value={operation.queryValue ?? operation.query ?? ''}
      defaultValue={operation.defaultQuery ?? ''}
      hasOverride={operation.hasQueryOverride}
      disabled={disabled}
      onChange={onQueryChange}
      onReset={onQueryReset}
    />

    {isWriteOperation(operation) && (
      <details className="mb-3 rounded-md border border-gray-200 bg-gray-50">
        <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-gray-700">
          Request body editor
        </summary>
        <div className="border-t border-gray-200 p-3">
          <textarea
            value={bodyValue}
            onChange={(event) => onBodyChange(event.target.value)}
            spellCheck={false}
            className="min-h-[220px] w-full rounded-md border border-gray-300 bg-white p-3 font-mono text-xs text-gray-900 outline-none transition-colors focus:border-teal-500"
          />
          <p className="mt-2 text-xs text-gray-500">
            Supports placeholders like <code>{'{{agentId}}'}</code>, <code>{'{{courseId}}'}</code>,{' '}
            <code>{'{{offerId}}'}</code>, <code>{'{{studentId}}'}</code>.
          </p>
        </div>
      </details>
    )}

    <ResponseDetails result={result} />
  </div>
);

const ApiConnectivityPage = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState(TABS.BRIDGE);
  const [bridgeResults, setBridgeResults] = useState({});
  const [meshedResults, setMeshedResults] = useState({});
  const [runningScenarioId, setRunningScenarioId] = useState(null);
  const [runningMeshedOperationId, setRunningMeshedOperationId] = useState(null);
  const [runningMeshedCategoryId, setRunningMeshedCategoryId] = useState(null);
  const [isRunningBridgeAll, setIsRunningBridgeAll] = useState(false);
  const [isRunningMeshedAll, setIsRunningMeshedAll] = useState(false);
  const [includeWriteOperations, setIncludeWriteOperations] = useState(false);
  const [bridgeQueryOverrides, setBridgeQueryOverrides] = useState({});
  const [testValues, setTestValues] = useState(MESHED_TEST_VALUE_DEFAULTS);
  const [operationBodies, setOperationBodies] = useState(() =>
    buildInitialOperationBodies(MESHED_API_CATEGORIES.flatMap((category) => category.operations))
  );
  const [operationQueryOverrides, setOperationQueryOverrides] = useState({});
  const [meshedRunMeta, setMeshedRunMeta] = useState(null);
  const [openCategories, setOpenCategories] = useState(() =>
    Object.fromEntries(MESHED_API_CATEGORIES.map((category, index) => [category.id, index === 0]))
  );

  const resolvedBridgeScenarios = useMemo(
    () =>
      TEST_SCENARIOS.map((scenario) => ({
        ...scenario,
        source: resolveBridgeEndpointConfig(scenario, 'source', bridgeQueryOverrides),
        target: resolveBridgeEndpointConfig(scenario, 'target', bridgeQueryOverrides)
      })),
    [bridgeQueryOverrides]
  );
  const resolvedBridgeScenarioMap = useMemo(
    () => Object.fromEntries(resolvedBridgeScenarios.map((scenario) => [scenario.id, scenario])),
    [resolvedBridgeScenarios]
  );
  const allMeshedOperations = useMemo(
    () => MESHED_API_CATEGORIES.flatMap((category) => category.operations),
    []
  );
  const resolvedMeshedCategories = useMemo(
    () =>
      MESHED_API_CATEGORIES.map((category) => ({
        ...category,
        operations: category.operations.map((operation) =>
          buildOperationRuntimeConfig(operation, testValues, operationBodies, operationQueryOverrides)
        )
      })),
    [operationBodies, operationQueryOverrides, testValues]
  );
  const resolvedMeshedOperations = useMemo(
    () => resolvedMeshedCategories.flatMap((category) => category.operations),
    [resolvedMeshedCategories]
  );
  const resolvedMeshedOperationMap = useMemo(
    () => Object.fromEntries(resolvedMeshedOperations.map((operation) => [operation.id, operation])),
    [resolvedMeshedOperations]
  );

  const bridgeSummary = useMemo(() => {
    const completed = TEST_SCENARIOS.map((scenario) => bridgeResults[scenario.id]).filter(Boolean);
    const passed = completed.filter((result) => result.source?.success && result.target?.success).length;
    const failed = completed.filter((result) => result.source?.success === false || result.target?.success === false).length;

    return {
      completed: completed.length,
      passed,
      failed
    };
  }, [bridgeResults]);

  const meshedSummary = useMemo(() => {
    const completed = allMeshedOperations.map((operation) => meshedResults[operation.id]).filter(Boolean);
    const passed = completed.filter((result) => result.success).length;
    const failed = completed.filter((result) => result.success === false).length;

    return {
      completed: completed.length,
      passed,
      failed
    };
  }, [allMeshedOperations, meshedResults]);

  const activeSummary = activeTab === TABS.BRIDGE ? bridgeSummary : meshedSummary;
  const isAnyBusy =
    isRunningBridgeAll ||
    isRunningMeshedAll ||
    Boolean(runningScenarioId) ||
    Boolean(runningMeshedOperationId) ||
    Boolean(runningMeshedCategoryId);

  const toggleCategory = (categoryId) => {
    setOpenCategories((current) => ({
      ...current,
      [categoryId]: !current[categoryId]
    }));
  };

  const updateTestValue = (field, nextValue) => {
    setTestValues((current) => ({
      ...current,
      [field.key]:
        field.type === 'number'
          ? nextValue === ''
            ? ''
            : Number(nextValue)
          : nextValue
    }));
  };

  const updateOperationBody = (operationId, nextValue) => {
    setOperationBodies((current) => ({
      ...current,
      [operationId]: nextValue
    }));
  };

  const updateBridgeQuery = (scenarioId, side, nextValue) => {
    const key = getBridgeEndpointKey(scenarioId, side);
    setBridgeQueryOverrides((current) => ({
      ...current,
      [key]: nextValue
    }));
  };

  const resetBridgeQuery = (scenarioId, side) => {
    const key = getBridgeEndpointKey(scenarioId, side);
    setBridgeQueryOverrides((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const updateOperationQuery = (operationId, nextValue) => {
    setOperationQueryOverrides((current) => ({
      ...current,
      [operationId]: nextValue
    }));
  };

  const resetOperationQuery = (operationId) => {
    setOperationQueryOverrides((current) => {
      const next = { ...current };
      delete next[operationId];
      return next;
    });
  };

  const getCategoryOperationsToRun = (category) =>
    includeWriteOperations
      ? category.operations
      : category.operations.filter((operation) => !isWriteOperation(operation));

  const runScenario = async (scenarioId) => {
    const scenario = resolvedBridgeScenarioMap[scenarioId];
    if (!scenario) return;

    setRunningScenarioId(scenarioId);
    setBridgeResults((current) => ({
      ...current,
      [scenarioId]: {
        ...current[scenarioId],
        loading: true
      }
    }));

    const [source, target] = await Promise.all([
      runEndpoint(scenario.source),
      runEndpoint(scenario.target)
    ]);

    setBridgeResults((current) => ({
      ...current,
      [scenarioId]: {
        source,
        target,
        checkedAt: new Date().toISOString(),
        loading: false
      }
    }));
    setRunningScenarioId(null);
  };

  const runAllBridgeScenarios = async () => {
    setIsRunningBridgeAll(true);
    toast.loading('Running bridge checks...', { id: 'bridge-connectivity' });

    for (const scenario of resolvedBridgeScenarios) {
      await runScenario(scenario.id);
    }

    setIsRunningBridgeAll(false);
    toast.success('Bridge checks completed', { id: 'bridge-connectivity' });
  };

  const runMeshedOperationById = async (
    operationId,
    { skipWriteConfirm = false, tokenResult = null } = {}
  ) => {
    const operation = resolvedMeshedOperationMap[operationId];
    if (!operation) return;

    if (
      isWriteOperation(operation) &&
      !skipWriteConfirm &&
      !window.confirm(`Run write operation ${operation.method} ${operation.path}?`)
    ) {
      return;
    }

    setRunningMeshedOperationId(operationId);
    setMeshedResults((current) => ({
      ...current,
      [operationId]: {
        ...current[operationId],
        loading: true
      }
    }));

    try {
      const result = await runMeshedOperation(operation, tokenResult);
      setMeshedResults((current) => ({
        ...current,
        [operationId]: {
          ...result,
          checkedAt: new Date().toISOString()
        }
      }));
      setMeshedRunMeta({
        checkedAt: new Date().toISOString(),
        auth: result.auth || null,
        lastOperation: operation.label
      });
    } finally {
      setRunningMeshedOperationId(null);
    }
  };

  const runMeshedCategory = async (categoryId, { skipWriteConfirm = false } = {}) => {
    const category = resolvedMeshedCategories.find((item) => item.id === categoryId);
    if (!category) return;

    const operationsToRun = getCategoryOperationsToRun(category);
    if (!operationsToRun.length) {
      toast('Batch run is currently limited to read/auth endpoints. Enable write operations to include POST/PATCH.', {
        id: `meshed-category-${categoryId}`
      });
      return;
    }

    const includesWrites = operationsToRun.some((operation) => isWriteOperation(operation));
    if (
      includesWrites &&
      !skipWriteConfirm &&
      !window.confirm(
        `Run ${operationsToRun.length} operations in ${category.label}? This includes write requests.`
      )
    ) {
      return;
    }

    setRunningMeshedCategoryId(categoryId);
    setOpenCategories((current) => ({
      ...current,
      [categoryId]: true
    }));

    if (operationsToRun.every((operation) => operation.provider === 'meshed' && !isWriteOperation(operation))) {
      setMeshedResults((current) => ({
        ...current,
        ...Object.fromEntries(
          operationsToRun.map((operation) => [
            operation.id,
            {
              ...current[operation.id],
              loading: true
            }
          ])
        )
      }));

      try {
        const tokenResult = await getMeshedToken();
        const entries = await Promise.all(
          operationsToRun.map(async (operation) => {
            try {
              const result = await runMeshedOperation(operation, tokenResult);
              return [
                operation.id,
                {
                  ...result,
                  checkedAt: new Date().toISOString()
                }
              ];
            } catch (error) {
              return [
                operation.id,
                {
                  ...createFailedResult(operation, error, tokenResult.summary),
                  checkedAt: new Date().toISOString()
                }
              ];
            }
          })
        );

        setMeshedResults((current) => ({
          ...current,
          ...Object.fromEntries(entries)
        }));
        setMeshedRunMeta({
          checkedAt: new Date().toISOString(),
          auth: tokenResult.summary,
          lastOperation: `${category.label} category`
        });
      } catch (error) {
        setMeshedResults((current) => ({
          ...current,
          ...Object.fromEntries(
            operationsToRun.map((operation) => [
              operation.id,
              {
                ...createFailedResult(operation, error),
                checkedAt: new Date().toISOString()
              }
            ])
          )
        }));
        setMeshedRunMeta({
          checkedAt: new Date().toISOString(),
          error: error.message,
          lastOperation: `${category.label} category`
        });
      } finally {
        setRunningMeshedCategoryId(null);
      }

      return;
    }

    for (const operation of operationsToRun) {
      await runMeshedOperationById(operation.id, {
        skipWriteConfirm: true
      });
    }

    setRunningMeshedCategoryId(null);
  };

  const runAllMeshedOperations = async () => {
    const categoriesToRun = resolvedMeshedCategories.filter(
      (category) => getCategoryOperationsToRun(category).length > 0
    );
    const writeCount = categoriesToRun.reduce(
      (count, category) =>
        count + getCategoryOperationsToRun(category).filter((operation) => isWriteOperation(operation)).length,
      0
    );

    if (
      writeCount > 0 &&
      !window.confirm(`Run all Meshed categories including ${writeCount} write operations?`)
    ) {
      return;
    }

    setIsRunningMeshedAll(true);
    toast.loading('Running Meshed API explorer checks...', { id: 'meshed-explorer' });

    for (const category of categoriesToRun) {
      await runMeshedCategory(category.id, {
        skipWriteConfirm: true
      });
    }

    setIsRunningMeshedAll(false);
    toast.success('Meshed API explorer checks completed', { id: 'meshed-explorer' });
  };

  const handleRunAll = () => {
    if (activeTab === TABS.MESHED) {
      runAllMeshedOperations();
      return;
    }

    runAllBridgeScenarios();
  };

  return (
    <div className="min-h-screen bg-gray-100 text-left text-gray-900">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <ArrowLeft size={17} />
              Back
            </button>
            <img
              src={logoImage}
              alt="Origin Institute Logo"
              className="hidden h-10 w-auto object-contain sm:block"
            />
          </div>

          <button
            type="button"
            onClick={handleRunAll}
            disabled={isAnyBusy}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {(activeTab === TABS.BRIDGE && isRunningBridgeAll) ||
            (activeTab === TABS.MESHED && isRunningMeshedAll) ? (
              <RefreshCw size={17} className="animate-spin" />
            ) : (
              <Play size={17} />
            )}
            Run All
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                <ServerCog size={22} />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-normal text-gray-900 sm:text-3xl">
                  CRICOS to Meshed API Connectivity
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Development-only checks for bridge paths and Meshed API categories.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg border border-gray-200 bg-white p-3 text-center">
            <div className="min-w-20">
              <p className="text-xs text-gray-500">Run</p>
              <p className="text-xl font-semibold text-gray-900">{activeSummary.completed}</p>
            </div>
            <div className="min-w-20">
              <p className="text-xs text-gray-500">Passed</p>
              <p className="text-xl font-semibold text-green-700">{activeSummary.passed}</p>
            </div>
            <div className="min-w-20">
              <p className="text-xs text-gray-500">Failed</p>
              <p className="text-xl font-semibold text-red-700">{activeSummary.failed}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <ConfigCard
            label="CRICOS base URL"
            value={CRICOS_BASE_URL}
            configured={Boolean(CRICOS_BASE_URL && CRICOS_USERNAME && CRICOS_PASSWORD)}
          />
          <ConfigCard
            label="Meshed base URL"
            value={MESHED_BASE_URL}
            configured={Boolean(MESHED_BASE_URL && MESHED_USERNAME && MESHED_PASSWORD)}
          />
          <ConfigCard
            label="Local API base URL"
            value={LOCAL_API_BASE_URL}
            configured={Boolean(LOCAL_API_BASE_URL)}
          />
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-1">
          <div className="flex flex-wrap gap-1">
            <TabButton
              active={activeTab === TABS.BRIDGE}
              onClick={() => setActiveTab(TABS.BRIDGE)}
            >
              Bridge Checks
            </TabButton>
            <TabButton
              active={activeTab === TABS.MESHED}
              onClick={() => setActiveTab(TABS.MESHED)}
            >
              Meshed API Explorer
            </TabButton>
          </div>
        </div>

        {activeTab === TABS.BRIDGE ? (
          <>
            <div className="mb-6 flex flex-wrap gap-3">
              <a
                href="https://cricosapi.dotedu.com.au/Help"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                CRICOS Help
                <ExternalLink size={15} />
              </a>
              <a
                href="https://apisandbox.meshed.online/api-docs/index.html#tag/Agent/paths/~1api~1Agent/get"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Meshed Agent Docs
                <ExternalLink size={15} />
              </a>
            </div>

            <div className="space-y-4">
              {resolvedBridgeScenarios.map((scenario) => {
                const scenarioResult = bridgeResults[scenario.id];
                const isScenarioLoading = scenarioResult?.loading || runningScenarioId === scenario.id;

                return (
                  <section key={scenario.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{scenario.title}</h2>
                        {scenarioResult?.checkedAt && (
                          <p className="mt-1 text-xs text-gray-500">
                            Last checked: {new Date(scenarioResult.checkedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => runScenario(scenario.id)}
                        disabled={isAnyBusy}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        {isScenarioLoading ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
                        Run
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <EndpointResult
                        config={scenario.source}
                        result={scenarioResult?.source}
                        loading={isScenarioLoading}
                        disabled={isAnyBusy}
                        onQueryChange={(nextValue) => updateBridgeQuery(scenario.id, 'source', nextValue)}
                        onQueryReset={() => resetBridgeQuery(scenario.id, 'source')}
                      />
                      <EndpointResult
                        config={scenario.target}
                        result={scenarioResult?.target}
                        loading={isScenarioLoading}
                        disabled={isAnyBusy}
                        onQueryChange={(nextValue) => updateBridgeQuery(scenario.id, 'target', nextValue)}
                        onQueryReset={() => resetBridgeQuery(scenario.id, 'target')}
                      />
                    </div>
                  </section>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-3">
              <a
                href="https://apisandbox.meshed.online/api-docs/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Meshed API Docs
                <ExternalLink size={15} />
              </a>
              <a
                href="https://apisandbox.meshed.online/swagger/v1/swagger.json"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Swagger JSON
                <ExternalLink size={15} />
              </a>
            </div>

            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Meshed Category Explorer</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Official Meshed categories are expanded below. Every documented endpoint has its own test card.
                  </p>
                </div>
                {meshedRunMeta?.checkedAt && (
                  <p className="text-xs text-gray-500">
                    Last checked: {new Date(meshedRunMeta.checkedAt).toLocaleString()}
                  </p>
                )}
              </div>

              {meshedRunMeta?.auth && (
                <div className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-800">
                  Token OK: HTTP {meshedRunMeta.auth.status}, {meshedRunMeta.auth.durationMs} ms, {meshedRunMeta.auth.tokenPreview}
                </div>
              )}

              {meshedRunMeta?.error && (
                <div className="mt-4 rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                  {meshedRunMeta.error}
                </div>
              )}
            </div>

            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Test values</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Path, query, and request body placeholders resolve from these values.
                  </p>
                </div>
                <label className="inline-flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={includeWriteOperations}
                    onChange={(event) => setIncludeWriteOperations(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  Include write operations in batch runs
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {MESHED_TEST_FIELDS.map((field) => (
                  <TestValueField
                    key={field.key}
                    field={field}
                    value={testValues[field.key]}
                    onChange={(event) => updateTestValue(field, event.target.value)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {resolvedMeshedCategories.map((category) => {
                const isOpen = openCategories[category.id];
                const categoryResults = category.operations
                  .map((operation) => meshedResults[operation.id])
                  .filter(Boolean);
                const categoryPassed = categoryResults.filter((result) => result.success).length;
                const categoryFailed = categoryResults.filter((result) => result.success === false).length;
                const categoryWriteCount = category.operations.filter((operation) => isWriteOperation(operation)).length;
                const categoryLoading =
                  runningMeshedCategoryId === category.id ||
                  category.operations.some(
                    (operation) => runningMeshedOperationId === operation.id || meshedResults[operation.id]?.loading
                  );

                return (
                  <section key={category.id} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className="flex min-w-0 items-center gap-3 text-left"
                      >
                        {isOpen ? (
                          <ChevronDown size={18} className="flex-shrink-0 text-gray-500" />
                        ) : (
                          <ChevronRight size={18} className="flex-shrink-0 text-gray-500" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-gray-900">{category.label}</h3>
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                              {category.operations.length}
                            </span>
                            {categoryWriteCount > 0 && (
                              <span className="rounded-md bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
                                {categoryWriteCount} write
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Passed {categoryPassed} / Failed {categoryFailed}
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://apisandbox.meshed.online/api-docs/index.html#tag/${category.docTag}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          Docs
                          <ExternalLink size={14} />
                        </a>
                        <button
                          type="button"
                          onClick={() => runMeshedCategory(category.id)}
                          disabled={isAnyBusy}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          {categoryLoading ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
                          Run Category
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-2">
                        {category.operations.map((operation) => {
                          const result = meshedResults[operation.id];
                          const isOperationLoading =
                            runningMeshedOperationId === operation.id || result?.loading;

                          return (
                            <MeshedOperationCard
                              key={operation.id}
                              operation={operation}
                              result={result}
                              loading={isOperationLoading}
                              disabled={isAnyBusy}
                              onRun={() => runMeshedOperationById(operation.id)}
                              onQueryChange={(nextValue) => updateOperationQuery(operation.id, nextValue)}
                              onQueryReset={() => resetOperationQuery(operation.id)}
                              bodyValue={operationBodies[operation.id] || ''}
                              onBodyChange={(nextValue) => updateOperationBody(operation.id, nextValue)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ApiConnectivityPage;
