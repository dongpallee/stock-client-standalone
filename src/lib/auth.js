import { jwtDecode } from 'jwt-decode';

// 안전한 숫자 변환 (NaN 방어)
const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// 토큰 저장 (리프레시 토큰 포함)
export const setToken = (token, refreshToken = null) => {
  localStorage.setItem('access_token', token);
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
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
  localStorage.removeItem('last_activity'); // 추가: 로그아웃 시 활동시간도 정리
};

// 세션 시작 시간 설정
export const setSessionStartTime = () => {
  localStorage.setItem('session_start_time', Date.now().toString());
};

// 세션 시작 시간 조회
export const getSessionStartTime = () => {
  const v = localStorage.getItem('session_start_time');
  return toNumber(v);
};

// 세션 유효성 확인 (24시간)
export const isSessionValid = () => {
  const startTime = getSessionStartTime(); // 이제 숫자 or null
  if (startTime === null) return false;

  const now = Date.now();
  const sessionDuration = 24 * 60 * 60 * 1000; // 24시간

  return (now - startTime) < sessionDuration;
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
  return userStr ? JSON.parse(userStr) : null;
};

// 로그인 상태 확인 (세션 유효성 포함)
export const isAuthenticated = () => {
  return isTokenValid() && getUser() !== null && isSessionValid();
};

// 사용자 비활성 시간 추적
export const updateLastActivity = () => {
  localStorage.setItem('last_activity', Date.now().toString());
};

// 마지막 활동 시간 조회
export const getLastActivity = () => {
  return localStorage.getItem('last_activity');
};

// 비활성 시간 확인 (30분)
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
  window.location.href = '/login';
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

