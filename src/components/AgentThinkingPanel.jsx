import React, { useState, useEffect, useRef } from 'react';
import { Brain, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const AgentThinkingPanel = ({ socket, requestId, userId, onComplete }) => {
  const [thoughts, setThoughts] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentStage, setCurrentStage] = useState(null);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const thoughtsEndRef = useRef(null);
  const previousRequestIdRef = useRef(null);
  const onCompleteRef = useRef(onComplete); // onComplete 콜백을 ref로 저장

  // onComplete가 변경되면 ref 업데이트
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // 스테이지별 아이콘 및 색상
  const getStageIcon = (stage) => {
    const icons = {
      start: { Icon: Brain, color: 'text-blue-600', bg: 'bg-blue-100' },
      session: { Icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
      intent_analysis: { Icon: Brain, color: 'text-purple-600', bg: 'bg-purple-100' },
      intent_result: { Icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
      routing: { Icon: CheckCircle2, color: 'text-cyan-600', bg: 'bg-cyan-100' },
      data_validation: { Icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-100' },
      data_loading: { Icon: Loader2, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      data_loaded: { Icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
      technical_analysis: { Icon: Loader2, color: 'text-purple-600', bg: 'bg-purple-100' },
      fundamental_analysis: { Icon: Loader2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
      news_analysis: { Icon: Loader2, color: 'text-cyan-600', bg: 'bg-cyan-100' },
      full_analysis: { Icon: Loader2, color: 'text-orange-600', bg: 'bg-orange-100' },
      analysis_complete: { Icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
      llm_generation: { Icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-100' },
      recommendation_generation: { Icon: Brain, color: 'text-purple-600', bg: 'bg-purple-100' },
      llm_complete: { Icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
      complete: { Icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
      error: { Icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    };
    return icons[stage] || { Icon: Loader2, color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  // Agent thinking 이벤트 핸들러 (useCallback으로 메모이제이션)
  // requestId를 의존성에서 제거하고 ref를 통해 참조하여 불필요한 재생성 방지
  const handleAgentThinking = React.useCallback((data) => {
    // 현재 requestId와 일치하는 이벤트만 처리 (ref를 통해 최신 값 참조)
    if (data.request_id && data.request_id !== previousRequestIdRef.current) {
      console.log('[AgentThinking] Ignoring event for different requestId:', data.request_id, 'current:', previousRequestIdRef.current);
      return;
    }

    console.log('[AgentThinking] Received thinking event:', data);

    setThoughts(prev => {
      const newThoughts = [...prev, {
        id: `${data.stage}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        stage: data.stage,
        message: data.message,
        timestamp: data.timestamp,
        data: data.data || {}
      }];
      console.log(`[AgentThinking] Total thoughts: ${newThoughts.length}, Latest stage: ${data.stage}`);
      return newThoughts;
    });

    console.log('[AgentThinking] Setting currentStage to:', data.stage);
    setCurrentStage(data.stage);

    // 분석 완료 시 부모 컴포넌트에 알림 (3초 후 자동으로 패널 닫기)
    if ((data.stage === 'complete' || data.stage === 'llm_complete') && onCompleteRef.current) {
      console.log('[AgentThinking] Analysis complete, notifying parent to close panel in 3 seconds');
      setTimeout(() => {
        if (onCompleteRef.current) {
          console.log('[AgentThinking] Calling onComplete callback');
          onCompleteRef.current();
        }
      }, 3000); // 3초 후 자동 닫기
    }

    // 자동 스크롤
    requestAnimationFrame(() => {
      thoughtsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    setTimeout(() => {
      thoughtsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }, []); // 의존성 배열 비움 - 함수가 한 번만 생성됨

  // requestId가 실제로 변경될 때만 새 분석 시작
  useEffect(() => {
    if (requestId && requestId !== previousRequestIdRef.current) {
      console.log('[AgentThinking] New analysis started - requestId:', requestId);
      previousRequestIdRef.current = requestId;
      setActiveRequestId(requestId);
      // 새 분석 시작 시에만 초기화
      setThoughts([]);
      setCurrentStage(null);
    }
  }, [requestId]);

  // WebSocket 구독 설정 (한 번만 실행)
  useEffect(() => {
    if (!socket || !requestId || !userId) {
      console.log('[AgentThinking] Missing dependencies - socket:', !!socket, 'requestId:', requestId, 'userId:', userId);
      return;
    }

    console.log('[AgentThinking] Setting up WebSocket subscription for requestId:', requestId);

    // 이벤트 리스너 등록
    socket.on('agent_thinking', handleAgentThinking);

    // Agent thinking 구독
    socket.emit('subscribe_agent_thinking', { request_id: requestId });
    console.log('[AgentThinking] Subscribed to thinking events - requestId:', requestId);

    // 클린업
    return () => {
      console.log('[AgentThinking] Cleaning up subscription - requestId:', requestId);
      socket.off('agent_thinking', handleAgentThinking);
      socket.emit('unsubscribe_agent_thinking', { request_id: requestId });
    };
  }, [socket, requestId, userId, handleAgentThinking]);

  // currentStage 변경 디버깅
  useEffect(() => {
    console.log('[AgentThinking] currentStage changed to:', currentStage);
  }, [currentStage]);

  // 스테이지 이름 한글화
  const getStageName = (stage) => {
    const names = {
      start: '시작',
      session: '세션',
      intent_analysis: '의도 분석',
      intent_result: '의도 파악',
      routing: '에이전트 라우팅',
      data_validation: '데이터 검증',
      data_loading: '데이터 수집',
      data_loaded: '데이터 수집 완료',
      technical_analysis: '기술적 분석',
      fundamental_analysis: '재무 분석',
      news_analysis: '뉴스 분석',
      full_analysis: '전체 분석',
      analysis_complete: '분석 완료',
      llm_generation: 'AI 종합 분석',
      recommendation_generation: '투자 추천 생성',
      llm_complete: 'AI 응답 완료',
      complete: '완료',
      error: '오류',
    };
    return names[stage] || stage;
  };

  // 완료 상태인지 확인
  const isCompleted = currentStage === 'complete' || currentStage === 'llm_complete' || currentStage === 'error';
  const shouldShowSpinner = currentStage && !isCompleted;

  console.log('[AgentThinking] Render - currentStage:', currentStage, 'isCompleted:', isCompleted, 'shouldShowSpinner:', shouldShowSpinner);

  return (
    <Card className="w-full h-full flex flex-col shadow-lg">
      <CardHeader className="flex-shrink-0 border-b py-3 px-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">AI 분석 과정</CardTitle>
            {shouldShowSpinner && (
              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
            )}
          </div>
          <button className="p-1 hover:bg-gray-100 rounded">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {thoughts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
              <Brain className="h-12 w-12" />
              <p className="text-sm text-center">질문을 하시면<br/>AI 분석 과정이 여기에 표시됩니다</p>
            </div>
          ) : (
            thoughts.map((thought, index) => {
            const { Icon, color, bg } = getStageIcon(thought.stage);

            // 현재 항목이 로딩 중인지 확인 (현재 stage가 이 항목의 stage이고, 완료되지 않은 경우)
            const loadingStages = [
              'data_validation', 'data_loading', 'technical_analysis',
              'fundamental_analysis', 'news_analysis', 'full_analysis',
              'llm_generation', 'recommendation_generation'
            ];
            const isCurrentlyLoading =
              loadingStages.includes(thought.stage) &&
              currentStage === thought.stage &&
              !isCompleted;

            return (
              <div key={thought.id} className="flex gap-3 items-start">
                <div className={`p-2 rounded-full ${bg} flex-shrink-0`}>
                  {isCurrentlyLoading ? (
                    <Icon className={`h-4 w-4 ${color} animate-spin`} />
                  ) : (
                    <Icon className={`h-4 w-4 ${color}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">
                      {getStageName(thought.stage)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(thought.timestamp).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed break-words">
                    {thought.message}
                  </p>
                  {thought.data && Object.keys(thought.data).length > 0 && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      {thought.data.confidence && (
                        <div className="text-gray-600">
                          신뢰도: {(thought.data.confidence * 100).toFixed(0)}%
                        </div>
                      )}
                      {thought.data.normalized_query && (
                        <div className="text-gray-600 mt-1">
                          정규화: {thought.data.normalized_query}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
          )}
          <div ref={thoughtsEndRef} />
        </CardContent>
      )}
    </Card>
  );
};

export default AgentThinkingPanel;
