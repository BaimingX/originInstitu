const fs = require('fs/promises');
const path = require('path');
const http = require('http');
const https = require('https');
const cheerio = require('cheerio');

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
    context.log('=== Agent list function started ===');

    // Enhanced runtime diagnostics
    context.log('=== COMPREHENSIVE RUNTIME DIAGNOSTICS ===');
    context.log('Node.js version:', process.version);
    context.log('Platform:', process.platform);
    context.log('Architecture:', process.arch);
    context.log('Current working directory:', process.cwd());
    context.log('Function app directory:', __dirname);

    context.log('Environment variables:', {
      LOCAL_EXAMPLE_HTML: process.env.LOCAL_EXAMPLE_HTML,
      NODE_ENV: process.env.NODE_ENV,
      AZURE_FUNCTIONS_ENVIRONMENT: process.env.AZURE_FUNCTIONS_ENVIRONMENT,
      FUNCTIONS_WORKER_RUNTIME: process.env.FUNCTIONS_WORKER_RUNTIME,
      WEBSITE_NODE_DEFAULT_VERSION: process.env.WEBSITE_NODE_DEFAULT_VERSION
    });

    // Check for fetch API availability
    context.log('API availability check:', {
      hasFetch: typeof fetch !== 'undefined',
      hasGlobalFetch: typeof global.fetch !== 'undefined',
      hasCheerio: !!cheerio,
      cheerioVersion: cheerio.version || 'unknown'
    });

    // Try to load cheerio first to ensure it works
    try {
      const testHtml = '<div>test</div>';
      const test$ = cheerio.load(testHtml);
      const testText = test$('div').text();
      context.log('Cheerio test successful:', testText === 'test');
    } catch (cheerioError) {
      context.log.error('Cheerio test failed:', {
        name: cheerioError.name,
        message: cheerioError.message,
        stack: cheerioError.stack
      });
      throw new Error(`Cheerio initialization failed: ${cheerioError.message}`);
    }

    context.log('Fetching agent list from:', UPSTREAM);

    // 1) Load HTML: local example.html for dev, else upstream
    let html = null;
    if (process.env.LOCAL_EXAMPLE_HTML === 'true') {
      try {
        const localPath = path.resolve(__dirname, '../../example.html');
        html = await fs.readFile(localPath, 'utf8');
        context.log('Using local example.html for parsing');
      } catch (e) {
        context.log('Failed reading local example.html, fall back to upstream:', e && e.message);
      }
    }

    if (!html) {
      // Add cache busting for development or when refresh is requested
      const refresh = req.query?.refresh === 'true';
      const url = refresh ? `${UPSTREAM}?_cb=${Date.now()}` : UPSTREAM;

      context.log('Fetching from upstream:', url);

      try {
        context.log('About to fetch with basic options');

        // Try fetch API first, fallback to http/https modules
        if (typeof fetch !== 'undefined') {
          context.log('Using fetch API');
          const r = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          context.log('Fetch completed, status:', r.status);

          context.log('Fetch response:', {
            status: r.status,
            statusText: r.statusText,
            contentType: r.headers.get('content-type'),
            contentLength: r.headers.get('content-length')
          });

          if (!r.ok) {
            throw new Error(`HTTP ${r.status}: ${r.statusText}`);
          }

          html = await r.text();
          context.log('HTML fetched successfully with fetch API, length:', html.length);

        } else {
          context.log('Fetch API not available, using http/https modules');

          // Fallback to http/https modules
          html = await new Promise((resolve, reject) => {
            const client = url.startsWith('https:') ? https : http;
            const urlObj = new URL(url);

            const options = {
              hostname: urlObj.hostname,
              port: urlObj.port,
              path: urlObj.pathname + urlObj.search,
              method: 'GET',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            };

            context.log('Making HTTP request with options:', options);

            const req = client.request(options, (res) => {
              context.log('HTTP response status:', res.statusCode);
              context.log('HTTP response headers:', res.headers);

              if (res.statusCode < 200 || res.statusCode >= 300) {
                reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                return;
              }

              let data = '';
              res.on('data', chunk => data += chunk);
              res.on('end', () => {
                context.log('HTTP request completed, data length:', data.length);
                resolve(data);
              });
            });

            req.on('error', (error) => {
              context.log.error('HTTP request error:', error);
              reject(error);
            });

            req.setTimeout(30000, () => {
              context.log.error('HTTP request timeout');
              req.destroy();
              reject(new Error('Request timeout after 30 seconds'));
            });

            req.end();
          });

          context.log('HTML fetched successfully with http/https modules, length:', html.length);
        }

        if (refresh) {
          context.log('Cache busting applied for fresh data fetch');
        }

      } catch (fetchError) {
        context.log.error('Request failed:', {
          name: fetchError.name,
          message: fetchError.message,
          code: fetchError.code,
          url: url,
          fetchAvailable: typeof fetch !== 'undefined'
        });
        throw fetchError;
      }
    }

    // 2) Parse DOM using explicit structure present in the page
    context.log('=== HTML PARSING PHASE ===');
    context.log('HTML content preview (first 500 chars):', html.substring(0, 500));
    context.log('HTML content preview (last 500 chars):', html.substring(html.length - 500));

    let $;
    try {
      $ = cheerio.load(html);
      context.log('Cheerio load successful');
    } catch (cheerioError) {
      context.log.error('Failed to load HTML with cheerio:', {
        name: cheerioError.name,
        message: cheerioError.message,
        stack: cheerioError.stack
      });
      throw new Error(`HTML parsing failed: ${cheerioError.message}`);
    }

    const agents = [];

    // Check if the expected table structure exists
    const agentListTable = $('table.agent-list');
    const agentWrappers = $('table.agent-list div.agent-listwrap');

    context.log('DOM structure check:', {
      agentListTableFound: agentListTable.length,
      agentWrappersFound: agentWrappers.length,
      totalTableElements: $('table').length,
      totalDivElements: $('div').length
    });

    if (agentWrappers.length === 0) {
      context.log('WARNING: No agent wrappers found. HTML structure may have changed.');
      context.log('Available table classes:', $('table').map((i, el) => $(el).attr('class')).get());
      context.log('Available div classes sample (first 10):', $('div').slice(0, 10).map((i, el) => $(el).attr('class')).get());
    }

    $('table.agent-list div.agent-listwrap').each((i, el) => {
      const $el = $(el);

      context.log(`Processing agent ${i + 1}:`);

      const name = $el.find("div.agentname span[id*='lblAgentName']").text().trim();
      context.log(`  Name: "${name}"`);

      if (!name) {
        context.log(`  Skipping agent ${i + 1} - no name found`);
        return; // skip noise
      }

      const contact = $el.find("span[id*='lblContactPerson']").text().trim();
      const addr1 = $el.find("span[id*='lblAddress']").text().trim();
      const stateLine = $el.find("span[id*='lblState']").text().trim();
      const country = $el.find("span[id*='lblCountry']").text().trim();
      const phone = $el.find("span[id*='lblPhone']").text().trim();
      const emailText = $el.find("a[id*='lblEmail']").text().trim();
      const webHref = $el.find("a[id*='lblWeb']").attr('href') || '';
      const webText = $el.find("a[id*='lblWeb']").text().trim();

      context.log(`  Contact: "${contact}", Country: "${country}", Phone: "${phone}"`);

      const emails = emailText ? [emailText.toLowerCase()] : [];
      const phones = phone ? [phone.replace(/\s+/g, ' ').trim()] : [];
      const websitesSet = new Set();
      const pushUrl = (u) => {
        if (!u) return;
        const v = u.startsWith('http') ? u : `https://${u}`;
        if (/^https?:\/\//i.test(v)) websitesSet.add(v);
      };
      pushUrl(webHref);
      if (webText && webText !== webHref) pushUrl(webText);

      const agent = {
        name,
        contact,
        country,
        address: [addr1, stateLine].filter(Boolean).join(', '),
        emails,
        phones,
        websites: [...websitesSet]
      };

      context.log(`  Final agent object:`, agent);
      agents.push(agent);
    });

    context.log(`Total agents extracted: ${agents.length}`);

    // 3) Dedup + sort
    context.log('=== POST-PROCESSING PHASE ===');
    const deduped = [];
    const seen = new Set();
    for (const a of agents) {
      const key = (a.name + '|' + (a.country || '')).toLowerCase();
      if (!seen.has(key)) { seen.add(key); deduped.push(a); }
    }
    deduped.sort((a, b) => a.name.localeCompare(b.name));

    context.log(`Deduplication: ${agents.length} → ${deduped.length} agents`);

    const finalAgents = deduped.length ? deduped : DEFAULT_AGENTS;
    const usingFallback = deduped.length === 0;

    if (usingFallback) {
      context.log('WARNING: Using fallback DEFAULT_AGENTS due to no agents extracted');
    }

    context.log(`Final agent count: ${finalAgents.length} (fallback: ${usingFallback})`);

    // 4) Respond JSON
    const isDev = process.env.LOCAL_EXAMPLE_HTML === 'false' && process.env.NODE_ENV !== 'production';
    const cacheControl = isDev
      ? 'public, max-age=60, s-maxage=300' // Shorter cache for development
      : 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';

    const responseBody = {
      source: process.env.LOCAL_EXAMPLE_HTML === 'true' ? 'local' : UPSTREAM,
      updatedAt: new Date().toISOString(),
      total: finalAgents.length,
      items: finalAgents,
      // Add diagnostic info to response
      diagnostics: {
        htmlLength: html.length,
        extractedAgents: agents.length,
        dedupedAgents: deduped.length,
        usingFallback: usingFallback,
        fetchMethod: typeof fetch !== 'undefined' ? 'fetch' : 'http',
        nodeVersion: process.version,
        environment: {
          LOCAL_EXAMPLE_HTML: process.env.LOCAL_EXAMPLE_HTML,
          NODE_ENV: process.env.NODE_ENV
        }
      }
    };

    context.log('=== RESPONSE GENERATION ===');
    context.log('Response body preview:', {
      source: responseBody.source,
      total: responseBody.total,
      usingFallback: responseBody.diagnostics.usingFallback,
      extractedCount: responseBody.diagnostics.extractedAgents
    });

    context.res = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': cacheControl,
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(responseBody)
    };

    context.log('=== FUNCTION COMPLETED SUCCESSFULLY ===');
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
          details: `Failed to fetch agents from ${UPSTREAM}: ${err.message}`,
          timestamp: errorDetails.timestamp,
          isTimeout: err.name === 'AbortError',
          isFetchError: err.name === 'TypeError' && err.message.includes('fetch')
        },
        // Still provide fallback data
        total: DEFAULT_AGENTS.length,
        items: DEFAULT_AGENTS
      })
    };
  }
};
