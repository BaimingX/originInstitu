const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

class AgentService {
  constructor() {
    this.cache = {
      data: null,
      timestamp: null,
      duration: 2 * 60 * 1000 // 2 minutes cache (reduced for development)
    };
  }

  // Check if cached data is still valid
  isCacheValid() {
    return this.cache.data &&
           this.cache.timestamp &&
           (Date.now() - this.cache.timestamp) < this.cache.duration;
  }

  // Fetch agents from Azure Function API
  async fetchAgents(forceRefresh = false) {
    try {
      // Return cached data if valid and not forcing refresh
      if (!forceRefresh && this.isCacheValid()) {
        console.log('Returning cached agent data');
        return {
          success: true,
          data: this.cache.data,
          cached: true
        };
      }

      console.log('Fetching fresh agent data from API...');

      const response = await fetch(`${API_BASE_URL}/agent-list`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update cache
      this.cache.data = result;
      this.cache.timestamp = Date.now();

      console.log(`Successfully fetched ${result.items ? result.items.length : 0} agents from ${result.source || 'API'}`);

      return {
        success: true,
        data: result,
        cached: false
      };

    } catch (error) {
      console.error('Error fetching agents:', error);

      // Return cached data if available during error
      if (this.cache.data) {
        return {
          success: true,
          data: this.cache.data,
          cached: true,
          error: error.message
        };
      }

      // Return fallback data if no cache available
      return {
        success: false,
        error: error.message,
        data: this.getFallbackAgents()
      };
    }
  }

  // Force refresh agents from API, bypassing cache
  async forceRefresh() {
    console.log('Force refreshing agent data...');

    try {
      // Clear local cache first
      this.clearCache();

      // Fetch with refresh parameter to bypass server-side cache too
      const response = await fetch(`${API_BASE_URL}/agent-list?refresh=true`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update cache
      this.cache.data = result;
      this.cache.timestamp = Date.now();

      console.log(`Force refresh completed: ${result.items ? result.items.length : 0} agents from ${result.source || 'API'}`);

      return {
        success: true,
        data: result,
        cached: false
      };

    } catch (error) {
      console.error('Error during force refresh:', error);

      // Don't return cached data on force refresh failure
      return {
        success: false,
        error: error.message,
        data: this.getFallbackAgents()
      };
    }
  }

  // Get fallback agent data for when API fails
  getFallbackAgents() {
    return {
      source: 'fallback',
      updatedAt: new Date().toISOString(),
      total: 1,
      items: [
        {
          name: 'Origin Institute',
          contact: 'Admissions Office',
          country: 'Australia',
          address: 'Level 4, 696 Bourke Street, Melbourne VIC 3000',
          emails: ['info@origininstitute.edu.au'],
          phones: ['+61 3 9642 0012'],
          websites: ['https://origininstitute.edu.au']
        }
      ]
    };
  }

  // Filter agents by country
  filterByCountry(agents, country) {
    if (!country || country === 'all') {
      return agents;
    }

    return agents.filter(agent =>
      agent.country &&
      agent.country.toLowerCase() === country.toLowerCase()
    );
  }

  // Search agents by name or contact
  searchAgents(agents, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      return agents;
    }

    const term = searchTerm.toLowerCase().trim();

    return agents.filter(agent =>
      (agent.name && agent.name.toLowerCase().includes(term)) ||
      (agent.contact && agent.contact.toLowerCase().includes(term)) ||
      (agent.address && agent.address.toLowerCase().includes(term))
    );
  }

  // Format agents for select dropdown options
  formatForSelect(agents) {
    return agents
      .filter(agent => agent && agent.name && agent.name.trim() !== '')
      .map(agent => ({
        value: `${agent.name}|${agent.country || ''}`,
        label: `${agent.name}`,
        agent: agent
      }));
  }

  // Get unique countries from agent list
  getCountries(agents) {
    const countries = [...new Set(
      agents
        .map(agent => agent.country)
        .filter(country => country && country.trim() !== '')
    )];

    return countries.sort();
  }

  // Get agent details by value (name|country format)
  getAgentByValue(agents, value) {
    if (!value || typeof value !== 'string') {
      return null;
    }

    const [name, country] = value.split('|');

    return agents.find(agent =>
      agent.name === name && agent.country === country
    );
  }

  // Validate agent selection
  validateAgentSelection(value) {
    if (!value || typeof value !== 'string') {
      return { isValid: false, message: 'Please select an agent' };
    }

    const [name, country] = value.split('|');

    if (!name || !country) {
      return { isValid: false, message: 'Invalid agent selection format' };
    }

    return { isValid: true, message: '' };
  }

  // Get formatted agent display info for forms/review
  getAgentDisplayInfo(agent) {
    if (!agent) return null;

    return {
      name: agent.name || '',
      contact: agent.contact || '',
      country: agent.country || '',
      address: agent.address || '',
      email: agent.emails && agent.emails.length > 0 ? agent.emails[0] : '',
      phone: agent.phones && agent.phones.length > 0 ? agent.phones[0] : '',
      website: agent.websites && agent.websites.length > 0 ? agent.websites[0] : ''
    };
  }

  // Clear cache (useful for debugging or force refresh)
  clearCache() {
    this.cache = {
      data: null,
      timestamp: null,
      duration: 2 * 60 * 1000
    };
  }
}

// Create singleton instance
const agentService = new AgentService();

export default agentService;
