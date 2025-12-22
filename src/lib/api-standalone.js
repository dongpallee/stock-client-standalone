files/**
 * Standalone API - Frontend-only mode using local JSON files
 * No backend server required!
 */

import { mockAuthAPI } from './mockAuth';

// Configuration
const USE_MOCK_DATA = (import.meta.env.VITE_DATA_SOURCE ?? 'mock') === 'mock';
const DATA_BASE_PATH = '/data';

// Simulate network delay for realistic UX
const simulateDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch JSON file helper
const fetchJSON = async (path) => {
  await simulateDelay();
  try {
    const response = await fetch(`${DATA_BASE_PATH}${path}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    throw error;
  }
};

// ============================================================================
// Authentication API
// ============================================================================
export const authAPI = {
  register: (userData) => mockAuthAPI.register(userData),
  login: (credentials) => mockAuthAPI.login(credentials),
  refreshToken: (refreshToken) => mockAuthAPI.refreshToken(refreshToken),
  logout: () => mockAuthAPI.logout(),
  getProfile: () => mockAuthAPI.getProfile(),
  updateProfile: (userData) => mockAuthAPI.updateProfile(userData),
  changePassword: (passwordData) => mockAuthAPI.changePassword(passwordData),
  getWatchlist: () => mockAuthAPI.getWatchlist(),
  addToWatchlist: (stockData) => mockAuthAPI.addToWatchlist(stockData),
  removeFromWatchlist: (watchlistId) => mockAuthAPI.removeFromWatchlist(watchlistId),
};

// ============================================================================
// Stock API
// ============================================================================
export const stockAPI = {
  // Get stock list
  getStocks: async (params = {}) => {
    const data = await fetchJSON('/stocks/stock-list.json');

    // Apply filters if provided
    let stocks = data;
    if (params.sector) {
      stocks = stocks.filter(s => s.sector === params.sector);
    }
    if (params.search) {
      const search = params.search.toLowerCase();
      stocks = stocks.filter(s =>
        s.stock_name.toLowerCase().includes(search) ||
        s.stock_code.includes(search)
      );
    }

    return { data: stocks };
  },

  // Get individual stock details
  getStock: async (stockCode) => {
    try {
      const data = await fetchJSON(`/stocks/${stockCode}.json`);
      return data;
    } catch {
      // Fallback: get from stock list
      const list = await fetchJSON('/stocks/stock-list.json');
      const stock = list.find(s => s.stock_code === stockCode);
      if (!stock) throw new Error('Stock not found');
      return stock;
    }
  },

  // Analyze stock (mock - just returns existing analysis)
  analyzeStock: async (stockCode, requestId) => {
    await simulateDelay(2000); // Simulate analysis time
    const data = await fetchJSON(`/stocks/${stockCode}.json`);
    return data.analysis || null;
  },

  // Get stock analysis
  getAnalysis: async (stockCode) => {
    const data = await fetchJSON(`/stocks/${stockCode}.json`);
    return data.analysis || null;
  },

  // Batch analysis (mock)
  batchAnalysis: async (stockCodes) => {
    await simulateDelay(3000);
    const results = await Promise.all(
      stockCodes.map(code => stockAPI.getAnalysis(code).catch(() => null))
    );
    return { data: results.filter(Boolean) };
  },

  // Crawl market cap (mock - returns current data)
  crawlMarketCap: async (market = 'total') => {
    await simulateDelay(1000);
    return { data: { message: 'Mock: Market cap data already loaded' } };
  },

  // Crawl stock detail (mock)
  crawlStockDetail: async (stockCode) => {
    await simulateDelay(1000);
    return { data: { message: `Mock: Stock ${stockCode} data already loaded` } };
  },

  // Initialize stocks (mock)
  initializeStocks: async (params = {}) => {
    await simulateDelay(2000);
    const list = await fetchJSON('/stocks/stock-list.json');
    return { data: { stocks: list.slice(0, params.limit || 50) } };
  },

  // Bulk update stocks (mock)
  bulkUpdateStocks: async (params = {}) => {
    await simulateDelay(3000);
    return { message: 'Mock: Stocks already up to date' };
  },

  // Get report
  getReport: async (stockCode) => {
    const data = await fetchJSON(`/stocks/${stockCode}.json`);
    return {
      stock_code: stockCode,
      stock_name: data.stock_name,
      analysis: data.analysis,
      generated_at: new Date().toISOString()
    };
  },

  // Get agents status
  getAgentsStatus: async () => {
    return await fetchJSON('/dashboard/agents-status.json');
  },

  // Get most viewed stocks
  getMostViewedStocks: async (params = {}) => {
    const data = await fetchJSON('/dashboard/most-viewed-stocks.json');
    return data.stocks.slice(0, params.limit || 5);
  },

  // Get most viewed analyses
  getMostViewedAnalyses: async (params = {}) => {
    const data = await fetchJSON('/dashboard/most-viewed-analyses.json');
    return data.analyses.slice(0, params.limit || 3);
  },

  // Get market indices
  getMarketIndices: async () => {
    return await fetchJSON('/market/indices.json');
  },

  // Watchlist API
  watchlist: {
    getList: async () => {
      const currentUser = safeJSONParse(localStorage.getItem('current_user'), null);
      if (!currentUser) return [];

      const watchlistKey = `user_watchlist_${currentUser.id}`;
      const watchlist = safeJSONParse(localStorage.getItem(watchlistKey), []);

      // Enrich with current price data
      const stockList = await fetchJSON('/stocks/stock-list.json');
      return watchlist.map(item => {
        const stockData = stockList.find(s => s.stock_code === item.stock_code);
        return {
          ...item,
          current_price: stockData?.current_price,
          change_rate: stockData?.change_rate
        };
      });
    },

    add: async (stockCode, notes = '') => {
      const currentUser = JSON.parse(localStorage.getItem('current_user'));
      if (!currentUser) throw new Error('Not authenticated');

      const watchlistKey = `user_watchlist_${currentUser.id}`;
      const watchlist = JSON.parse(localStorage.getItem(watchlistKey) || '[]');

      // Get stock info
      const stockList = await fetchJSON('/stocks/stock-list.json');
      const stock = stockList.find(s => s.stock_code === stockCode);
      if (!stock) throw new Error('Stock not found');

      // Check if already exists
      if (watchlist.find(item => item.stock_code === stockCode)) {
        throw new Error('Already in watchlist');
      }

      const newItem = {
        id: watchlist.length + 1,
        stock_code: stockCode,
        stock_name: stock.stock_name,
        notes: notes,
        added_at: new Date().toISOString()
      };

      watchlist.push(newItem);
      localStorage.setItem(watchlistKey, JSON.stringify(watchlist));

      return newItem;
    },

    remove: async (stockCode) => {
      const currentUser = JSON.parse(localStorage.getItem('current_user'));
      if (!currentUser) throw new Error('Not authenticated');

      const watchlistKey = `user_watchlist_${currentUser.id}`;
      let watchlist = JSON.parse(localStorage.getItem(watchlistKey) || '[]');

      watchlist = watchlist.filter(item => item.stock_code !== stockCode);
      localStorage.setItem(watchlistKey, JSON.stringify(watchlist));

      return { message: 'Removed from watchlist' };
    },

    check: async (stockCode) => {
      const currentUser = JSON.parse(localStorage.getItem('current_user'));
      if (!currentUser) return { in_watchlist: false };

      const watchlistKey = `user_watchlist_${currentUser.id}`;
      const watchlist = JSON.parse(localStorage.getItem(watchlistKey) || '[]');

      return {
        in_watchlist: watchlist.some(item => item.stock_code === stockCode)
      };
    }
  },

  // Settings API
  settings: {
    getProfile: async () => {
      return await mockAuthAPI.getProfile();
    },

    updateProfile: async (data) => {
      return await mockAuthAPI.updateProfile(data);
    },

    changePassword: async (data) => {
      return await mockAuthAPI.changePassword(data);
    },

    deleteAccount: async () => {
      await simulateDelay(500);
      await mockAuthAPI.logout();
      return { message: 'Account deleted (mock)' };
    },

    getLoginHistory: async () => {
      await simulateDelay(300);
      return [
        {
          timestamp: new Date().toISOString(),
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent,
          success: true
        }
      ];
    },

    getActiveSessions: async () => {
      await simulateDelay(300);
      return [
        {
          id: 1,
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent,
          current: true
        }
      ];
    }
  }
};

// ============================================================================
// Ranking API
// ============================================================================
export const rankingAPI = {
  getTopStocks: async (params = {}) => {
    const data = await fetchJSON('/rankings/top-stocks.json');
    return { data: data.overall.slice(0, params.limit || 10) };
  },

  getRankingByCategory: async (category, limit = 10) => {
    const data = await fetchJSON('/rankings/top-stocks.json');

    if (category === 'volume') {
      return { data: data.by_volume.slice(0, limit) };
    } else if (category === 'change_rate') {
      return { data: data.by_change_rate.slice(0, limit) };
    } else if (data.by_sector[category]) {
      return { data: data.by_sector[category].slice(0, limit) };
    }

    return { data: [] };
  }
};

// ============================================================================
// Dashboard API
// ============================================================================
export const dashboardAPI = {
  getSummary: async () => {
    const data = await fetchJSON('/dashboard/summary.json');
    return { data };
  },

  getMarketTrends: async (timeframe = 'today') => {
    const indices = await fetchJSON('/market/indices.json');
    return {
      data: {
        timeframe,
        kospi: indices.kospi,
        kosdaq: indices.kosdaq,
        sectors: indices.sectors
      }
    };
  },

  getPortfolioPerformance: async () => {
    await simulateDelay(500);
    const watchlist = await stockAPI.watchlist.getList();

    return {
      data: {
        total_value: watchlist.length * 100000000, // Mock value
        total_gain: 5000000, // Mock gain
        gain_percent: 5.0,
        stocks_count: watchlist.length
      }
    };
  },

  getAlerts: async () => {
    await simulateDelay(300);
    return {
      data: [
        {
          id: 1,
          type: 'price_alert',
          stock_code: '005930',
          stock_name: '삼성전자',
          message: '목표가 도달',
          created_at: new Date().toISOString()
        }
      ]
    };
  }
};

// ============================================================================
// Agent API (Mock - Standalone mode doesn't have real agents)
// ============================================================================
export const agentAPI = {
  execute: async (params) => {
    await simulateDelay(2000);
    return {
      execution_id: 'mock-' + Date.now(),
      status: 'completed',
      message: 'Mock execution in standalone mode'
    };
  },

  getStatus: async (executionId) => {
    await simulateDelay(300);
    return {
      execution_id: executionId,
      status: 'completed',
      progress: 100,
      result: {}
    };
  },

  healthCheck: async () => {
    return {
      status: 'healthy',
      mode: 'standalone',
      message: 'Running in standalone mode with mock data'
    };
  },

  cleanup: async () => {
    return { message: 'No cleanup needed in standalone mode' };
  }
};

// ============================================================================
// Monitoring API (Mock)
// ============================================================================
export const monitoringAPI = {
  start: async (params) => {
    await simulateDelay(500);
    return {
      status: 'started',
      message: 'Mock monitoring (standalone mode)',
      stocks: params.stock_codes || []
    };
  },

  getStatus: async () => {
    return {
      active: false,
      message: 'Monitoring not available in standalone mode'
    };
  },

  stop: async () => {
    return { message: 'Mock monitoring stopped' };
  },

  getAlerts: async (params = {}) => {
    return { data: [] };
  },

  acknowledgeAlert: async (alertId) => {
    return { message: 'Alert acknowledged' };
  },

  testAlert: async (params) => {
    return { message: 'Test alert sent (mock)' };
  }
};

// ============================================================================
// Financial Market API (Mock)
// ============================================================================
export const financialMarketAPI = {
  getData: async () => {
    await simulateDelay(500);
    return {
      exchange_rates: {
        USD: { value: 1320.50, change: 5.2 },
        JPY: { value: 905.30, change: -2.1 },
        EUR: { value: 1425.80, change: 3.5 }
      },
      interest_rates: {
        base_rate: 3.50,
        us_federal_rate: 5.25
      },
      timestamp: new Date().toISOString()
    };
  },

  getAnalysis: async () => {
    await simulateDelay(800);
    return {
      summary: 'Mock financial market analysis',
      impact: 'neutral',
      recommendations: []
    };
  },

  refresh: async () => {
    await simulateDelay(1000);
    return { message: 'Data refreshed (mock)' };
  },

  getSectorImpact: async (sector = null) => {
    return {
      sector: sector || 'all',
      impact: 'moderate',
      affected_stocks: []
    };
  },

  getCurrencyImpact: async (currency = 'USD', change = 0) => {
    return {
      currency,
      change,
      impact: 'low',
      affected_sectors: []
    };
  },

  getInterestRateImpact: async (change = 0) => {
    return {
      change,
      impact: 'moderate',
      affected_sectors: []
    };
  }
};

// ============================================================================
// Cache API (Mock)
// ============================================================================
export const cacheAPI = {
  getStats: async (params = {}) => {
    return {
      hit_rate: 85.5,
      total_keys: 150,
      memory_usage: '25MB',
      mode: 'standalone (LocalStorage)'
    };
  },

  refresh: async (params = {}) => {
    await simulateDelay(500);
    return { message: 'Cache refreshed (mock)' };
  },

  clear: async (params = {}) => {
    await simulateDelay(300);
    return { message: 'Cache cleared (mock)' };
  },

  getConfig: async () => {
    return {
      ttl: 3600,
      max_size: 1000,
      mode: 'standalone'
    };
  },

  updateConfig: async (config) => {
    return { message: 'Config updated (mock)' };
  },

  healthCheck: async () => {
    return {
      status: 'healthy',
      mode: 'standalone'
    };
  }
};

// ============================================================================
// React Query Keys (unchanged)
// ============================================================================
export const queryKeys = {
  agentHealth: 'agent-health',
  agentStatus: (executionId) => ['agent-status', executionId],
  monitoringStatus: 'monitoring-status',
  monitoringAlerts: (params) => ['monitoring-alerts', params],
  financialMarketData: 'financial-market-data',
  financialMarketAnalysis: 'financial-market-analysis',
  sectorImpact: (sector) => ['sector-impact', sector],
  currencyImpact: (currency, change) => ['currency-impact', currency, change],
  interestRateImpact: (change) => ['interest-rate-impact', change],
  cacheStats: 'cache-stats',
  cacheConfig: 'cache-config',
  cacheHealth: 'cache-health'
};

// Default export (for backward compatibility)
export default {
  authAPI,
  stockAPI,
  rankingAPI,
  dashboardAPI,
  agentAPI,
  monitoringAPI,
  financialMarketAPI,
  cacheAPI,
  queryKeys
};
