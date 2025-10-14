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
    context.log('=== Agent list function started (fixed cheerio version) ===');

    // Test cheerio first
    try {
      const testHtml = '<div>test</div>';
      const test$ = cheerio.load(testHtml);
      const testText = test$('div').text();
      context.log('Cheerio test successful:', testText === 'test');
    } catch (cheerioError) {
      context.log.error('Cheerio test failed:', {
        name: cheerioError.name,
        message: cheerioError.message
      });
      throw new Error(`Cheerio initialization failed: ${cheerioError.message}`);
    }

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

    // Parse with cheerio
    const $ = cheerio.load(html);
    const agents = [];

    $('table.agent-list div.agent-listwrap').each((i, el) => {
      const $el = $(el);
      const name = $el.find("div.agentname span[id*='lblAgentName']").text().trim();

      if (!name) return;

      const contact = $el.find("span[id*='lblContactPerson']").text().trim();
      const addr1 = $el.find("span[id*='lblAddress']").text().trim();
      const stateLine = $el.find("span[id*='lblState']").text().trim();
      const country = $el.find("span[id*='lblCountry']").text().trim();
      const phone = $el.find("span[id*='lblPhone']").text().trim();
      const emailText = $el.find("a[id*='lblEmail']").text().trim();
      const webHref = $el.find("a[id*='lblWeb']").attr('href') || '';
      const webText = $el.find("a[id*='lblWeb']").text().trim();

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
    });

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
          cheerioVersion: '1.0.0-rc.12',
          extractedCount: agents.length,
          dedupedCount: deduped.length,
          usingFallback: deduped.length === 0
        }
      })
    };

    context.log('=== Function completed successfully ===');
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
          details: `Fixed cheerio version - function error: ${err.message}`,
          timestamp: errorDetails.timestamp,
          cheerioVersion: '1.0.0-rc.12'
        },
        // Still provide fallback data
        total: DEFAULT_AGENTS.length,
        items: DEFAULT_AGENTS
      })
    };
  }
};
