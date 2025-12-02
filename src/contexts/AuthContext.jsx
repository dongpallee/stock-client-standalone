import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';
import { 
  setToken, 
  removeToken, 
  setUser, 
  getUser, 
  isAuthenticated,
  setSessionStartTime,
  updateLastActivity,
  isInactivityTimeoutReached
} from '../lib/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 로드 시 인증 상태 확인
    const initAuth = async () => {
      // 비활성 시간 초과 확인
      if (isInactivityTimeoutReached()) {
        removeToken();
        setLoading(false);
        return;
      }

      if (isAuthenticated()) {
        const savedUser = getUser();
        if (savedUser) {
          setUserState(savedUser);
          updateLastActivity(); // 마지막 활동 시간 갱신
        } else {
          // 사용자 정보가 없으면 서버에서 가져오기
          try {
            const response = await authAPI.getProfile();
            const userData = response.data.user;
            setUser(userData);
            setUserState(userData);
            updateLastActivity();
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            removeToken();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { access_token, refresh_token, user: userData } = response.data;
      
      setToken(access_token, refresh_token);
      setUser(userData);
      setUserState(userData);
      setSessionStartTime(); // 세션 시작 시간 설정
      updateLastActivity(); // 마지막 활동 시간 설정
      
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.error || '로그인에 실패했습니다.';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return { success: true, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.error || '회원가입에 실패했습니다.';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      // 서버에 로그아웃 요청
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      setUserState(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      setUserState(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.response?.data?.error || '프로필 수정에 실패했습니다.';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: isAuthenticated() && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

