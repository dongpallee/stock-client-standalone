// XSS 방지 유틸리티

/**
 * HTML 태그를 이스케이프하여 XSS 공격을 방지
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') return text;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, (s) => map[s]);
};

/**
 * HTML 태그를 제거하여 플레인 텍스트로 변환
 * @param {string} html - HTML 문자열
 * @returns {string} 플레인 텍스트
 */
export const stripHtml = (html) => {
  if (typeof html !== 'string') return html;
  return html.replace(/<[^>]*>/g, '');
};

/**
 * 안전한 URL 검증
 * @param {string} url - 검증할 URL
 * @returns {boolean} URL이 안전한지 여부
 */
export const isSafeUrl = (url) => {
  if (typeof url !== 'string') return false;
  
  try {
    const parsedUrl = new URL(url);
    // HTTP, HTTPS 프로토콜만 허용
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

/**
 * 안전한 JSON 파싱
 * @param {string} jsonString - 파싱할 JSON 문자열
 * @param {any} defaultValue - 파싱 실패 시 반환할 기본값
 * @returns {any} 파싱된 객체 또는 기본값
 */
export const safeJsonParse = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
};

/**
 * 민감한 정보 마스킹
 * @param {string} value - 마스킹할 값
 * @param {number} visibleChars - 보여줄 문자 수 (앞/뒤)
 * @returns {string} 마스킹된 문자열
 */
export const maskSensitiveData = (value, visibleChars = 2) => {
  if (typeof value !== 'string' || value.length <= visibleChars * 2) {
    return value;
  }
  
  const start = value.slice(0, visibleChars);
  const end = value.slice(-visibleChars);
  const middle = '*'.repeat(value.length - visibleChars * 2);
  
  return `${start}${middle}${end}`;
};

/**
 * 사용자 입력값 정리
 * @param {string} input - 정리할 입력값
 * @param {object} options - 정리 옵션
 * @returns {string} 정리된 입력값
 */
export const sanitizeInput = (input, options = {}) => {
  if (typeof input !== 'string') return input;
  
  const {
    allowHtml = false,
    maxLength = 1000,
    trimWhitespace = true
  } = options;
  
  let sanitized = input;
  
  // 공백 제거
  if (trimWhitespace) {
    sanitized = sanitized.trim();
  }
  
  // 길이 제한
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  
  // HTML 태그 처리
  if (!allowHtml) {
    sanitized = escapeHtml(sanitized);
  }
  
  return sanitized;
};

/**
 * 파일 업로드 보안 검증
 * @param {File} file - 검증할 파일
 * @param {object} options - 검증 옵션
 * @returns {object} 검증 결과
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
  } = options;
  
  const errors = [];
  
  // 파일 존재 확인
  if (!file) {
    errors.push('파일이 선택되지 않았습니다.');
    return { isValid: false, errors };
  }
  
  // 파일 타입 검증
  if (!allowedTypes.includes(file.type)) {
    errors.push(`허용되지 않는 파일 형식입니다. (${allowedTypes.join(', ')})`);
  }
  
  // 파일 크기 검증
  if (file.size > maxSize) {
    errors.push(`파일 크기가 너무 큽니다. (최대 ${Math.floor(maxSize / 1024 / 1024)}MB)`);
  }
  
  // 파일 확장자 검증
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push(`허용되지 않는 파일 확장자입니다. (${allowedExtensions.join(', ')})`);
  }
  
  // 파일명 검증 (특수문자 제한)
  const unsafeChars = /[<>:"/\\|?*]/;
  if (unsafeChars.test(file.name)) {
    errors.push('파일명에 특수문자가 포함되어 있습니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * CSRF 토큰 생성
 * @returns {string} CSRF 토큰
 */
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * 로그에서 민감한 정보 제거
 * @param {any} data - 로그 데이터
 * @returns {any} 정리된 로그 데이터
 */
export const sanitizeLogData = (data) => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sensitiveFields = ['password', 'token', 'access_token', 'refresh_token', 'secret', 'key'];
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  });
  
  return sanitized;
};