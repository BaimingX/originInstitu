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
      context.log(`Fetching agents from upstream: ${UPSTREAM}`);
      try {
        const response = await fetch(UPSTREAM, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          timeout: 30000
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const htmlContent = await response.text();
        agents = parseAgentsFromHtml(htmlContent);
        source = 'upstream';
        context.log(`Successfully parsed ${agents.length} agents from upstream`);

      } catch (fetchErr) {
        context.log.error('Error fetching from upstream:', fetchErr.message);
        agents = DEFAULT_AGENTS;
        source = 'fallback';
      }
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
