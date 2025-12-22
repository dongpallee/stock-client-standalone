import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateLastActivity, isInactivityTimeoutReached } from '../lib/auth';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30분
const WARNING_TIME = 5 * 60 * 1000; // 5분 전 경고

export const useInactivityTimer = () => {
  const { logout, user } = useAuth();
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  // 활동 갱신
  const resetTimer = useCallback(() => {
    if (!user) return;

    updateLastActivity();

    // 기존 타이머 정리
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }

    // 경고 타이머 설정 (25분 후)
    warningTimerRef.current = setTimeout(() => {
        // 경고 시점엔 로그아웃 타이머를 일단 정리(UX 안정화)
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

      if (user && window.confirm('세션이 5분 후 만료됩니다. 계속 사용하시겠습니까?')) {
        resetTimer();
      } else if (user) {
                // 계속 사용 안 하면 남은 5분 뒤 로그아웃(선택)
        logoutTimerRef.current = setTimeout(() => {
          alert('장시간 미사용으로 자동 로그아웃됩니다.');
          logout();
        }, WARNING_TIME);
      }
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    // 로그아웃 타이머 설정 (30분 후)
    logoutTimerRef.current = setTimeout(() => {
      if (user) {
        alert('비활성 상태로 인해 자동 로그아웃됩니다.');
        logout();
      }
    }, INACTIVITY_TIMEOUT);
  }, [user, logout]);

  // 사용자 활동 감지 이벤트
  const lastResetRef = useRef(0);

  const handleUserActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastResetRef.current < 1000) return; // 1초 throttle
    lastResetRef.current = now;
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!user) return;

    // 페이지 로드 시 비활성 시간 확인
    if (isInactivityTimeoutReached()) {
      alert('세션이 만료되어 자동 로그아웃됩니다.');
      logout();
      return;
    }

    // 초기 타이머 설정
    resetTimer();

    // 사용자 활동 이벤트 리스너
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // 페이지 가시성 변경 감지
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleUserActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // 타이머 정리
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }

      // 이벤트 리스너 제거
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, logout, handleUserActivity, resetTimer]);

  return {
    resetTimer
  };
};