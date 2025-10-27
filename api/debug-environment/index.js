module.exports = async function (context, req) {
  try {
    context.log('=== AZURE ENVIRONMENT DIAGNOSTIC ===');

    const diagnostics = {
      timestamp: new Date().toISOString(),
      azure: {
        region: process.env.REGION_NAME || 'unknown',
        functionName: context.executionContext.functionName,
        functionDirectory: context.executionContext.functionDirectory,
        invocationId: context.executionContext.invocationId,
        runtime: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch
        }
      },
      network: {},
      errors: []
    };

    // Test 1: Get public IP address
    try {
      context.log('Testing public IP detection...');
      const ipResponse = await fetch('https://api.ipify.org?format=json', {
        timeout: 10000
      });
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        diagnostics.network.publicIP = ipData.ip;
        context.log(`Public IP: ${ipData.ip}`);
      }
    } catch (error) {
      diagnostics.errors.push(`IP detection failed: ${error.message}`);
    }

    // Test 2: Get geographic location info
    try {
      if (diagnostics.network.publicIP) {
        context.log('Testing geographic location...');
        const geoResponse = await fetch(`http://ip-api.com/json/${diagnostics.network.publicIP}`, {
          timeout: 10000
        });
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          diagnostics.network.location = {
            country: geoData.country,
            region: geoData.regionName,
            city: geoData.city,
            isp: geoData.isp,
            org: geoData.org,
            timezone: geoData.timezone,
            lat: geoData.lat,
            lon: geoData.lon
          };
          context.log(`Location: ${geoData.city}, ${geoData.regionName}, ${geoData.country}`);
          context.log(`ISP: ${geoData.isp}`);
        }
      }
    } catch (error) {
      diagnostics.errors.push(`Geo detection failed: ${error.message}`);
    }

    // Test 3: Check TLS/HTTP capabilities
    try {
      context.log('Testing TLS capabilities...');
      const tlsResponse = await fetch('https://www.howsmyssl.com/a/check', {
        timeout: 10000
      });
      if (tlsResponse.ok) {
        const tlsData = await tlsResponse.json();
        diagnostics.network.tls = {
          version: tlsData.tls_version,
          cipherSuite: tlsData.cipher_suite,
          rating: tlsData.rating,
          isInsecure: tlsData.insecure_cipher_suites?.length > 0
        };
        context.log(`TLS Version: ${tlsData.tls_version}`);
      }
    } catch (error) {
      diagnostics.errors.push(`TLS detection failed: ${error.message}`);
    }

    // Test 4: Check if IP is in known cloud provider ranges
    try {
      context.log('Testing cloud provider detection...');
      const cloudResponse = await fetch(`https://ipinfo.io/${diagnostics.network.publicIP}/json`, {
        timeout: 10000
      });
      if (cloudResponse.ok) {
        const cloudData = await cloudResponse.json();
        diagnostics.network.provider = {
          org: cloudData.org,
          hostname: cloudData.hostname,
          isHosting: cloudData.org?.toLowerCase().includes('microsoft') ||
                     cloudData.org?.toLowerCase().includes('azure') ||
                     cloudData.hostname?.toLowerCase().includes('azure')
        };
        context.log(`Provider Org: ${cloudData.org}`);
        context.log(`Is Azure/Cloud: ${diagnostics.network.provider.isHosting}`);
      }
    } catch (error) {
      diagnostics.errors.push(`Cloud detection failed: ${error.message}`);
    }

    // Test 5: Compare with target website
    try {
      context.log('Testing target website accessibility...');
      const targetUrl = 'https://origininstitute.rtomanager.com.au/Publics/PublicsPages/AgentListByCountry.aspx';

      // Test different request methods
      const tests = [
        { method: 'HEAD', name: 'HEAD Request' },
        { method: 'GET', name: 'GET Request' }
      ];

      diagnostics.network.targetTests = [];

      for (const test of tests) {
        try {
          const startTime = Date.now();
          const response = await fetch(targetUrl, {
            method: test.method,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
          });

          const duration = Date.now() - startTime;

          diagnostics.network.targetTests.push({
            method: test.method,
            status: response.status,
            statusText: response.statusText,
            duration: duration,
            success: response.ok,
            headers: {
              server: response.headers.get('server'),
              cfRay: response.headers.get('cf-ray'), // Cloudflare detection
              'x-powered-by': response.headers.get('x-powered-by')
            }
          });

          context.log(`${test.name}: ${response.status} (${duration}ms)`);

        } catch (error) {
          diagnostics.network.targetTests.push({
            method: test.method,
            success: false,
            error: error.message,
            errorType: error.name
          });
          context.log(`${test.name} failed: ${error.message}`);
        }
      }
    } catch (error) {
      diagnostics.errors.push(`Target website test failed: ${error.message}`);
    }

    // Environment analysis
    diagnostics.analysis = {
      isCloudEnvironment: diagnostics.network.provider?.isHosting || false,
      potentialBlocking: [],
      recommendations: []
    };

    // Analyze potential blocking reasons
    if (diagnostics.network.provider?.isHosting) {
      diagnostics.analysis.potentialBlocking.push('IP identified as cloud/hosting provider');
    }

    if (diagnostics.network.location?.country !== 'Australia') {
      diagnostics.analysis.potentialBlocking.push(`Request from ${diagnostics.network.location?.country} instead of Australia`);
    }

    const headTest = diagnostics.network.targetTests?.find(t => t.method === 'HEAD');
    const getTest = diagnostics.network.targetTests?.find(t => t.method === 'GET');

    if (headTest?.success && !getTest?.success) {
      diagnostics.analysis.potentialBlocking.push('HEAD requests allowed but GET requests blocked (anti-scraping)');
    }

    if (diagnostics.network.targetTests?.some(t => t.headers?.cfRay)) {
      diagnostics.analysis.potentialBlocking.push('Cloudflare protection detected');
    }

    // Generate recommendations
    if (diagnostics.analysis.potentialBlocking.length > 0) {
      diagnostics.analysis.recommendations = [
        'Consider using residential proxy services',
        'Implement more sophisticated browser simulation',
        'Add geographic IP routing if possible',
        'Contact website owner for API access',
        'Use alternative data sources'
      ];
    }

    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: diagnostics
    };

  } catch (error) {
    context.log.error('Environment diagnostic failed:', error);
    context.res = {
      status: 500,
      body: { error: error.message }
    };
  }
};