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

// Helper function to extract text from HTML span by ID pattern
function extractTextByIdPattern(html, idPattern) {
  const regex = new RegExp(`<span[^>]*id="${idPattern}"[^>]*>([^<]*)</span>`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : '';
}

// Helper function to extract email from anchor tag by ID pattern
function extractEmailByIdPattern(html, idPattern) {
  const regex = new RegExp(`<a[^>]*id="${idPattern}"[^>]*href="mailto:([^"]*)">([^<]*)</a>`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : (match ? match[2].trim() : '');
}

// Parse agents from HTML using regex patterns
function parseAgentsFromHtml(html) {
  const agents = [];

  // Find all agent names first to get the correct indices
  const agentNameRegex = /<span[^>]*id="ctl00_Main_DataList2_ctl(\d+)_lblAgentName"[^>]*>([^<]*)<\/span>/gi;
  let match;

  while ((match = agentNameRegex.exec(html)) !== null) {
    const ctlIndex = match[1].padStart(2, '0');
    const agentName = match[2].trim();

    if (!agentName) continue;

    const agent = {
      name: agentName,
      contact: extractTextByIdPattern(html, `ctl00_Main_DataList2_ctl${ctlIndex}_lblContactPerson`),
      country: extractTextByIdPattern(html, `ctl00_Main_DataList2_ctl${ctlIndex}_lblCountry`),
      address: extractTextByIdPattern(html, `ctl00_Main_DataList2_ctl${ctlIndex}_lblAddress`),
      phones: [],
      emails: [],
      websites: []
    };

    // Add state to address if exists
    const state = extractTextByIdPattern(html, `ctl00_Main_DataList2_ctl${ctlIndex}_lblState`);
    if (state) {
      agent.address = agent.address ? `${agent.address}, ${state}` : state;
    }

    // Extract phone
    const phone = extractTextByIdPattern(html, `ctl00_Main_DataList2_ctl${ctlIndex}_lblPhone`);
    if (phone) {
      agent.phones.push(phone);
    }

    // Extract email
    const email = extractEmailByIdPattern(html, `ctl00_Main_DataList2_ctl${ctlIndex}_lblEmail`);
    if (email) {
      agent.emails.push(email);
    }

    // Extract website
    const websiteRegex = new RegExp(`<a[^>]*id="ctl00_Main_DataList2_ctl${ctlIndex}_lblWeb"[^>]*href="([^"]*)"[^>]*>([^<]*)</a>`, 'i');
    const websiteMatch = html.match(websiteRegex);
    if (websiteMatch) {
      agent.websites.push(websiteMatch[1]);
    }

    agents.push(agent);
  }

  return agents;
}

// Enhanced fetch function with two-step request strategy to bypass anti-scraping
async function fetchAgentsWithRetry(context, url, maxRetries = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    context.log(`=== ANTI-SCRAPING BYPASS ATTEMPT ${attempt}/${maxRetries} ===`);

    try {
      // STEP 1: Visit homepage first to establish session
      const baseUrl = 'https://origininstitute.rtomanager.com.au';
      const homepageUrl = `${baseUrl}/`;

      context.log('STEP 1: Visiting homepage to establish session...');

      const homeHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'no-cache'
      };

      const homeController = new AbortController();
      const homeTimeoutId = setTimeout(() => homeController.abort(), 30000);

      const homeResponse = await fetch(homepageUrl, {
        method: 'GET',
        headers: homeHeaders,
        signal: homeController.signal,
        redirect: 'follow'
      });

      clearTimeout(homeTimeoutId);
      context.log(`Homepage response: ${homeResponse.status} ${homeResponse.statusText}`);

      // Extract cookies from homepage response
      let cookies = '';
      const setCookieHeaders = homeResponse.headers.get('set-cookie');
      if (setCookieHeaders) {
        cookies = setCookieHeaders.split(';')[0]; // Get first cookie
        context.log(`Extracted cookies: ${cookies}`);
      }

      // Wait a bit to mimic human behavior
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // STEP 2: Now visit target page with referer and cookies
      context.log('STEP 2: Visiting agent list page with session...');

      const targetHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Referer': homepageUrl,
        'Cache-Control': 'no-cache'
      };

      // Add cookies if we have them
      if (cookies) {
        targetHeaders['Cookie'] = cookies;
      }

      context.log(`Target request headers:`, Object.keys(targetHeaders).join(', '));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const startTime = Date.now();
      context.log(`Starting target fetch at ${new Date().toISOString()}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: targetHeaders,
        signal: controller.signal,
        redirect: 'follow'
      });

      clearTimeout(timeoutId);
      const fetchTime = Date.now() - startTime;
      context.log(`Target fetch completed in ${fetchTime}ms`);

      // Log response details
      context.log(`Response status: ${response.status} ${response.statusText}`);
      context.log(`Response headers:`, {
        'content-type': response.headers.get('content-type'),
        'content-length': response.headers.get('content-length'),
        'server': response.headers.get('server'),
        'x-powered-by': response.headers.get('x-powered-by')
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const htmlContent = await response.text();
      const contentLength = htmlContent.length;
      context.log(`HTML content received: ${contentLength} characters`);

      // Quick validation - check if content looks like HTML
      if (!htmlContent.includes('<html') && !htmlContent.includes('<!DOCTYPE')) {
        throw new Error(`Invalid HTML content received (length: ${contentLength})`);
      }

      // Check for specific elements we need
      const hasAgentList = htmlContent.includes('ctl00_Main_DataList2');
      context.log(`Contains agent list elements: ${hasAgentList}`);

      if (!hasAgentList) {
        throw new Error('HTML content does not contain expected agent list elements');
      }

      const agents = parseAgentsFromHtml(htmlContent);
      context.log(`🎉 SUCCESS: Parsed ${agents.length} agents from upstream with anti-scraping bypass!`);

      if (agents.length === 0) {
        throw new Error('No agents found in HTML content');
      }

      return agents;

    } catch (error) {
      lastError = error;
      context.log.error(`Attempt ${attempt} failed:`, {
        name: error.name,
        message: error.message,
        code: error.code,
        type: error.constructor.name
      });

      if (error.name === 'AbortError') {
        context.log.error('Request timed out');
      } else if (error.code === 'ENOTFOUND') {
        context.log.error('DNS resolution failed - domain not found');
      } else if (error.code === 'ECONNREFUSED') {
        context.log.error('Connection refused by target server');
      } else if (error.code === 'ETIMEDOUT') {
        context.log.error('Connection timed out');
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        context.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  context.log.error(`All ${maxRetries} attempts failed. Final error:`, lastError.message);
  context.log.error('Falling back to default agents');

  return DEFAULT_AGENTS;
}

module.exports = async function (context, req) {
  try {
    context.log('=== AGENT LIST SCRAPER STARTING ===');

    let agents = [];
    let source = 'fallback';

    // Check if we should use local example HTML for testing
    const useLocalHtml = process.env.LOCAL_EXAMPLE_HTML === 'true';

    if (useLocalHtml) {
      context.log('Using local example HTML file...');
      try {
        const htmlContent = await fs.readFile(path.join(__dirname, '../../example.html'), 'utf8');
        agents = parseAgentsFromHtml(htmlContent);
        source = 'local_example';
        context.log(`Parsed ${agents.length} agents from local example HTML`);
      } catch (fileErr) {
        context.log.error('Error reading local example HTML:', fileErr.message);
        agents = DEFAULT_AGENTS;
        source = 'fallback';
      }
    } else {
      context.log(`=== STARTING UPSTREAM FETCH ===`);
      context.log(`Target URL: ${UPSTREAM}`);
      context.log(`Environment: Azure Functions v${process.version} on ${process.platform}`);

      // Enhanced fetch with retry mechanism
      agents = await fetchAgentsWithRetry(context, UPSTREAM);
      source = agents.length > 1 ? 'upstream' : 'fallback';
    }

    const responseBody = {
      source: source,
      updatedAt: new Date().toISOString(),
      total: agents.length,
      items: agents,
      diagnostics: {
        nodeVersion: process.version,
        useLocalHtml: useLocalHtml,
        upstream: UPSTREAM
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

    context.log('=== AGENT LIST SCRAPER COMPLETED ===');
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

    context.log.error('=== AGENT SCRAPER ERROR ===', errorDetails);

    // Return structured error response with fallback data
    context.res = {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        source: 'error_fallback',
        updatedAt: new Date().toISOString(),
        error: {
          name: err.name || 'UnknownError',
          message: err.message || 'Agent scraping failed',
          code: err.code,
          details: `Agent scraper error: ${err.message}`,
          timestamp: errorDetails.timestamp
        },
        // Still provide fallback data so app continues to work
        total: DEFAULT_AGENTS.length,
        items: DEFAULT_AGENTS
      })
    };
  }
};
