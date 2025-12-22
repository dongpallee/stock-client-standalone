import { jwtDecode } from 'jwt-decode';

// 토큰 저장 (리프레시 토큰 포함)
export const setToken = (token, refreshToken = null) => {
  localStorage.setItem('access_token', token);

  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  } else {
    localStorage.removeItem('refresh_token');
  }
};

// 리프레시 토큰 조회
export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

// 토큰 조회
export const getToken = () => {
  return localStorage.getItem('access_token');
};

// 토큰 제거
export const removeToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('session_start_time');
  localStorage.removeItem('last_activity');
};

// 로그인 성공 시 세션 시작 시각 기록 (세션 유효성 판단 기준)
export const setSessionStartTime = () => {
  localStorage.setItem('session_start_time', Date.now().toString());
};

// 세션 시작 시간 조회
export const getSessionStartTime = () => {
  const v = localStorage.getItem('session_start_time');
  return v ? Number(v) : null;
};

// 세션 유효성 확인 (세션 시작 시점 기준 최대 24시간)
export const isSessionValid = () => {
  const startTime = getSessionStartTime();
  if (!startTime) return false;
  
  const now = Date.now();
  const sessionDuration = 24 * 60 * 60 * 1000; // 24시간
  
  const start = getSessionStartTime();
  if (!Number.isFinite(start)) return false;
  return (Date.now() - start) < sessionDuration;
};

// 토큰 유효성 검사
export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

// 사용자 정보 저장
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// 사용자 정보 조회
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    // 깨진 user 값이면 정리
    localStorage.removeItem('user');
    return null;
  }
};

// 로그인 상태 확인
// - 토큰 유효성
// - 사용자 정보 존재 여부
// - 세션 시간 제한(24h) 충족 여부
export const isAuthenticated = () => {
  return isTokenValid() && getUser() !== null && isSessionValid();
};

// 사용자 마지막 활동 시각 갱신 (비활성 로그아웃 판단용)
export const updateLastActivity = () => {
  localStorage.setItem('last_activity', Date.now().toString());
};

// 마지막 활동 시간 조회
export const getLastActivity = () => {
  const v = localStorage.getItem('last_activity');
  return v ? Number(v) : null;
};

// 사용자 비활성 제한 시간 초과 여부 확인 (마지막 활동 기준 30분)
export const isInactivityTimeoutReached = () => {
  const lastActivity = getLastActivity();
  if (!lastActivity) return false;
  
  const now = Date.now();
  const inactivityTimeout = 30 * 60 * 1000; // 30분
  
  return (now - parseInt(lastActivity)) > inactivityTimeout;
};

// 로그아웃
export const logout = () => {
  removeToken();
  // 비활성 타이머 정리
  if (window.inactivityTimer) {
    clearTimeout(window.inactivityTimer);
  }
  window.location.replace('/login');
};

// 토큰에서 사용자 ID 추출
export const getUserIdFromToken = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.sub || decoded.identity;
  } catch (error) {
    return null;
  }
};

