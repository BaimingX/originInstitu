// 临时API服务器 - 解决404问题
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 7071;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Helper functions for HTML parsing (复制自Azure Function)
function extractTextByIdPattern(html, idPattern) {
  const regex = new RegExp(`<span[^>]*id="${idPattern}"[^>]*>([^<]*)</span>`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : '';
}

function extractEmailByIdPattern(html, idPattern) {
  const regex = new RegExp(`<a[^>]*id="${idPattern}"[^>]*href="mailto:([^"]*)"[^>]*>([^<]*)</a>`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : (match ? match[2].trim() : '');
}

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

// Default fallback data
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

// Agent list endpoint
app.get('/api/agent-list', async (req, res) => {
  try {
    console.log('=== MOCK API: Agent list request received ===');

    let agents = [];
    let source = 'fallback';

    // Try to read example.html for testing
    try {
      const htmlPath = path.join(__dirname, 'example.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      agents = parseAgentsFromHtml(htmlContent);
      source = 'local_example';
      console.log(`✅ Parsed ${agents.length} agents from example.html`);
    } catch (fileErr) {
      console.log('⚠️ Could not read example.html, using fallback data');
      agents = DEFAULT_AGENTS;
      source = 'fallback';
    }

    const responseBody = {
      source: source,
      updatedAt: new Date().toISOString(),
      total: agents.length,
      items: agents,
      message: `Successfully loaded ${agents.length} agents from ${source}`
    };

    res.json(responseBody);
    console.log(`📤 Responded with ${agents.length} agents from ${source}`);

  } catch (error) {
    console.error('❌ Error in agent-list endpoint:', error);

    res.status(500).json({
      source: 'error_fallback',
      updatedAt: new Date().toISOString(),
      error: {
        message: error.message,
        details: 'Mock server error'
      },
      total: DEFAULT_AGENTS.length,
      items: DEFAULT_AGENTS
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Mock API server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📋 Agent list: http://localhost:${PORT}/api/agent-list`);
  console.log(`💊 Health check: http://localhost:${PORT}/api/health`);
  console.log('🔧 This is a temporary server to fix the 404 error issue');
});