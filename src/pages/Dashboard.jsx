/**
 * Dashboard 페이지 - D-5, D-10: 대시보드 재구성
 * - 개인화 항목 제거 (포트폴리오 가치, 손익, 포트폴리오 개요)
 * - 에이전트 상태 카드 추가
 * - 인기 종목 시장데이터 위젯 추가
 * - 인기 AI 분석 위젯 추가
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Circle,
  RefreshCw,
  Loader2,
  BarChart3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  // 에이전트 상세 표시 상태 관리
  const [showAgentDetails, setShowAgentDetails] = useState(false);

  // D-1: 에이전트 상태 조회
  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents-status'],
    queryFn: () => stockAPI.getAgentsStatus(),
    refetchInterval: 10000 // 10초마다 갱신
  });

  // D-2: 인기 종목 조회
  const { data: mostViewedStocks, isLoading: stocksLoading } = useQuery({
    queryKey: ['most-viewed-stocks'],
    queryFn: () => stockAPI.getMostViewedStocks({ limit: 5 }),
    refetchInterval: 30000 // 30초마다 갱신
  });

  // D-3: 인기 AI 분석 조회
  const { data: mostViewedAnalyses, isLoading: analysesLoading } = useQuery({
    queryKey: ['most-viewed-analyses'],
    queryFn: () => stockAPI.getMostViewedAnalyses({ limit: 3 }),
    refetchInterval: 60000 // 1분마다 갱신
  });

  // 시장 지표 조회 (KOSPI/KOSDAQ)
  const { data: marketIndices, isLoading: indicesLoading } = useQuery({
    queryKey: ['market-indices'],
    queryFn: () => stockAPI.getMarketIndices(),
    refetchInterval: 30000 // 30초마다 갱신
  });

  // 에이전트 타입 한글 이름
  const getTypeDisplayName = (type) => {
    const typeNames = {
      collectors: '데이터 수집 에이전트',
      analyzers: '분석 에이전트',
      llm_processors: 'LLM 처리 에이전트',
      report_generators: '리포트 생성 에이전트',
      monitors: '모니터 에이전트',
      validators: '검증 에이전트'
    };
    return typeNames[type] || type;
  };

  // 시간 경과 계산
  const getTimeAgo = (isoString) => {
    if (!isoString) return '기록 없음';
    const now = new Date();
    const past = new Date(isoString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${Math.floor(diffHours / 24)}일 전`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-gray-500">시스템 현황 및 인기 종목 분석</p>
      </div>

      {/* 시장 지표 (KOSPI/KOSDAQ) - pykrx */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* KOSPI 지표 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold">KOSPI</CardTitle>
            <CardDescription>한국종합주가지수</CardDescription>
          </CardHeader>
          <CardContent>
            {indicesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : marketIndices?.indices?.kospi?.error ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">{marketIndices.indices.kospi.error}</p>
              </div>
            ) : marketIndices?.indices?.kospi ? (
              <div className="space-y-4">
                {/* 지수 및 등락 */}
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold">
                      {marketIndices.indices.kospi.current?.toFixed(2)}
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${
                      (marketIndices.indices.kospi.change_rate || 0) >= 0 ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {(marketIndices.indices.kospi.change_rate || 0) >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-semibold">
                        {(marketIndices.indices.kospi.change_rate || 0) >= 0 ? '+' : ''}
                        {marketIndices.indices.kospi.change?.toFixed(2)}
                        ({marketIndices.indices.kospi.change_rate?.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>{marketIndices.indices.kospi.date}</div>
                  </div>
                </div>

                {/* 상세 정보 */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 text-xs">시가</div>
                    <div className="font-semibold">{marketIndices.indices.kospi.open?.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 text-xs">고가</div>
                    <div className="font-semibold text-red-600">{marketIndices.indices.kospi.high?.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 text-xs">저가</div>
                    <div className="font-semibold text-blue-600">{marketIndices.indices.kospi.low?.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 text-xs">거래량</div>
                    <div className="font-semibold">{(marketIndices.indices.kospi.volume / 1000000).toFixed(1)}M</div>
                  </div>
                </div>

                {/* 종목 통계 */}
                {marketIndices.indices.kospi.stocks && (
                  <div className="border-t pt-3">
                    <div className="text-xs text-gray-500 mb-2">종목 현황</div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div>
                        <div className="text-gray-500">전체</div>
                        <div className="font-bold">{marketIndices.indices.kospi.stocks.total}</div>
                      </div>
                      <div>
                        <div className="text-red-600">상승</div>
                        <div className="font-bold text-red-600">{marketIndices.indices.kospi.stocks.rising}</div>
                      </div>
                      <div>
                        <div className="text-blue-600">하락</div>
                        <div className="font-bold text-blue-600">{marketIndices.indices.kospi.stocks.falling}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">보합</div>
                        <div className="font-bold">{marketIndices.indices.kospi.stocks.unchanged}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>데이터를 불러올 수 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KOSDAQ 지표 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold">KOSDAQ</CardTitle>
            <CardDescription>코스닥시장지수</CardDescription>
          </CardHeader>
          <CardContent>
            {indicesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : marketIndices?.indices?.kosdaq?.error ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">{marketIndices.indices.kosdaq.error}</p>
              </div>
            ) : marketIndices?.indices?.kosdaq ? (
              <div className="space-y-4">
                {/* 지수 및 등락 */}
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold">
                      {marketIndices.indices.kosdaq.current?.toFixed(2)}
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${
                      (marketIndices.indices.kosdaq.change_rate || 0) >= 0 ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {(marketIndices.indices.kosdaq.change_rate || 0) >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-semibold">
                        {(marketIndices.indices.kosdaq.change_rate || 0) >= 0 ? '+' : ''}
                        {marketIndices.indices.kosdaq.change?.toFixed(2)}
                        ({marketIndices.indices.kosdaq.change_rate?.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>{marketIndices.indices.kosdaq.date}</div>
                  </div>
                </div>

                {/* 상세 정보 */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 text-xs">시가</div>
                    <div className="font-semibold">{marketIndices.indices.kosdaq.open?.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 text-xs">고가</div>
                    <div className="font-semibold text-red-600">{marketIndices.indices.kosdaq.high?.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 text-xs">저가</div>
                    <div className="font-semibold text-blue-600">{marketIndices.indices.kosdaq.low?.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 text-xs">거래량</div>
                    <div className="font-semibold">{(marketIndices.indices.kosdaq.volume / 1000000).toFixed(1)}M</div>
                  </div>
                </div>

                {/* 종목 통계 */}
                {marketIndices.indices.kosdaq.stocks && (
                  <div className="border-t pt-3">
                    <div className="text-xs text-gray-500 mb-2">종목 현황</div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div>
                        <div className="text-gray-500">전체</div>
                        <div className="font-bold">{marketIndices.indices.kosdaq.stocks.total}</div>
                      </div>
                      <div>
                        <div className="text-red-600">상승</div>
                        <div className="font-bold text-red-600">{marketIndices.indices.kosdaq.stocks.rising}</div>
                      </div>
                      <div>
                        <div className="text-blue-600">하락</div>
                        <div className="font-bold text-blue-600">{marketIndices.indices.kosdaq.stocks.falling}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">보합</div>
                        <div className="font-bold">{marketIndices.indices.kosdaq.stocks.unchanged}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>데이터를 불러올 수 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* D-6: 에이전트 상태 카드 - 요약 형태 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                시스템 에이전트 상태
              </CardTitle>
              <CardDescription>
                현재 구성된 에이전트 목록 및 실행 상태
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAgentDetails(!showAgentDetails)}
              className="flex items-center gap-1"
            >
              {showAgentDetails ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  접기
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  상세보기
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {agentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* 요약 통계 */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {agentsData?.summary?.total_agents || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">전체 에이전트</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {agentsData?.summary?.active_agents || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">활성</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {agentsData?.summary?.idle_agents || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">대기</div>
                </div>
              </div>

              {/* 타입별 요약 (항상 표시) */}
              <div className="space-y-2 mb-4">
                {Object.entries(agentsData?.agents || {}).map(([type, agents]) => {
                  const list = Array.isArray(agents) ? agents : [];
                  const activeCount = list.filter(a => a.status === 'active').length;
                  const totalCount = list.length;

                  return (
                    <div key={type} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Circle className={`h-2 w-2 ${activeCount > 0 ? 'fill-green-500 text-green-500' : 'fill-gray-300 text-gray-300'}`} />
                        <span className="text-sm font-medium">{getTypeDisplayName(type)}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {activeCount}/{totalCount} 활성
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 상세 정보 (확장 시에만 표시) */}
              {showAgentDetails && (
                <div className="border-t pt-4 space-y-4">
                  {Object.entries(agentsData?.agents || {}).map(([type, agents]) => (
                    <div key={type}>
                      <h4 className="font-semibold mb-2 text-sm text-gray-700 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        {getTypeDisplayName(type)}
                      </h4>
                      <div className="space-y-1">
                        {agents.map(agent => (
                          <div
                            key={agent.name}
                            className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Circle
                                className={`h-3 w-3 ${
                                  agent.status === 'active'
                                    ? 'fill-green-500 text-green-500 animate-pulse'
                                    : 'fill-gray-300 text-gray-300'
                                }`}
                              />
                              <div>
                                <span className="font-medium text-sm">{agent.display_name}</span>
                                <p className="text-xs text-gray-500">{agent.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={agent.status === 'active' ? 'default' : 'secondary'}
                                className={agent.status === 'active' ? 'bg-green-600' : ''}
                              >
                                {agent.status === 'active' ? '활성' : '대기'}
                              </Badge>
                              <span className="text-xs text-gray-500 min-w-[60px] text-right">
                                {agent.run_count}회 실행
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 마지막 업데이트 시간 */}
              <div className="mt-4 pt-4 border-t text-xs text-gray-400 text-right">
                마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 2열 그리드 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* D-7: 인기 종목 시장데이터 위젯 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              인기 종목 시장 데이터
            </CardTitle>
            <CardDescription>가장 많이 조회된 종목</CardDescription>
          </CardHeader>
          <CardContent>
            {stocksLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : mostViewedStocks?.most_viewed_stocks?.length > 0 ? (
              <div className="space-y-3">
                {mostViewedStocks.most_viewed_stocks.map((stock, index) => (
                  <div
                    key={stock.code}
                    className="py-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer rounded transition-colors"
                    onClick={() => navigate(`/stocks/${stock.code}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-500 w-4">{index + 1}.</span>
                          <span className="font-semibold">{stock.name}</span>
                          <span className="text-gray-500 text-sm">({stock.code})</span>
                          <Badge variant="outline" className="text-xs">
                            {stock.market}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 ml-6">
                          <span className="font-bold text-lg">
                            {stock.current_price?.toLocaleString()}원
                          </span>
                          <span
                            className={`flex items-center gap-1 text-sm font-medium ${
                              (stock.change_rate || 0) >= 0 ? 'text-red-600' : 'text-blue-600'
                            }`}
                          >
                            {(stock.change_rate || 0) >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {(stock.change_rate || 0) >= 0 ? '+' : ''}
                            {stock.change_rate?.toFixed(2)}%
                          </span>
                          <span className="text-gray-500 text-sm">
                            거래량 {((stock.volume || 0) / 10000).toFixed(0)}만주
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 ml-6 mt-1">
                          조회 {stock.view_count}회
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>조회 기록이 있는 종목이 없습니다</p>
                <Button
                  variant="link"
                  onClick={() => navigate('/stocks')}
                  className="mt-2"
                >
                  종목 목록 보기 →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* D-8: 인기 AI 분석 위젯 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🤖 인기 AI 분석
            </CardTitle>
            <CardDescription>가장 많이 분석된 종목</CardDescription>
          </CardHeader>
          <CardContent>
            {analysesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : mostViewedAnalyses?.most_viewed_analyses?.length > 0 ? (
              <div className="space-y-4">
                {mostViewedAnalyses.most_viewed_analyses.map((analysis) => (
                  <Card key={analysis.stock_code} className="bg-gray-50 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{analysis.stock_name}</span>
                          <span className="text-gray-500 text-sm">({analysis.stock_code})</span>
                          <Badge variant="secondary" className="text-xs">
                            {analysis.analysis_type === 'comprehensive' ? '종합분석' : analysis.analysis_type}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        분석 {analysis.analysis_count}회 | {getTimeAgo(analysis.last_analyzed)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm font-semibold">💡 요약:</span>
                        <p className="text-sm mt-1 text-gray-700">{analysis.summary}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant={analysis.recommendation === '매수' ? 'default' : 'secondary'}
                          className={
                            analysis.recommendation === '매수'
                              ? 'bg-red-600'
                              : analysis.recommendation === '매도'
                              ? 'bg-blue-600'
                              : ''
                          }
                        >
                          {analysis.recommendation}
                        </Badge>
                        {analysis.target_price && (
                          <span className="text-sm text-gray-600">
                            목표가: {analysis.target_price.toLocaleString()}원
                          </span>
                        )}
                      </div>

                      {analysis.key_points && analysis.key_points.length > 0 && (
                        <div>
                          <span className="text-sm font-semibold">주요 포인트:</span>
                          <ul className="mt-1 space-y-1">
                            {analysis.key_points.map((point, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-gray-400">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => navigate(`/stocks/${analysis.stock_code}`)}
                        className="p-0 h-auto text-blue-600"
                      >
                        전체 분석 보기 →
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>분석 기록이 있는 종목이 없습니다</p>
                <Button
                  variant="link"
                  onClick={() => navigate('/stocks')}
                  className="mt-2"
                >
                  종목 분석 시작하기 →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
