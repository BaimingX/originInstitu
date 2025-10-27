const UPSTREAM = 'https://origininstitute.rtomanager.com.au/Publics/PublicsPages/AgentListByCountry.aspx';

module.exports = async function (context, req) {
  try {
    context.log('=== NETWORK DEBUG STARTING ===');

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        nodeEnv: process.env.NODE_ENV,
        azureRegion: process.env.WEBSITE_REGION || 'unknown',
        functionAppName: process.env.WEBSITE_SITE_NAME || 'unknown'
      },
      targetUrl: UPSTREAM,
      tests: []
    };

    // Test 1: Basic DNS resolution
    context.log('Testing DNS resolution...');
    try {
      const dns = require('dns').promises;
      const hostname = 'origininstitute.rtomanager.com.au';
      const addresses = await dns.lookup(hostname);
      debugInfo.tests.push({
        name: 'DNS Resolution',
        status: 'success',
        result: addresses,
        message: `Resolved ${hostname} to ${addresses.address}`
      });
      context.log(`DNS OK: ${hostname} -> ${addresses.address}`);
    } catch (dnsError) {
      debugInfo.tests.push({
        name: 'DNS Resolution',
        status: 'failed',
        error: dnsError.message,
        code: dnsError.code
      });
      context.log.error('DNS failed:', dnsError.message);
    }

    // Test 2: Basic HTTP connectivity
    context.log('Testing basic HTTP connectivity...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds

      const startTime = Date.now();
      const response = await fetch(UPSTREAM, {
        method: 'HEAD', // Just get headers, not content
        signal: controller.signal,
        headers: {
          'User-Agent': 'Azure-Functions-Network-Test/1.0'
        }
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      debugInfo.tests.push({
        name: 'HTTP Connectivity (HEAD)',
        status: response.ok ? 'success' : 'failed',
        responseTime: `${responseTime}ms`,
        statusCode: response.status,
        statusText: response.statusText,
        headers: {
          'content-type': response.headers.get('content-type'),
          'content-length': response.headers.get('content-length'),
          'server': response.headers.get('server'),
          'x-powered-by': response.headers.get('x-powered-by'),
          'cache-control': response.headers.get('cache-control')
        }
      });

      context.log(`HTTP HEAD OK: ${response.status} in ${responseTime}ms`);
    } catch (httpError) {
      debugInfo.tests.push({
        name: 'HTTP Connectivity (HEAD)',
        status: 'failed',
        error: httpError.message,
        code: httpError.code,
        type: httpError.constructor.name
      });
      context.log.error('HTTP HEAD failed:', httpError.message);
    }

    // Test 3: Full GET request (limited content)
    context.log('Testing full GET request...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

      const startTime = Date.now();
      const response = await fetch(UPSTREAM, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          // Force uncompressed payload so Azure undici does not terminate the stream prematurely
          'Accept-Encoding': 'identity',
          'Cache-Control': 'no-cache'
        }
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const content = await response.text();
        const contentLength = content.length;
        const hasAgentList = content.includes('ctl00_Main_DataList2');
        const hasOriginInstitute = content.includes('Origin Institute');
        const hasAgentName = content.includes('lblAgentName');

        debugInfo.tests.push({
          name: 'Full GET Request',
          status: 'success',
          responseTime: `${responseTime}ms`,
          statusCode: response.status,
          contentLength: contentLength,
          contentAnalysis: {
            isHtml: content.includes('<html') || content.includes('<!DOCTYPE'),
            hasAgentList: hasAgentList,
            hasOriginInstitute: hasOriginInstitute,
            hasAgentNameElements: hasAgentName,
            firstNCharacters: content.substring(0, 200)
          }
        });

        context.log(`GET OK: ${response.status} in ${responseTime}ms, ${contentLength} chars`);
        context.log(`Content check: AgentList=${hasAgentList}, OriginInstitute=${hasOriginInstitute}`);
      } else {
        debugInfo.tests.push({
          name: 'Full GET Request',
          status: 'failed',
          responseTime: `${responseTime}ms`,
          statusCode: response.status,
          statusText: response.statusText
        });
      }
    } catch (getError) {
      debugInfo.tests.push({
        name: 'Full GET Request',
        status: 'failed',
        error: getError.message,
        code: getError.code,
        type: getError.constructor.name
      });
      context.log.error('GET failed:', getError.message);
    }

    // Test 4: Alternative URL test (try HTTPS vs HTTP, www vs non-www)
    context.log('Testing alternative URLs...');
    const alternativeUrls = [
      'http://origininstitute.rtomanager.com.au/Publics/PublicsPages/AgentListByCountry.aspx',
      'https://www.origininstitute.rtomanager.com.au/Publics/PublicsPages/AgentListByCountry.aspx'
    ];

    for (const altUrl of alternativeUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(altUrl, {
          method: 'HEAD',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        debugInfo.tests.push({
          name: `Alternative URL: ${altUrl}`,
          status: response.ok ? 'success' : 'failed',
          statusCode: response.status,
          statusText: response.statusText
        });
      } catch (altError) {
        debugInfo.tests.push({
          name: `Alternative URL: ${altUrl}`,
          status: 'failed',
          error: altError.message
        });
      }
    }

    // Summary
    const successfulTests = debugInfo.tests.filter(t => t.status === 'success').length;
    const totalTests = debugInfo.tests.length;

    debugInfo.summary = {
      totalTests: totalTests,
      successfulTests: successfulTests,
      failedTests: totalTests - successfulTests,
      overallStatus: successfulTests > 0 ? 'partial' : 'failed',
      recommendation: generateRecommendation(debugInfo.tests)
    };

    context.res = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(debugInfo, null, 2)
    };

    context.log('=== NETWORK DEBUG COMPLETED ===');
  } catch (err) {
    context.log.error('Debug function failed:', err);

    context.res = {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Debug function failed',
        message: err.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

function generateRecommendation(tests) {
  const dnsTest = tests.find(t => t.name === 'DNS Resolution');
  const headTest = tests.find(t => t.name.includes('HEAD'));
  const getTest = tests.find(t => t.name === 'Full GET Request');

  if (dnsTest && dnsTest.status === 'failed') {
    return 'DNS resolution failed. The domain may be blocked or unreachable from Azure.';
  }

  if (headTest && headTest.status === 'failed') {
    return 'HTTP connectivity failed. The server may be blocking Azure IPs or the service is down.';
  }

  if (getTest && getTest.status === 'failed') {
    return 'GET request failed. The server may have restrictions on full content requests.';
  }

  if (getTest && getTest.status === 'success' && !getTest.contentAnalysis?.hasAgentList) {
    return 'Content retrieved but does not contain expected agent list elements. The page structure may have changed.';
  }

  if (getTest && getTest.status === 'success' && getTest.contentAnalysis?.hasAgentList) {
    return 'All tests passed! The issue may be in the parsing logic or intermittent network problems.';
  }

  return 'Mixed results. Review individual test details for more information.';
}
