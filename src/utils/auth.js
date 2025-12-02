/**
 * JWT 토큰 검증 및 관리 유틸리티
 *
 * Note: 기존 lib/auth.js와 통합하여 사용
 */

import { getToken, isTokenValid } from '../lib/auth';

/**
 * localStorage에서 토큰 가져오기 및 검증
 * @returns {string|null} - 유효한 토큰 또는 null
 */
export const getValidToken = () => {
  const token = getToken(); // lib/auth.js의 getToken() 사용 ('access_token' 키)

  console.log('[Auth] Getting token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');

  if (!token) {
    console.warn('[Auth] No token found in localStorage (key: access_token)');
    return null;
  }

  // lib/auth.js의 isTokenValid() 사용
  if (!isTokenValid()) {
    console.warn('[Auth] Token is invalid or expired');
    return null;
  }

  console.log('[Auth] Token is valid');
  return token;
};

/**
 * 로그인 페이지로 리디렉션
 */
export const redirectToLogin = () => {
  localStorage.clear();
  window.location.href = '/login';
};

/**
 * 인증 확인 및 자동 로그아웃
 * @returns {boolean} - 인증되어 있으면 true
 */
export const checkAuth = () => {
  const token = getValidToken();

  if (!token) {
    console.log('No valid token. Redirecting to login...');
    redirectToLogin();
    return false;
  }

  return true;
};

/**
 * API 요청용 헤더 생성
 * @returns {Object} - Authorization 헤더 포함
 */
export const getAuthHeaders = () => {
  const token = getValidToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  console.log('[Auth] Generated headers:', {
    hasToken: !!token,
    hasAuthHeader: !!headers.Authorization,
    authHeaderPreview: headers.Authorization ? `${headers.Authorization.substring(0, 30)}...` : 'none'
  });

  return headers;
};
