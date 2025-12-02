import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Bot, User, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getAuthHeaders } from '../utils/auth';
import AgentThinkingPanel from './AgentThinkingPanel';

const StockChatModal = ({ isOpen, onClose, stockCode, stockName, analysisData, onRequestStart, socket, userId }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `안녕하세요! ${stockName}(${stockCode})에 대한 투자 분석 어시스턴트입니다. 분석된 데이터를 바탕으로 궁금한 점을 자유롭게 물어보세요.`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null); // 세션 ID 상태 추가
  const [currentRequestId, setCurrentRequestId] = useState(null); // 현재 요청 ID
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // request_id 생성 함수
  const generateRequestId = () => {
    return `req_${Date.now()}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    // 메시지가 추가될 때마다 스크롤을 맨 아래로
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 로딩 상태 변경 시에도 스크롤
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }

    // 모달이 닫히면 세션 및 요청 ID 초기화
    if (!isOpen) {
      setSessionId(null);
      setCurrentRequestId(null);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // request_id 생성 및 상태 업데이트
    const requestId = generateRequestId();
    setCurrentRequestId(requestId);
    console.log('[ChatModal] Generated request_id:', requestId);
    if (onRequestStart) {
      onRequestStart(requestId);
      console.log('[ChatModal] Notified parent with request_id:', requestId);
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/stocks/chat', {
        method: 'POST',
        headers: getAuthHeaders(), // 토큰 검증된 헤더 사용
        body: JSON.stringify({
          stock_code: stockCode,
          message: inputMessage,
          analysis_context: analysisData,
          session_id: sessionId, // 세션 ID 포함
          request_id: requestId  // request_id 추가 - thinking 이벤트용
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.error || `서버 오류: ${response.status}`);
      }

      const data = await response.json();

      // 세션 ID 저장 (서버에서 반환된 세션 ID 사용)
      if (data.session_id) {
        setSessionId(data.session_id);
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.response || '죄송합니다. 응답을 생성할 수 없습니다.',
        timestamp: new Date(),
        sources: data.sources || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);

      // JWT 토큰 에러인 경우 로그인 페이지로 리디렉션
      if (error.message.includes('토큰') || error.message.includes('인증')) {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: '로그인이 만료되었습니다. 다시 로그인해주세요.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);

        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/login';
        }, 3000);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSuggestedQuestions = () => [
    `${stockName}의 투자 매력도는 어떤가요?`,
    '현재 주가는 적정 수준인가요?',
    '주요 위험 요소는 무엇인가요?',
    '단기/장기 투자 관점에서 어떻게 생각하시나요?',
    '재무 건전성은 어떤 수준인가요?',
    '최근 뉴스가 주가에 미치는 영향은?'
  ];

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{stockName} 투자 분석 상담</CardTitle>
                <p className="text-sm text-gray-500">
                  종목코드: {stockCode} • AI 분석 기반 상담
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-row gap-4 p-0 overflow-hidden">
          {/* 채팅 영역 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <div className="p-2 bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}

                <div className={`max-w-[70%] ${message.type === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">참고 자료:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {message.sources.map((source, index) => (
                            <li key={index}>• {source}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.type === 'user' && (
                  <div className="p-2 bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="p-2 bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">분석 중...</span>
                  </div>
                </div>
              </div>
            )}
              <div ref={messagesEndRef} />
            </div>

            {/* 추천 질문 (메시지가 1개일 때만 표시) */}
            {messages.length === 1 && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600 mb-3">💡 추천 질문:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getSuggestedQuestions().map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-left p-2 text-sm bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 입력 영역 */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`${stockName}에 대해 궁금한 점을 물어보세요...`}
                  className="flex-1 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4 py-2 h-auto"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter로 전송 • Shift+Enter로 줄바꿈
              </p>
            </div>
          </div>

          {/* AI Thinking Panel - 우측 사이드바 (항상 표시) */}
          <div className="w-80 border-l flex flex-col overflow-hidden bg-gray-50">
            <AgentThinkingPanel
              socket={socket}
              requestId={currentRequestId}
              userId={userId}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockChatModal;