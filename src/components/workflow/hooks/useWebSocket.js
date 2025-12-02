/**
 * WebSocket 연동 및 이벤트 핸들링 훅
 */

import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useWorkflowWebSocket(requestId, callbacks) {
  const socketRef = useRef(null);
  const {
    onWorkflowMetadata,
    onAgentThinking,
    onWorkflowStructureUpdate,
    onWorkflowComplete,
    onError
  } = callbacks;

  /**
   * WebSocket 연결
   */
  useEffect(() => {
    if (!requestId) return;

    // Socket.IO 클라이언트 생성
    const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:9001', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    // 연결 성공
    socket.on('connect', () => {
      console.log('[WebSocket] Connected:', socket.id);

      // 워크플로우 메타데이터 요청
      socket.emit('get_workflow_metadata', { request_id: requestId });

      // 실시간 구독 시작
      socket.emit('subscribe_agent_thinking', { request_id: requestId });
    });

    // 워크플로우 초기 구조 수신
    socket.on('workflow_metadata', (data) => {
      console.log('[WebSocket] Workflow metadata received:', data);
      onWorkflowMetadata?.(data);
    });

    // 에이전트 상태 변경 수신
    socket.on('agent_thinking', (data) => {
      console.log('[WebSocket] Agent thinking:', data);
      onAgentThinking?.(data);
    });

    // 워크플로우 구조 동적 업데이트
    socket.on('workflow_structure_update', (data) => {
      console.log('[WebSocket] Structure update:', data);
      onWorkflowStructureUpdate?.(data);
    });

    // 워크플로우 완료
    socket.on('workflow_complete', (data) => {
      console.log('[WebSocket] Workflow complete:', data);
      onWorkflowComplete?.(data);
    });

    // 에러 처리
    socket.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
      onError?.(error);
    });

    // 연결 해제
    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
    });

    // 클린업
    return () => {
      socket.emit('unsubscribe_agent_thinking', { request_id: requestId });
      socket.disconnect();
    };
  }, [requestId, onWorkflowMetadata, onAgentThinking, onWorkflowStructureUpdate, onWorkflowComplete, onError]);

  /**
   * 특정 노드 상세 정보 요청
   */
  const requestNodeDetails = useCallback((nodeId) => {
    if (socketRef.current) {
      socketRef.current.emit('get_node_details', {
        request_id: requestId,
        node_id: nodeId
      });
    }
  }, [requestId]);

  /**
   * 워크플로우 일시 중지 요청
   */
  const pauseWorkflow = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('pause_workflow', {
        request_id: requestId
      });
    }
  }, [requestId]);

  /**
   * 워크플로우 재개 요청
   */
  const resumeWorkflow = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('resume_workflow', {
        request_id: requestId
      });
    }
  }, [requestId]);

  return {
    socket: socketRef.current,
    requestNodeDetails,
    pauseWorkflow,
    resumeWorkflow
  };
}
