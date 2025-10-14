const fs = require('fs/promises');
const path = require('path');
const http = require('http');
const https = require('https');

// 临时注释掉cheerio来确定是否是依赖问题
// const cheerio = require('cheerio');

const UPSTREAM = 'https://origininstitute.rtomanager.com.au/Publics/PublicsPages/AgentListByCountry.aspx';

const DEFAULT_AGENTS = [
  {
    name: 'Origin Institute',
    contact: 'Admissions Office',
    country: 'Australia',
    address: 'Level 4, 696 Bourke Street, Melbourne VIC 3000',
    emails: ['info@origininstitute.edu.au'],
    phones: ['+61 3 9642 0012'],
    websites: ['https://origininstitute.edu.au']
  }
];

// Use native fetch for now to isolate the problem

module.exports = async function (context, req) {
  try {
    context.log('=== SIMPLIFIED DIAGNOSTIC VERSION ===');
    context.log('Node.js version:', process.version);
    context.log('Platform:', process.platform);
    context.log('Architecture:', process.arch);
    context.log('Function app directory:', __dirname);

    context.log('Environment variables:', {
      LOCAL_EXAMPLE_HTML: process.env.LOCAL_EXAMPLE_HTML,
      NODE_ENV: process.env.NODE_ENV,
      AZURE_FUNCTIONS_ENVIRONMENT: process.env.AZURE_FUNCTIONS_ENVIRONMENT,
      FUNCTIONS_WORKER_RUNTIME: process.env.FUNCTIONS_WORKER_RUNTIME,
      WEBSITE_NODE_DEFAULT_VERSION: process.env.WEBSITE_NODE_DEFAULT_VERSION
    });

    context.log('API availability check:', {
      hasFetch: typeof fetch !== 'undefined',
      hasGlobalFetch: typeof global.fetch !== 'undefined'
    });

    // 直接返回诊断信息而不进行复杂的HTML解析
    const responseBody = {
      status: 'simplified_diagnostic_mode',
      message: '这是简化的诊断版本，用于确定根本问题',
      timestamp: new Date().toISOString(),
      diagnostics: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        functionDirectory: __dirname,
        fetchAvailable: typeof fetch !== 'undefined',
        environment: {
          LOCAL_EXAMPLE_HTML: process.env.LOCAL_EXAMPLE_HTML,
          NODE_ENV: process.env.NODE_ENV,
          AZURE_FUNCTIONS_ENVIRONMENT: process.env.AZURE_FUNCTIONS_ENVIRONMENT,
          FUNCTIONS_WORKER_RUNTIME: process.env.FUNCTIONS_WORKER_RUNTIME
        }
      },
      // 返回默认agents以保持兼容性
      total: DEFAULT_AGENTS.length,
      items: DEFAULT_AGENTS
    };

    context.log('=== RETURNING SIMPLIFIED RESPONSE ===');
    context.log('Response preview:', {
      status: responseBody.status,
      total: responseBody.total,
      nodeVersion: responseBody.diagnostics.nodeVersion
    });

    context.res = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(responseBody)
    };

    context.log('=== SIMPLIFIED FUNCTION COMPLETED ===');
  } catch (err) {
    const errorDetails = {
      name: err.name || 'Unknown',
      message: err.message || 'Unknown error',
      stack: err.stack,
      code: err.code,
      timestamp: new Date().toISOString(),
      upstream: UPSTREAM,
      localMode: process.env.LOCAL_EXAMPLE_HTML === 'true',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        LOCAL_EXAMPLE_HTML: process.env.LOCAL_EXAMPLE_HTML
      }
    };

    context.log.error('=== FUNCTION ERROR ===', errorDetails);

    // Return structured error response instead of letting function crash
    context.res = {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        source: 'error',
        updatedAt: new Date().toISOString(),
        error: {
          name: err.name || 'UnknownError',
          message: err.message || 'Function failed',
          code: err.code,
          details: `简化诊断版本函数错误: ${err.message}`,
          timestamp: errorDetails.timestamp
        },
        // Still provide fallback data
        total: DEFAULT_AGENTS.length,
        items: DEFAULT_AGENTS
      })
    };
  }
};
