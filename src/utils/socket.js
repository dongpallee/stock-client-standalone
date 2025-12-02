/**
 * Socket.IO 클라이언트 관리
 */
import { io } from 'socket.io-client';
import { getToken } from '../lib/auth';

let socket = null;

/**
 * Socket.IO 연결 초기화
 * @returns {Socket} socket 인스턴스
 */
export const initSocket = () => {
  if (socket && socket.connected) {
    console.log('[Socket] Already connected');
    return socket;
  }

  const token = getToken();
  if (!token) {
    console.warn('[Socket] No token available for WebSocket connection');
    return null;
  }

  // Docker 환경에서는 상대 경로 사용 (Nginx/Vite 프록시 활용)
  // 브라우저에서 접속하는 경우 현재 origin을 사용하여 프록시를 통과하도록 함
  const SOCKET_URL = window.location.origin;

  socket = io(SOCKET_URL, {
    auth: {
      token: token
    },
    path: '/socket.io',
    transports: ['polling', 'websocket'], // polling을 먼저 시도
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
    forceNew: false
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connection_status', (data) => {
    console.log('[Socket] Connection status:', data);
  });

  socket.on('error', (error) => {
    console.error('[Socket] Error:', error);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error);
  });

  return socket;
};

/**
 * Socket 인스턴스 가져오기
 * @returns {Socket|null}
 */
export const getSocket = () => {
  if (!socket || !socket.connected) {
    return initSocket();
  }
  return socket;
};

/**
 * Socket 연결 해제
 */
export const disconnectSocket = () => {
  if (socket) {
    console.log('[Socket] Disconnecting...');
    socket.disconnect();
    socket = null;
  }
};

/**
 * Socket 연결 상태 확인
 * @returns {boolean}
 */
export const isSocketConnected = () => {
  return socket && socket.connected;
};
