/**
 * Mock Authentication System for Standalone Mode
 * Uses LocalStorage to simulate backend authentication
 */

const STORAGE_KEYS = {
  USERS: 'mock_users',
  CURRENT_USER: 'current_user',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  WATCHLIST: 'user_watchlist'
};

// Initialize default demo user if not exists
const initializeDefaultUsers = () => {
  const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!existingUsers) {
    const defaultUsers = [
      {
        id: 1,
        username: 'demo',
        email: 'demo@example.com',
        password: 'demo1234', // In real app, this would be hashed
        name: '데모 사용자',
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }
};

// Generate mock JWT token
const generateMockToken = (userId, username) => {
  const payload = {
    user_id: userId,
    username: username,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iat: Math.floor(Date.now() / 1000)
  };
  // Base64 encode (not secure, just for demo)
  return 'mock.' + btoa(JSON.stringify(payload));
};

// Parse mock token
const parseMockToken = (token) => {
  try {
    if (!token || !token.startsWith('mock.')) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
};

export const mockAuthAPI = {
  // Register new user
  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    initializeDefaultUsers();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

    // Check if username or email already exists
    if (users.find(u => u.username === userData.username)) {
      throw new Error('Username already exists');
    }
    if (users.find(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: users.length + 1,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      name: userData.name || userData.username,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const token = generateMockToken(newUser.id, newUser.username);

    return {
      data: {
        user: { ...newUser, password: undefined },
        access_token: token,
        refresh_token: token,
        token_type: 'Bearer'
      }
    };
  },

  // Login
  login: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    initializeDefaultUsers();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

    const user = users.find(u =>
      u.username === credentials.username && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Invalid username or password');
    }

    const token = generateMockToken(user.id, user.username);

    // Store current user
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...user, password: undefined }));
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);

    return {
      data: {
        user: { ...user, password: undefined },
        access_token: token,
        refresh_token: token,
        token_type: 'Bearer'
      }
    };
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const payload = parseMockToken(refreshToken);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    const newToken = generateMockToken(payload.user_id, payload.username);

    return {
      data: {
        access_token: newToken,
        refresh_token: newToken,
        token_type: 'Bearer'
      }
    };
  },

  // Logout
  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));

    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

    return { data: { message: 'Logged out successfully' } };
  },

  // Get profile
  getProfile: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    return { data: JSON.parse(currentUser) };
  },

  // Update profile
  updateProfile: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUserRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!currentUserRaw) {
      throw new Error('Not authenticated');
    }
    const currentUser = JSON.parse(currentUserRaw);

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      users[userIndex] = { ...users[userIndex], ...userData, id: currentUser.id };

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify({ ...users[userIndex], password: undefined })
      );

      return { data: { ...users[userIndex], password: undefined } }; 
    },


  // Change password
  changePassword: async (passwordData) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUserRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!currentUserRaw) {
      throw new Error('Not authenticated');
    }
    const currentUser = JSON.parse(currentUserRaw);

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.id === currentUser.id);

    if (user.password !== passwordData.old_password) {
      throw new Error('Current password is incorrect');
    }

    user.password = passwordData.new_password;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    return { data: { message: 'Password changed successfully' } };
  },

  // Get watchlist
  getWatchlist: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUserRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!currentUserRaw) {
      throw new Error('Not authenticated');
    }
    const currentUser = JSON.parse(currentUserRaw);

    const watchlistKey = `${STORAGE_KEYS.WATCHLIST}_${currentUser.id}`;
    const watchlist = JSON.parse(localStorage.getItem(watchlistKey) || '[]');

    return watchlist;
  },

  // Add to watchlist
  addToWatchlist: async (stockData) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUserRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!currentUserRaw) {
      throw new Error('Not authenticated');
    }
    const currentUser = JSON.parse(currentUserRaw);

    const watchlistKey = `${STORAGE_KEYS.WATCHLIST}_${currentUser.id}`;
    const watchlist = JSON.parse(localStorage.getItem(watchlistKey) || '[]');

    // Check if already in watchlist
    if (watchlist.find(item => item.stock_code === stockData.stock_code)) {
      throw new Error('Stock already in watchlist');
    }

    const newItem = {
      id: watchlist.length + 1,
      stock_code: stockData.stock_code,
      stock_name: stockData.stock_name,
      notes: stockData.notes || '',
      added_at: new Date().toISOString()
    };

    watchlist.push(newItem);
    localStorage.setItem(watchlistKey, JSON.stringify(watchlist));

    return newItem;
  },

  // Remove from watchlist
  removeFromWatchlist: async (watchlistId) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const watchlistKey = `${STORAGE_KEYS.WATCHLIST}_${currentUser.id}`;
    let watchlist = JSON.parse(localStorage.getItem(watchlistKey) || '[]');

    watchlist = watchlist.filter(item => item.id !== parseInt(watchlistId));
    localStorage.setItem(watchlistKey, JSON.stringify(watchlist));

    return { message: 'Removed from watchlist' };
  }
};

// Initialize on module load
initializeDefaultUsers();
