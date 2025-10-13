const fs = require('fs/promises');
const path = require('path');
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

module.exports = async function (context, req) {
  try {
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

      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (AgentListProxy/1.0)',
          'Cache-Control': refresh ? 'no-cache, no-store, must-revalidate' : 'max-age=300'
        }
      });
      if (!r.ok) throw new Error('upstream status ' + r.status);
      html = await r.text();

      if (refresh) {
        context.log('Cache busting applied for fresh data fetch');
      }
    }

    // 2) Parse DOM using explicit structure present in the page
    const $ = cheerio.load(html);
    const agents = [];

    $('table.agent-list div.agent-listwrap').each((i, el) => {
      const $el = $(el);

      const name = $el.find("div.agentname span[id*='lblAgentName']").text().trim();
      if (!name) return; // skip noise

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

    // 3) Dedup + sort
    const deduped = [];
    const seen = new Set();
    for (const a of agents) {
      const key = (a.name + '|' + (a.country || '')).toLowerCase();
      if (!seen.has(key)) { seen.add(key); deduped.push(a); }
    }
    deduped.sort((a, b) => a.name.localeCompare(b.name));

    const finalAgents = deduped.length ? deduped : DEFAULT_AGENTS;

    // 4) Respond JSON
    const isDev = process.env.LOCAL_EXAMPLE_HTML === 'false' && process.env.NODE_ENV !== 'production';
    const cacheControl = isDev
      ? 'public, max-age=60, s-maxage=300' // Shorter cache for development
      : 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';

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
        items: finalAgents
      })
    };
  } catch (err) {
    const errorDetails = {
      message: err.message || 'Unknown error',
      stack: err.stack,
      timestamp: new Date().toISOString(),
      upstream: UPSTREAM,
      localMode: process.env.LOCAL_EXAMPLE_HTML === 'true'
    };

    context.log.error('Agent list parsing error:', errorDetails);

    context.res = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        source: 'fallback',
        updatedAt: new Date().toISOString(),
        total: DEFAULT_AGENTS.length,
        items: DEFAULT_AGENTS,
        error: {
          message: 'Failed to fetch from upstream, using fallback data',
          details: errorDetails.message,
          timestamp: errorDetails.timestamp
        }
      })
    };
  }
};
