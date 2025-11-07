import React, { useState, useEffect, useCallback, useMemo } from 'react';
import agentService from '../../services/agentService';

const AgentSelector = ({
  value,
  onChange,
  error,
  disabled = false,
  placeholder = "Select an agent...",
  required = false,
  onAgentSelected
}) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch agents on component mount
  useEffect(() => {
    const fetchAgentsData = async () => {
      try {
        setLoading(true);
        setApiError(null);

        const result = await agentService.fetchAgents();

        if (result.success && result.data && result.data.items) {
          setAgents(result.data.items);
          setLastUpdated(result.data.updatedAt);

          // Log cache status for debugging
          if (result.cached) {
            console.log('Agent data loaded from cache');
          } else {
            console.log('Agent data fetched from API');
          }
        } else {
          throw new Error(result.error || 'Failed to fetch agents');
        }
      } catch (err) {
        console.error('Error loading agents:', err);
        setApiError(err.message);

        // Use fallback data
        const fallbackData = agentService.getFallbackAgents();
        setAgents(fallbackData.items);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentsData();
  }, []);

  // Get unique countries for filter dropdown
  const countries = useMemo(() => {
    return agentService.getCountries(agents);
  }, [agents]);

  // Filter and search agents
  const filteredAgents = useMemo(() => {
    let filtered = agentService.filterByCountry(agents, selectedCountry);
    filtered = agentService.searchAgents(filtered, searchTerm);
    return agentService.formatForSelect(filtered);
  }, [agents, selectedCountry, searchTerm]);

  // Get selected agent details
  const selectedAgent = useMemo(() => {
    if (!value) return null;
    return agentService.getAgentByValue(agents, value);
  }, [agents, value]);

  // Handle agent selection
  const handleSelectAgent = useCallback((agentOption) => {
    onChange(agentOption.value);
    if (typeof onAgentSelected === 'function') {
      try {
        onAgentSelected(agentOption.agent);
      } catch (e) {
        // optional callback; ignore errors
      }
    }
    setIsOpen(false);
    setSearchTerm('');
  }, [onChange, onAgentSelected]);

  // Handle clear selection
  const handleClear = useCallback(() => {
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
  }, [onChange]);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);

    // Clear selection when user starts typing
    if (selectedAgent && newValue !== selectedAgent.name) {
      onChange('');
    }

    // Open dropdown if user has typed enough characters
    if (newValue.length >= 3) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [onChange, selectedAgent]);

  // Handle country filter change
  const handleCountryChange = useCallback((e) => {
    setSelectedCountry(e.target.value);
  }, []);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      setApiError(null);

      const result = await agentService.forceRefresh();

      if (result.success && result.data && result.data.items) {
        setAgents(result.data.items);
        setLastUpdated(result.data.updatedAt);
        console.log('Agent data refreshed successfully');
      } else {
        throw new Error(result.error || 'Failed to refresh agents');
      }
    } catch (err) {
      console.error('Error refreshing agents:', err);
      setApiError(err.message);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.agent-selector')) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Format display text for selected agent
  const getDisplayText = () => {
    if (selectedAgent) {
      return `${selectedAgent.name}`;
    }
    return placeholder;
  };

  return (
    <div className="agent-selector relative w-full">
      {/* Search Input Field */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm || (selectedAgent && !isOpen ? selectedAgent.name : '')}
          onChange={handleSearchChange}
          onFocus={() => {
            if (!disabled && !loading) {
              if (selectedAgent && !searchTerm) {
                setSearchTerm(selectedAgent.name);
              }
              if (searchTerm.length >= 3) {
                setIsOpen(true);
              }
            }
          }}
          onBlur={() => {
            // Delay closing to allow click on dropdown items
            setTimeout(() => setIsOpen(false), 150);
          }}
          disabled={disabled || loading}
          placeholder={loading ? 'Loading agents...' : 'Type agent name to search...'}
          className={`
            w-full px-3 py-2 pr-8 border rounded-lg bg-white
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors duration-200
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${disabled || loading ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}
          `}
        />
        {selectedAgent && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            title="Clear selection"
          >
            ✕
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* API Error Message */}
      {apiError && (
        <p className="mt-1 text-xs text-orange-600">
          ⚠️ Using cached data due to connection issue
        </p>
      )}

      {/* Dropdown Panel - Only show when searching with minimum 3 characters */}
      {isOpen && searchTerm.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-[28rem] overflow-hidden flex flex-col">
          {/* Filter Controls */}
          {countries.length > 1 && (
            <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <select
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={`px-3 py-2 text-sm rounded border ${
                    refreshing
                      ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500'
                  }`}
                  title="Refresh agent list"
                >
                  {refreshing ? '↻' : '🔄'}
                </button>
              </div>
            </div>
          )}

          {/* Agent List */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {filteredAgents.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm
                  ? `No agents found matching "${searchTerm}"`
                  : 'No agents available'
                }
              </div>
            ) : (
              filteredAgents.map((agentOption) => (
                <button
                  key={agentOption.value}
                  type="button"
                  onClick={() => handleSelectAgent(agentOption)}
                  className={`
                    w-full p-3 text-left hover:bg-blue-50 focus:bg-blue-50
                    focus:outline-none border-b border-gray-100 last:border-b-0
                    ${value === agentOption.value ? 'bg-blue-100' : ''}
                  `}
                >
                  <div className="font-medium text-gray-900">
                    {agentOption.agent.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {agentOption.agent.country}
                    {agentOption.agent.contact && (
                      <span> • {agentOption.agent.contact}</span>
                    )}
                  </div>
                  {agentOption.agent.address && (
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {agentOption.agent.address}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer Info */}
          <div className="flex-shrink-0 p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            <div className="flex justify-between items-center">
              <span>
                {filteredAgents.length} of {agents.length} agents
                {apiError && ' (cached)'}
              </span>
              {lastUpdated && (
                <span title={new Date(lastUpdated).toLocaleString()}>
                  Updated: {new Date(lastUpdated).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSelector;
