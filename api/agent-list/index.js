const fs = require('fs/promises');
const path = require('path');

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

// Helper function to extract text between tags using regex
function extractTextBetween(html, pattern) {
  const match = html.match(pattern);
  return match ? match[1].trim() : '';
}

// Helper function to extract href attribute
function extractHref(html, pattern) {
  const match = html.match(pattern);
  return match ? match[1] : '';
}

module.exports = async function (context, req) {
  try {
    context.log('=== ULTRA SIMPLE TEST VERSION ===');

    // Skip all complex processing, just return default agents
    const responseBody = {
      status: 'ultra_simple_test',
      message: 'Testing basic function execution without complex logic',
      timestamp: new Date().toISOString(),
      total: DEFAULT_AGENTS.length,
      items: DEFAULT_AGENTS,
      diagnostics: {
        testMode: true,
        nodeVersion: process.version,
        environment: {
          LOCAL_EXAMPLE_HTML: process.env.LOCAL_EXAMPLE_HTML,
          NODE_ENV: process.env.NODE_ENV
        }
      }
    };

    context.res = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(responseBody)
    };

    context.log('=== ULTRA SIMPLE TEST COMPLETED ===');
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
          details: `Ultra simple test - function error: ${err.message}`,
          timestamp: errorDetails.timestamp,
          testMode: true
        },
        // Still provide fallback data
        total: DEFAULT_AGENTS.length,
        items: DEFAULT_AGENTS
      })
    };
  }
};
