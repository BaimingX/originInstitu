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
    context.log('=== Agent list function started (NO DEPENDENCIES VERSION) ===');

    // Load HTML
    let html = null;
    if (process.env.LOCAL_EXAMPLE_HTML === 'true') {
      try {
        const localPath = path.resolve(__dirname, '../../example.html');
        html = await fs.readFile(localPath, 'utf8');
        context.log('Using local example.html');
      } catch (e) {
        context.log('Failed reading local example.html, falling back to upstream');
      }
    }

    if (!html) {
      const refresh = req.query?.refresh === 'true';
      const url = refresh ? `${UPSTREAM}?_cb=${Date.now()}` : UPSTREAM;

      context.log('Fetching from upstream:', url);

      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!r.ok) {
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }

      html = await r.text();
      context.log('HTML fetched successfully, length:', html.length);
    }

    // Parse with regex instead of cheerio
    const agents = [];

    // Find all agent wrapper divs using regex - match complete content until </td> or next <td>
    const agentWrapperRegex = /<div[^>]*class="agent-listwrap"[^>]*>([\s\S]*?)<\/div>(?=\s*<\/td>|\s*<td>|\s*<\/tr>|$)/gi;
    let match;

    context.log('Parsing HTML for agent data...');
    context.log('HTML length:', html.length);
    context.log('HTML contains "agent-listwrap":', html.includes('agent-listwrap'));

    // Test regex matching
    const testMatches = html.match(/<div[^>]*class="agent-listwrap"/g);
    context.log('Simple pattern matches:', testMatches ? testMatches.length : 0);

    let matchCount = 0;
    while ((match = agentWrapperRegex.exec(html)) !== null) {
      matchCount++;
      const agentHtml = match[1];
      context.log(`Processing agent ${matchCount}, content length: ${agentHtml.length}`);

      // Extract agent name (wrapped in <b> tags)
      const nameMatch = agentHtml.match(/<span[^>]*id="[^"]*lblAgentName[^"]*"[^>]*><b>(.*?)<\/b><\/span>/i);
      const name = nameMatch ? nameMatch[1].trim() : '';

      if (!name) continue; // Skip if no name found

      // Extract other fields using regex
      const contact = extractTextBetween(agentHtml, /<span[^>]*id="[^"]*lblContactPerson[^"]*"[^>]*>(.*?)<\/span>/i);
      const addr1 = extractTextBetween(agentHtml, /<span[^>]*id="[^"]*lblAddress[^"]*"[^>]*>(.*?)<\/span>/i);
      const stateLine = extractTextBetween(agentHtml, /<span[^>]*id="[^"]*lblState[^"]*"[^>]*>(.*?)<\/span>/i);
      const country = extractTextBetween(agentHtml, /<span[^>]*id="[^"]*lblCountry[^"]*"[^>]*>(.*?)<\/span>/i);
      const phone = extractTextBetween(agentHtml, /<span[^>]*id="[^"]*lblPhone[^"]*"[^>]*>(.*?)<\/span>/i);

      // Extract email text and href
      const emailMatch = agentHtml.match(/<a[^>]*id="[^"]*lblEmail[^"]*"[^>]*href="mailto:([^"]*)"[^>]*>(.*?)<\/a>/i);
      const emailText = emailMatch ? emailMatch[2].trim() : '';

      // Extract web href and text
      const webMatch = agentHtml.match(/<a[^>]*id="[^"]*lblWeb[^"]*"[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/i);
      const webHref = webMatch ? webMatch[1] : '';
      const webText = webMatch ? webMatch[2].trim() : '';

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

      agents.push({
        name,
        contact,
        country,
        address: [addr1, stateLine].filter(Boolean).join(', '),
        emails,
        phones,
        websites: [...websitesSet]
      });
    }

    // Dedup + sort
    const deduped = [];
    const seen = new Set();
    for (const a of agents) {
      const key = (a.name + '|' + (a.country || '')).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(a);
      }
    }
    deduped.sort((a, b) => a.name.localeCompare(b.name));

    const finalAgents = deduped.length ? deduped : DEFAULT_AGENTS;

    context.log(`Extracted ${agents.length} agents, deduped to ${deduped.length}, final count: ${finalAgents.length}`);

    // Respond
    const cacheControl = 'public, max-age=300, s-maxage=3600';

    context.res = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': cacheControl,
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        source: process.env.LOCAL_EXAMPLE_HTML === 'true' ? 'local' : UPSTREAM,
        updatedAt: new Date().toISOString(),
        total: finalAgents.length,
        items: finalAgents,
        diagnostics: {
          parseMethod: 'regex (no dependencies)',
          extractedCount: agents.length,
          dedupedCount: deduped.length,
          usingFallback: deduped.length === 0,
          htmlLength: html.length,
          containsAgentListwrap: html.includes('agent-listwrap'),
          simplePatternMatches: html.match(/<div[^>]*class="agent-listwrap"/g)?.length || 0
        }
      })
    };

    context.log('=== Function completed successfully (NO DEPENDENCIES) ===');
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
          details: `No dependencies version - function error: ${err.message}`,
          timestamp: errorDetails.timestamp,
          parseMethod: 'regex (no dependencies)'
        },
        // Still provide fallback data
        total: DEFAULT_AGENTS.length,
        items: DEFAULT_AGENTS
      })
    };
  }
};
