import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockAPI, authAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import StockChatModal from '../components/StockChatModal';
import ReportModal from '../components/ReportModal';
import { getSocket, initSocket } from '../utils/socket';
import { getUserIdFromToken } from '../lib/auth';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Star,
  StarOff,
  BarChart3,
  Loader2,
  AlertCircle,
  Target,
  Calendar,
  Activity,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  FileText,
  MessageCircle,
  Shield,
  Zap
} from 'lucide-react';

const StockDetail = () => {
  const { stockCode } = useParams();
  const queryClient = useQueryClient();
  const [isCollecting, setIsCollecting] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState({
    technical_analysis: true,
    financial_analysis: true,
    news_analysis: true,
    ai_analysis: true,
    investor_recommendation: true,
    detailed_report: true
  });
  const [isChatModalOpen, setIsChatModalOpen] = React.useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [socket, setSocket] = useState(null);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [userId, setUserId] = useState(null);

  // Socket 연결 초기화
  useEffect(() => {
    const socketInstance = initSocket();
    setSocket(socketInstance);

    const userIdFromToken = getUserIdFromToken();
    setUserId(userIdFromToken);

    return () => {
      // 컴포넌트 언마운트 시 socket 정리는 하지 않음 (앱 전체에서 사용)
    };
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 종목 정보 조회
  const { data: stockData, isLoading: stockLoading, error: stockError, refetch: refetchStock } = useQuery({
    queryKey: ['stock', stockCode],
    queryFn: () => stockAPI.getStock(stockCode),
  });

  // 분석 결과 조회
  const { data: analysisData, isLoading: analysisLoading, refetch: refetchAnalysis } = useQuery({
    queryKey: ['stock-analysis', stockCode],
    queryFn: () => stockAPI.getAnalysis(stockCode),
  });

  // 보고서 조회 (버튼 클릭 시에만 실행)
  const { data: reportData, isLoading: reportLoading, refetch: refetchReport } = useQuery({
    queryKey: ['stock-report', stockCode],
    queryFn: () => stockAPI.getReport(stockCode),
    enabled: false, // 자동 실행 비활성화
  });

  // 종목 상세 크롤링/수집 mutation
  const crawlStockMutation = useMutation({
    mutationFn: () => stockAPI.crawlStockDetail(stockCode),
    onSuccess: () => {
      queryClient.invalidateQueries(['stock', stockCode]);
      queryClient.invalidateQueries(['stock-analysis', stockCode]);
      refetchStock();
      refetchAnalysis();
      setIsCollecting(false);
    },
    onError: () => {
      setIsCollecting(false);
    }
  });

  // 종목 분석 수행 mutation
  const analyzeStockMutation = useMutation({
    mutationFn: () => stockAPI.analyzeStock(stockCode),
    onSuccess: () => {
      queryClient.invalidateQueries(['stock', stockCode]);
      queryClient.invalidateQueries(['stock-analysis', stockCode]);
      refetchAnalysis();
    }
  });

  // 관심종목 목록 조회
  const { data: watchlistData } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => stockAPI.watchlist.getList(),
  });

  // 관심종목 추가/제거
  const watchlistMutation = useMutation({
    mutationFn: (stockCode) => {
      const isInWatchlist = watchlistData?.watchlist?.some(
        item => item.stock_code === stockCode
      );
      return isInWatchlist
        ? stockAPI.watchlist.remove(stockCode)
        : stockAPI.watchlist.add(stockCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['watchlist']);
    },
  });

  // API 응답 구조에 맞게 데이터 추출
  // /api/stocks/<code>는 {basic_info: {...}, latest_analysis: {...}} 반환
  // /api/stocks/<code>/analysis는 전체 분석 데이터 직접 반환
  const stock = stockData?.basic_info || stockData;

  // analysisData를 우선 사용, 없으면 stockData의 latest_analysis 사용
  const analysis = analysisData || stockData?.latest_analysis || null;
  const watchlist = watchlistData?.watchlist || [];
  
  const isInWatchlist = watchlist.some(item => item.stock_code === stockCode);
  const watchlistItem = watchlist.find(item => item.stock_code === stockCode);

  const handleWatchlistToggle = () => {
    watchlistMutation.mutate(stockCode);
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case '매수': return 'bg-green-100 text-green-800 border-green-200';
      case '매도': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getGradeColor = (grade) => {
    if (['A+', 'A'].includes(grade)) return 'text-green-600';
    if (['B+', 'B'].includes(grade)) return 'text-blue-600';
    if (['C+', 'C'].includes(grade)) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleCollectStock = async () => {
    setIsCollecting(true);
    try {
      await crawlStockMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to collect stock data:', error);
    }
  };

  const handleAnalyzeStock = async () => {
    try {
      await analyzeStockMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to analyze stock:', error);
    }
  };

  const handleOpenReport = async () => {
    setIsReportModalOpen(true);
    if (!reportData) {
      await refetchReport();
    }
  };

  if (stockError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link to="/stocks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">종목 상세</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center max-w-md">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">종목 정보가 없습니다</h3>
                <p className="text-gray-500 mb-6">
                  종목코드 <span className="font-mono font-semibold">{stockCode}</span>의 정보가 데이터베이스에 없습니다.
                </p>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    종목 정보를 수집하여 분석을 시작할 수 있습니다.
                  </p>
                  <Button
                    onClick={handleCollectStock}
                    disabled={isCollecting || crawlStockMutation.isPending}
                  >
                    {isCollecting || crawlStockMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        종목 정보 수집 중...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        종목 정보 수집 및 분석
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link to="/stocks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {stockLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    로딩 중...
                  </div>
                ) : (
                  stock?.name || stockCode
                )}
              </h1>
              {stock && !stockLoading && (
                <Button
                  onClick={handleAnalyzeStock}
                  disabled={analyzeStockMutation.isPending}
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {analyzeStockMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      분석하기
                    </>
                  )}
                </Button>
              )}
            </div>
            {stock && (
              <div className="flex items-center gap-4">
                <p className="text-gray-500">
                  {stock.code} • {stock.market} • {stock.sector || '미분류'}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsChatModalOpen(true)}
            disabled={!analysis}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            AI 상담
          </Button>
          <Button
            variant="outline"
            onClick={handleWatchlistToggle}
            disabled={watchlistMutation.isPending}
          >
            {isInWatchlist ? (
              <>
                <Star className="h-4 w-4 mr-2 fill-current" />
                관심종목 제거
              </>
            ) : (
              <>
                <StarOff className="h-4 w-4 mr-2" />
                관심종목 추가
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 기본 정보 */}
      {stock && (
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              <div>
                <div className="text-sm text-gray-500">종목코드</div>
                <div className="text-lg font-semibold">
                  <a
                    href={`https://finance.naver.com/item/main.naver?code=${stock.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    {stock.code}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">시장구분</div>
                <div className="text-lg font-semibold">{stock.market}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">업종</div>
                <div className="text-lg font-semibold">{stock.sector || '미분류'}</div>
              </div>
              {stock.market_cap && (
                <div>
                  <div className="text-sm text-gray-500">시가총액</div>
                  <div className="text-lg font-semibold">
                    {(stock.market_cap / 100).toLocaleString()}원
                  </div>
                </div>
              )}
              {(stock?.current_price || analysis?.price_data?.current_price) && (
                <div>
                  <div className="text-sm text-gray-500">현재가</div>
                  <div className="text-lg font-semibold">
                    {(() => {
                      const price = stock?.current_price || analysis?.price_data?.current_price;
                      // 비정상적으로 큰 값 처리 (중복된 값 처리)
                      let normalizedPrice = price;
                      // 114400114400 같은 중복된 값 감지 및 수정
                      const priceStr = String(price);
                      if (priceStr.length > 8) {
                        // 값이 반복되는 패턴인지 확인
                        const halfLen = Math.floor(priceStr.length / 2);
                        const firstHalf = priceStr.substring(0, halfLen);
                        const secondHalf = priceStr.substring(halfLen, halfLen * 2);
                        if (firstHalf === secondHalf) {
                          normalizedPrice = parseInt(firstHalf);
                        }
                      }
                      return normalizedPrice.toLocaleString();
                    })()}원
                  </div>
                </div>
              )}
              {(stock?.change_rate || analysis?.price_data?.change_rate) && (
                <div>
                  <div className="text-sm text-gray-500">변동률</div>
                  <div className={`text-lg font-semibold ${
                    (stock?.change_rate || analysis?.price_data?.change_rate) >= 0 ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {(stock?.change_rate || analysis?.price_data?.change_rate) >= 0 ? '+' : ''}{(stock?.change_rate || analysis?.price_data?.change_rate).toFixed(2)}%
                  </div>
                </div>
              )}
              {(stock?.volume || analysis?.price_data?.volume) && (
                <div>
                  <div className="text-sm text-gray-500">거래량</div>
                  <div className="text-lg font-semibold">
                    {(stock?.volume || analysis?.price_data?.volume)?.toLocaleString()}주
                  </div>
                </div>
              )}
              {stock.per && (
                <div>
                  <div className="text-sm text-gray-500">PER</div>
                  <div className="text-lg font-semibold">
                    {stock.per.toFixed(1)}배
                  </div>
                </div>
              )}
              {stock.pbr && (
                <div>
                  <div className="text-sm text-gray-500">PBR</div>
                  <div className="text-lg font-semibold">
                    {stock.pbr.toFixed(2)}배
                  </div>
                </div>
              )}
              {stock.high_52w && (
                <div>
                  <div className="text-sm text-gray-500">52주 최고</div>
                  <div className="text-lg font-semibold">
                    {stock.high_52w.toLocaleString()}원
                  </div>
                </div>
              )}
              {stock.low_52w && (
                <div>
                  <div className="text-sm text-gray-500">52주 최저</div>
                  <div className="text-lg font-semibold">
                    {stock.low_52w.toLocaleString()}원
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 분석 결과 */}
      {analysisLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">분석 결과를 불러오는 중...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 종합 평가 */}
          <Card>
            <CardHeader>
              <CardTitle>종합 평가</CardTitle>
              <CardDescription>
                AI 기반 종합 투자 분석 결과
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(analysis.overall_score)}`}>
                    {analysis.overall_score}점
                  </div>
                  <div className={`text-2xl font-semibold mb-4 ${getGradeColor(analysis.grade)}`}>
                    {analysis.grade} 등급
                  </div>
                  <Badge className={`text-lg px-4 py-2 ${getRecommendationColor(analysis.recommendation)}`}>
                    {analysis.recommendation}
                  </Badge>
                </div>

                {/* LLM 종합 의견 추가 */}
                {analysis.llm_opinions?.overall && (
                  <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-900">AI 종합 의견</span>
                    </div>
                    <p className="text-sm text-amber-800">{analysis.llm_opinions.overall}</p>
                  </div>
                )}
                
                {analysis.confidence && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>신뢰도</span>
                      <span>{analysis.confidence}%</span>
                    </div>
                    <Progress value={analysis.confidence} className="h-2" />
                  </div>
                )}
                
                {analysis.target_price && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium">목표주가</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {analysis.target_price.toLocaleString()}원
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 세부 점수 */}
          <Card>
            <CardHeader>
              <CardTitle>세부 분석 점수</CardTitle>
              <CardDescription>
                각 분야별 상세 평가 점수
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.scores && (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>기술적 분석</span>
                        <span className={getScoreColor(analysis.scores.technical)}>
                          {analysis.scores.technical}점
                        </span>
                      </div>
                      <Progress value={analysis.scores.technical} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>재무 분석</span>
                        <span className={getScoreColor(analysis.scores.fundamental)}>
                          {analysis.scores.fundamental}점
                        </span>
                      </div>
                      <Progress value={analysis.scores.fundamental} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>뉴스 분석</span>
                        <span className={getScoreColor(analysis.scores.news)}>
                          {analysis.scores.news}점
                        </span>
                      </div>
                      <Progress value={analysis.scores.news} className="h-2" />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">분석 결과가 없습니다</h3>
                <p className="text-gray-500 mb-4">
                  이 종목에 대한 분석이 아직 수행되지 않았습니다.
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={handleAnalyzeStock}
                    disabled={analyzeStockMutation.isPending}
                  >
                    {analyzeStockMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        분석 진행 중...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        종목 분석 시작
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    또는 <Link to="/stocks" className="text-blue-600 hover:underline">종목 목록</Link>으로 돌아가기
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI 분석 근거 자료 */}
      {analysis?.detailed_analysis?.gemini_analysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI 분석 상세 정보</CardTitle>
                <CardDescription>
                  {analysis.detailed_analysis.analysis_model || 'AI'} 모델 기반 상세 분석 결과
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('ai_analysis')}
              >
                {expandedSections.ai_analysis ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {expandedSections.ai_analysis && (
            <CardContent>
              <div className="space-y-4">
                {/* 분석 근거 */}
                {analysis.detailed_analysis.gemini_analysis.reasoning && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      분석 근거
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {analysis.detailed_analysis.gemini_analysis.reasoning}
                    </p>
                  </div>
                )}

                {/* 핵심 요인 */}
                {analysis.detailed_analysis.gemini_analysis.key_factors?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">핵심 분석 요인</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.detailed_analysis.gemini_analysis.key_factors.map((factor, index) => (
                        <Badge key={index} variant="outline">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 추가 분석 정보 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analysis.detailed_analysis.gemini_analysis.overall_sentiment && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">시장 센티먼트</div>
                      <div className="font-semibold text-blue-700">
                        {analysis.detailed_analysis.gemini_analysis.overall_sentiment === 'positive' ? '긍정적' :
                         analysis.detailed_analysis.gemini_analysis.overall_sentiment === 'negative' ? '부정적' : '중립적'}
                      </div>
                    </div>
                  )}
                  {analysis.detailed_analysis.gemini_analysis.risk_level && (
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">위험 수준</div>
                      <div className="font-semibold text-red-700">
                        {analysis.detailed_analysis.gemini_analysis.risk_level === 'high' ? '높음' :
                         analysis.detailed_analysis.gemini_analysis.risk_level === 'low' ? '낮음' : '중간'}
                      </div>
                    </div>
                  )}
                  {analysis.detailed_analysis.gemini_analysis.time_horizon && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">투자 기간</div>
                      <div className="font-semibold text-green-700">
                        {analysis.detailed_analysis.gemini_analysis.time_horizon}
                      </div>
                    </div>
                  )}
                  {analysis.detailed_analysis.gemini_analysis.confidence_score > 0 && (
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">신뢰도</div>
                      <div className="font-semibold text-purple-700">
                        {(analysis.detailed_analysis.gemini_analysis.confidence_score * 100).toFixed(0)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* 투자자 유형별 추천 */}
      {analysis?.detailed_analysis?.investment_recommendation && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>투자자 유형별 추천</CardTitle>
                <CardDescription>
                  투자 성향에 따른 맞춤형 추천 사항
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('investor_recommendation')}
              >
                {expandedSections.investor_recommendation ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {expandedSections.investor_recommendation && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 보수적 투자자 */}
                {analysis.detailed_analysis.investment_recommendation.conservative_investor && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">보수적 투자자</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">추천</div>
                        <Badge className={getRecommendationColor(
                          analysis.detailed_analysis.investment_recommendation.conservative_investor.recommendation === 'buy' ? '매수' :
                          analysis.detailed_analysis.investment_recommendation.conservative_investor.recommendation === 'sell' ? '매도' : '보유'
                        )}>
                          {analysis.detailed_analysis.investment_recommendation.conservative_investor.recommendation === 'buy' ? '매수' :
                           analysis.detailed_analysis.investment_recommendation.conservative_investor.recommendation === 'sell' ? '매도' : '보유'}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">비중</div>
                        <div className="font-semibold">
                          {analysis.detailed_analysis.investment_recommendation.conservative_investor.allocation}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">근거</div>
                        <p className="text-sm text-gray-700">
                          {analysis.detailed_analysis.investment_recommendation.conservative_investor.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 중립적 투자자 */}
                {analysis.detailed_analysis.investment_recommendation.moderate_investor && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">중립적 투자자</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">추천</div>
                        <Badge className={getRecommendationColor(
                          analysis.detailed_analysis.investment_recommendation.moderate_investor.recommendation === 'buy' ? '매수' :
                          analysis.detailed_analysis.investment_recommendation.moderate_investor.recommendation === 'sell' ? '매도' : '보유'
                        )}>
                          {analysis.detailed_analysis.investment_recommendation.moderate_investor.recommendation === 'buy' ? '매수' :
                           analysis.detailed_analysis.investment_recommendation.moderate_investor.recommendation === 'sell' ? '매도' : '보유'}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">비중</div>
                        <div className="font-semibold">
                          {analysis.detailed_analysis.investment_recommendation.moderate_investor.allocation}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">근거</div>
                        <p className="text-sm text-gray-700">
                          {analysis.detailed_analysis.investment_recommendation.moderate_investor.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 공격적 투자자 */}
                {analysis.detailed_analysis.investment_recommendation.aggressive_investor && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">공격적 투자자</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">추천</div>
                        <Badge className={getRecommendationColor(
                          analysis.detailed_analysis.investment_recommendation.aggressive_investor.recommendation === 'buy' ? '매수' :
                          analysis.detailed_analysis.investment_recommendation.aggressive_investor.recommendation === 'sell' ? '매도' : '보유'
                        )}>
                          {analysis.detailed_analysis.investment_recommendation.aggressive_investor.recommendation === 'buy' ? '매수' :
                           analysis.detailed_analysis.investment_recommendation.aggressive_investor.recommendation === 'sell' ? '매도' : '보유'}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">비중</div>
                        <div className="font-semibold">
                          {analysis.detailed_analysis.investment_recommendation.aggressive_investor.allocation}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">근거</div>
                        <p className="text-sm text-gray-700">
                          {analysis.detailed_analysis.investment_recommendation.aggressive_investor.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              
            </CardContent>
          )}
        </Card>
      )}

      {/* 상세 분석 내용 */}
      {analysis?.detailed_analysis && (
        <div className="space-y-6">
          {/* Step3 종합 평가 */}
          {analysis.comprehensive_assessment && (
            <Card>
              <CardHeader>
                <CardTitle>종합 평가</CardTitle>
                <CardDescription>AI 기반 종합 투자 분석</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {typeof analysis.comprehensive_assessment === 'string'
                    ? analysis.comprehensive_assessment
                    : JSON.stringify(analysis.comprehensive_assessment, null, 2)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 투자 논리 */}
          {analysis.investment_thesis && (
            <Card>
              <CardHeader>
                <CardTitle>투자 논리</CardTitle>
                <CardDescription>투자 타당성 및 근거 분석</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {typeof analysis.investment_thesis === 'string'
                    ? analysis.investment_thesis
                    : JSON.stringify(analysis.investment_thesis, null, 2)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 경쟁 우위 및 주요 우려사항 */}
          {(analysis.competitive_advantages?.length > 0 || analysis.key_concerns?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.competitive_advantages?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700">경쟁 우위</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.competitive_advantages.map((advantage, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {analysis.key_concerns?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-700">주요 우려사항</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.key_concerns.map((concern, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* 시장 포지션 */}
          {analysis.market_position && (
            <Card>
              <CardHeader>
                <CardTitle>시장 포지션</CardTitle>
                <CardDescription>시장 내 위치 및 경쟁 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {typeof analysis.market_position === 'string'
                    ? analysis.market_position
                    : JSON.stringify(analysis.market_position, null, 2)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 리스크 분석 */}
          {analysis.risk_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">위험 분석</CardTitle>
                <CardDescription>주요 투자 위험 요소</CardDescription>
              </CardHeader>
              <CardContent>
                {typeof analysis.risk_analysis === 'string' ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {analysis.risk_analysis}
                  </p>
                ) : Array.isArray(analysis.risk_analysis) ? (
                  <div className="space-y-4">
                    {analysis.risk_analysis.map((item, idx) => (
                      <div key={idx} className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
                        <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {item.risk || `위험 요소 ${idx + 1}`}
                        </h4>
                        <p className="text-sm text-gray-700">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(analysis.risk_analysis, null, 2)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 전반적 요약 */}
          {analysis.detailed_analysis.overall_summary && (
            <Card>
              <CardHeader>
                <CardTitle>전반적 상황 요약</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {analysis.detailed_analysis.overall_summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 재무 분석 */}
          {analysis.detailed_analysis.financial_analysis && (
            <Card>
              <CardHeader>
                <CardTitle>재무 건전성 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysis.detailed_analysis.financial_analysis.strengths && (
                    <div>
                      <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        강점
                      </h4>
                      <ul className="space-y-1">
                        {analysis.detailed_analysis.financial_analysis.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            • {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {analysis.detailed_analysis.financial_analysis.weaknesses && (
                    <div>
                      <h4 className="font-semibold text-red-700 mb-3 flex items-center">
                        <TrendingDown className="h-4 w-4 mr-2" />
                        약점
                      </h4>
                      <ul className="space-y-1">
                        {analysis.detailed_analysis.financial_analysis.weaknesses.map((weakness, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            • {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 투자 전망 (Step3 데이터 우선) */}
          {(analysis.investment_outlook || analysis.detailed_analysis.investment_outlook) && (
            <Card>
              <CardHeader>
                <CardTitle>투자 전망</CardTitle>
                <CardDescription>기간별 투자 전망 및 기대 수익률</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 단기 전망 */}
                  {(analysis.investment_outlook?.short_term || analysis.detailed_analysis.investment_outlook?.short_term) && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        단기 전망
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">
                        {analysis.investment_outlook?.short_term?.timeframe || '1-3개월'}
                      </p>
                      {analysis.investment_outlook?.short_term?.expected_return && (
                        <div className="mb-2">
                          <span className="text-2xl font-bold text-blue-600">
                            {analysis.investment_outlook.short_term.expected_return > 0 ? '+' : ''}
                            {analysis.investment_outlook.short_term.expected_return}%
                          </span>
                          <span className="text-xs text-gray-500 ml-2">기대 수익률</span>
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mb-3">
                        {analysis.investment_outlook?.short_term?.outlook || analysis.detailed_analysis.investment_outlook?.short_term}
                      </p>
                      {analysis.investment_outlook?.short_term?.key_factors?.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-1">핵심 요인:</div>
                          <ul className="space-y-1">
                            {analysis.investment_outlook.short_term.key_factors.map((factor, idx) => (
                              <li key={idx} className="text-xs text-gray-600">• {factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 중기 전망 */}
                  {(analysis.investment_outlook?.medium_term || analysis.detailed_analysis.investment_outlook?.medium_term) && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        중기 전망
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">
                        {analysis.investment_outlook?.medium_term?.timeframe || '3-12개월'}
                      </p>
                      {analysis.investment_outlook?.medium_term?.expected_return && (
                        <div className="mb-2">
                          <span className="text-2xl font-bold text-green-600">
                            {analysis.investment_outlook.medium_term.expected_return > 0 ? '+' : ''}
                            {analysis.investment_outlook.medium_term.expected_return}%
                          </span>
                          <span className="text-xs text-gray-500 ml-2">기대 수익률</span>
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mb-3">
                        {analysis.investment_outlook?.medium_term?.outlook || analysis.detailed_analysis.investment_outlook?.medium_term}
                      </p>
                      {analysis.investment_outlook?.medium_term?.key_factors?.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-1">핵심 요인:</div>
                          <ul className="space-y-1">
                            {analysis.investment_outlook.medium_term.key_factors.map((factor, idx) => (
                              <li key={idx} className="text-xs text-gray-600">• {factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 장기 전망 */}
                  {(analysis.investment_outlook?.long_term || analysis.detailed_analysis.investment_outlook?.long_term) && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        장기 전망
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">
                        {analysis.investment_outlook?.long_term?.timeframe || '1년 이상'}
                      </p>
                      {analysis.investment_outlook?.long_term?.expected_return && (
                        <div className="mb-2">
                          <span className="text-2xl font-bold text-purple-600">
                            {analysis.investment_outlook.long_term.expected_return > 0 ? '+' : ''}
                            {analysis.investment_outlook.long_term.expected_return}%
                          </span>
                          <span className="text-xs text-gray-500 ml-2">기대 수익률</span>
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mb-3">
                        {analysis.investment_outlook?.long_term?.outlook || analysis.detailed_analysis.investment_outlook?.long_term}
                      </p>
                      {analysis.investment_outlook?.long_term?.key_factors?.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-1">핵심 요인:</div>
                          <ul className="space-y-1">
                            {analysis.investment_outlook.long_term.key_factors.map((factor, idx) => (
                              <li key={idx} className="text-xs text-gray-600">• {factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 투자자 유형별 추천 */}
          {analysis.investment_outlook?.short_term?.investor_type_recommendations ||
           analysis.investment_outlook?.medium_term?.investor_type_recommendations ||
           analysis.investment_outlook?.long_term?.investor_type_recommendations && (
            <Card>
              <CardHeader>
                <CardTitle>투자자 유형별 추천</CardTitle>
                <CardDescription>투자 성향에 따른 맞춤형 추천 사항</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 보수적 투자자 */}
                  {(analysis.investment_outlook?.short_term?.investor_type_recommendations?.conservative ||
                    analysis.investment_outlook?.medium_term?.investor_type_recommendations?.conservative ||
                    analysis.investment_outlook?.long_term?.investor_type_recommendations?.conservative) && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Shield className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-blue-900">보수적 투자자</h4>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {analysis.investment_outlook?.long_term?.investor_type_recommendations?.conservative ||
                         analysis.investment_outlook?.medium_term?.investor_type_recommendations?.conservative ||
                         analysis.investment_outlook?.short_term?.investor_type_recommendations?.conservative}
                      </p>
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="text-xs text-blue-600 font-medium">특징</div>
                        <div className="text-xs text-gray-600 mt-1">
                          • 안정성 중시<br/>
                          • 낮은 위험 선호<br/>
                          • 장기 배당 투자
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 중도적 투자자 */}
                  {(analysis.investment_outlook?.short_term?.investor_type_recommendations?.moderate ||
                    analysis.investment_outlook?.medium_term?.investor_type_recommendations?.moderate ||
                    analysis.investment_outlook?.long_term?.investor_type_recommendations?.moderate) && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                        <h4 className="font-semibold text-green-900">중도적 투자자</h4>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {analysis.investment_outlook?.long_term?.investor_type_recommendations?.moderate ||
                         analysis.investment_outlook?.medium_term?.investor_type_recommendations?.moderate ||
                         analysis.investment_outlook?.short_term?.investor_type_recommendations?.moderate}
                      </p>
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <div className="text-xs text-green-600 font-medium">특징</div>
                        <div className="text-xs text-gray-600 mt-1">
                          • 균형잡힌 접근<br/>
                          • 적정 위험 수용<br/>
                          • 중장기 성장 추구
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 공격적 투자자 */}
                  {(analysis.investment_outlook?.short_term?.investor_type_recommendations?.aggressive ||
                    analysis.investment_outlook?.medium_term?.investor_type_recommendations?.aggressive ||
                    analysis.investment_outlook?.long_term?.investor_type_recommendations?.aggressive) && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Zap className="h-5 w-5 text-purple-600 mr-2" />
                        <h4 className="font-semibold text-purple-900">공격적 투자자</h4>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {analysis.investment_outlook?.long_term?.investor_type_recommendations?.aggressive ||
                         analysis.investment_outlook?.medium_term?.investor_type_recommendations?.aggressive ||
                         analysis.investment_outlook?.short_term?.investor_type_recommendations?.aggressive}
                      </p>
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <div className="text-xs text-purple-600 font-medium">특징</div>
                        <div className="text-xs text-gray-600 mt-1">
                          • 높은 수익 추구<br/>
                          • 높은 위험 수용<br/>
                          • 단기 변동성 활용
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 시나리오 분석 */}
          {analysis.scenario_analysis && Object.keys(analysis.scenario_analysis).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>시나리오 분석</CardTitle>
                <CardDescription>상승/기본/하락 시나리오별 전망</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 상승 시나리오 */}
                  {analysis.scenario_analysis.bull_case && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-green-800">상승 시나리오</h4>
                        <Badge className="bg-green-600">
                          {(analysis.scenario_analysis.bull_case.probability * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        +{analysis.scenario_analysis.bull_case.expected_return}%
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{analysis.scenario_analysis.bull_case.timeframe}</p>
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-green-800">주요 동인:</div>
                        <ul className="space-y-1">
                          {analysis.scenario_analysis.bull_case.key_drivers?.map((driver, idx) => (
                            <li key={idx} className="text-xs text-gray-700">• {driver}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* 기본 시나리오 */}
                  {analysis.scenario_analysis.base_case && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-800">기본 시나리오</h4>
                        <Badge className="bg-blue-600">
                          {(analysis.scenario_analysis.base_case.probability * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {analysis.scenario_analysis.base_case.expected_return > 0 ? '+' : ''}
                        {analysis.scenario_analysis.base_case.expected_return}%
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{analysis.scenario_analysis.base_case.timeframe}</p>
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-blue-800">주요 동인:</div>
                        <ul className="space-y-1">
                          {analysis.scenario_analysis.base_case.key_drivers?.map((driver, idx) => (
                            <li key={idx} className="text-xs text-gray-700">• {driver}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* 하락 시나리오 */}
                  {analysis.scenario_analysis.bear_case && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-red-800">하락 시나리오</h4>
                        <Badge className="bg-red-600">
                          {(analysis.scenario_analysis.bear_case.probability * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-red-600 mb-2">
                        {analysis.scenario_analysis.bear_case.expected_return}%
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{analysis.scenario_analysis.bear_case.timeframe}</p>
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-red-800">주요 위험:</div>
                        <ul className="space-y-1">
                          {analysis.scenario_analysis.bear_case.key_risks?.map((risk, idx) => (
                            <li key={idx} className="text-xs text-gray-700">• {risk}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI 인사이트 */}
          {analysis.ai_insights && Object.keys(analysis.ai_insights).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>AI 인사이트</CardTitle>
                <CardDescription>AI 기반 고급 분석 및 패턴 인식</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 고유 인사이트 */}
                  {analysis.ai_insights.unique_insights?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-2 flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        주요 발견사항
                      </h4>
                      <ul className="space-y-2">
                        {analysis.ai_insights.unique_insights.map((insight, idx) => (
                          <li key={idx} className="text-sm text-gray-700 pl-4 border-l-2 border-blue-300">
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 패턴 인식 */}
                  {analysis.ai_insights.pattern_recognition?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-purple-700 mb-2 flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        패턴 분석
                      </h4>
                      <ul className="space-y-2">
                        {analysis.ai_insights.pattern_recognition.map((pattern, idx) => (
                          <li key={idx} className="text-sm text-gray-700 pl-4 border-l-2 border-purple-300">
                            {pattern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 이상 징후 감지 */}
                  {analysis.ai_insights.anomaly_detection?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-amber-700 mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        이상 징후
                      </h4>
                      <ul className="space-y-2">
                        {analysis.ai_insights.anomaly_detection.map((anomaly, idx) => (
                          <li key={idx} className="text-sm text-gray-700 pl-4 border-l-2 border-amber-300">
                            {anomaly}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 실행 가능한 추천사항 */}
          {analysis.actionable_recommendations && Object.keys(analysis.actionable_recommendations).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>실행 가능한 추천사항</CardTitle>
                <CardDescription>구체적인 투자 액션 아이템</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 즉시 실행 액션 */}
                  {analysis.actionable_recommendations.immediate_actions?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        즉시 실행 액션
                      </h4>
                      <ul className="space-y-2">
                        {analysis.actionable_recommendations.immediate_actions.map((action, idx) => (
                          <li key={idx} className="flex items-start p-3 bg-green-50 rounded-lg">
                            <span className="text-green-600 font-bold mr-2">{idx + 1}.</span>
                            <span className="text-sm text-gray-700">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 모니터링 포인트 */}
                  {analysis.actionable_recommendations.monitoring_points?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-3 flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        모니터링 포인트
                      </h4>
                      <ul className="space-y-2">
                        {analysis.actionable_recommendations.monitoring_points.map((point, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start">
                            <span className="mr-2">📊</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 트리거 이벤트 */}
                  {analysis.actionable_recommendations.trigger_events?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-amber-700 mb-3 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        주의해야 할 트리거 이벤트
                      </h4>
                      <ul className="space-y-2">
                        {analysis.actionable_recommendations.trigger_events.map((event, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start p-2 bg-amber-50 rounded">
                            <span className="mr-2">⚠️</span>
                            {event}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 청산 전략 */}
                  {analysis.actionable_recommendations.exit_strategies?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-purple-700 mb-3 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        청산 전략
                      </h4>
                      <ul className="space-y-2">
                        {analysis.actionable_recommendations.exit_strategies.map((strategy, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start p-2 bg-purple-50 rounded">
                            <span className="mr-2">🎯</span>
                            {strategy}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 기술적 분석 상세 */}
          {analysis?.technical_analysis && Object.keys(analysis.technical_analysis).length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>기술적 분석</CardTitle>
                    <CardDescription>
                      차트 패턴 및 기술적 지표 분석
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('technical_analysis')}
                  >
                    {expandedSections.technical_analysis ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {expandedSections.technical_analysis && (
                <CardContent>
                  {/* LLM 의견 추가 */}
                  {analysis.llm_opinions?.technical && (
                    <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-900">AI 분석 의견</span>
                      </div>
                      <p className="text-sm text-blue-800">{analysis.llm_opinions.technical}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {analysis.technical_analysis.rsi && (
                      <div className="p-3 border rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">RSI (14일)</div>
                        <div className="text-lg font-semibold">
                          {(typeof analysis.technical_analysis.rsi === 'object'
                            ? analysis.technical_analysis.rsi.current
                            : analysis.technical_analysis.rsi
                          ).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {(() => {
                            const rsiValue = typeof analysis.technical_analysis.rsi === 'object'
                              ? analysis.technical_analysis.rsi.current
                              : analysis.technical_analysis.rsi;
                            return rsiValue > 70 ? '과매수' :
                                   rsiValue < 30 ? '과매도' : '중립';
                          })()}
                        </div>
                      </div>
                    )}
                    {analysis.technical_analysis.macd && (
                      <div className="p-3 border rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">MACD</div>
                        <div className="text-lg font-semibold">
                          {analysis.technical_analysis.macd.macd?.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">
                          시그널: {analysis.technical_analysis.macd.signal?.toFixed(2)}
                        </div>
                      </div>
                    )}
                    {analysis.technical_analysis.bollinger_bands && (
                      <div className="p-3 border rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">볼린저 밴드</div>
                        <div className="text-sm">
                          상단: {(() => {
                            const val = analysis.technical_analysis.bollinger_bands.upper;
                            // 비정상적인 값 처리
                            if (Math.abs(val) > 1000000000) {
                              return "계산 중";
                            }
                            return val?.toLocaleString();
                          })()}
                        </div>
                        <div className="text-sm">
                          중간: {(() => {
                            const val = analysis.technical_analysis.bollinger_bands.middle;
                            // 중복된 값 처리
                            const valStr = String(Math.abs(val));
                            if (valStr.length > 8) {
                              const halfLen = Math.floor(valStr.length / 2);
                              const firstHalf = valStr.substring(0, halfLen);
                              const secondHalf = valStr.substring(halfLen, halfLen * 2);
                              if (firstHalf === secondHalf) {
                                return parseInt(firstHalf).toLocaleString();
                              }
                            }
                            return val > 1000000000 ? Math.floor(val / 100000).toLocaleString() : val?.toFixed(0);
                          })()}
                        </div>
                        <div className="text-sm">
                          하단: {(() => {
                            const val = analysis.technical_analysis.bollinger_bands.lower;
                            // 음수 비정상값 처리
                            if (val < -1000000000) {
                              return "계산 중";
                            }
                            return val?.toLocaleString();
                          })()}
                        </div>
                      </div>
                    )}
                    {analysis.technical_analysis.moving_averages && (
                      <div className="p-3 border rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">이동평균선</div>
                        {analysis.technical_analysis.moving_averages.ma_5 && (
                          <div className="text-sm">
                            5일: {analysis.technical_analysis.moving_averages.ma_5.toFixed(0)}
                          </div>
                        )}
                        {analysis.technical_analysis.moving_averages.ma_20 && (
                          <div className="text-sm">
                            20일: {analysis.technical_analysis.moving_averages.ma_20.toFixed(0)}
                          </div>
                        )}
                        {analysis.technical_analysis.moving_averages.ma_60 && (
                          <div className="text-sm">
                            60일: {analysis.technical_analysis.moving_averages.ma_60.toFixed(0)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {analysis.technical_analysis.summary && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">기술적 분석 요약</h4>
                      <p className="text-sm text-gray-700">{analysis.technical_analysis.summary}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}

          {/* 재무 분석 상세 */}
          {(analysis?.financial_analysis || analysis?.financial_data) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>재무 분석</CardTitle>
                    <CardDescription>
                      재무제표 및 투자지표 분석
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('financial_analysis')}
                  >
                    {expandedSections.financial_analysis ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {expandedSections.financial_analysis && (
                <CardContent>
                  {/* LLM 의견 추가 */}
                  {analysis.llm_opinions?.financial && (
                    <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-900">AI 분석 의견</span>
                      </div>
                      <p className="text-sm text-green-800">{analysis.llm_opinions.financial}</p>
                    </div>
                  )}
                  {(analysis.financial_data || analysis.financial_analysis) && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {/* financial_analysis의 데이터를 우선 사용 */}
                      {analysis.financial_analysis?.per && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">PER</div>
                          <div className="text-lg font-semibold">
                            {analysis.financial_analysis.per.toFixed(2)}
                          </div>
                        </div>
                      )}
                      {analysis.financial_analysis?.pbr && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">PBR</div>
                          <div className="text-lg font-semibold">
                            {analysis.financial_analysis.pbr.toFixed(2)}
                          </div>
                        </div>
                      )}
                      {analysis.financial_analysis?.eps && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">EPS</div>
                          <div className="text-lg font-semibold">
                            {analysis.financial_analysis.eps.toLocaleString()}원
                          </div>
                        </div>
                      )}
                      {analysis.financial_analysis?.bps && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">BPS</div>
                          <div className="text-lg font-semibold">
                            {analysis.financial_analysis.bps.toLocaleString()}원
                          </div>
                        </div>
                      )}
                      {analysis.financial_analysis?.roe && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">ROE</div>
                          <div className="text-lg font-semibold">
                            {analysis.financial_analysis.roe.toFixed(2)}%
                          </div>
                        </div>
                      )}
                      {analysis.financial_analysis?.debt_ratio && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">부채비율</div>
                          <div className="text-lg font-semibold">
                            {analysis.financial_analysis.debt_ratio.toFixed(1)}%
                          </div>
                        </div>
                      )}
                      {analysis.financial_analysis?.current_ratio && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">유동비율</div>
                          <div className="text-lg font-semibold">
                            {analysis.financial_analysis.current_ratio.toFixed(2)}%
                          </div>
                        </div>
                      )}
                      {analysis.financial_analysis?.dividend_yield && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">배당수익률</div>
                          <div className="text-lg font-semibold">
                            {analysis.financial_analysis.dividend_yield.toFixed(2)}%
                          </div>
                        </div>
                      )}
                      {/* 기존 financial_data 처리 (폴백) */}
                      {analysis.financial_data?.revenue && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">매출액</div>
                          <div className="text-lg font-semibold">
                            {(analysis.financial_data.revenue / 100000000).toFixed(0)}억원
                          </div>
                        </div>
                      )}
                      {analysis.financial_data?.operating_profit && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">영업이익</div>
                          <div className="text-lg font-semibold">
                            {(analysis.financial_data.operating_profit / 100000000).toFixed(0)}억원
                          </div>
                        </div>
                      )}
                      {analysis.financial_data?.net_profit && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">순이익</div>
                          <div className="text-lg font-semibold">
                            {(analysis.financial_data.net_profit / 100000000).toFixed(0)}억원
                          </div>
                        </div>
                      )}
                      {analysis.financial_data?.roe && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">ROE</div>
                          <div className="text-lg font-semibold">
                            {analysis.financial_data.roe.toFixed(2)}%
                          </div>
                        </div>
                      )}
                      {analysis.financial_data?.roa && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">ROA</div>
                          <div className="text-lg font-semibold">
                            {analysis.financial_data.roa.toFixed(2)}%
                          </div>
                        </div>
                      )}
                      {analysis.financial_data?.debt_ratio && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">부채비율</div>
                          <div className="text-lg font-semibold">
                            {analysis.financial_data.debt_ratio.toFixed(1)}%
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {analysis.financial_analysis?.summary && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">재무 분석 요약</h4>
                      <p className="text-sm text-gray-700">{analysis.financial_analysis.summary}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}

          {/* 뉴스 분석 상세 */}
          {analysis?.news_analysis && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>뉴스 분석</CardTitle>
                    <CardDescription>
                      최근 뉴스 및 시장 심리 분석
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('news_analysis')}
                  >
                    {expandedSections.news_analysis ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {expandedSections.news_analysis && (
                <CardContent>
                  {/* LLM 의견 추가 */}
                  {analysis.llm_opinions?.news && (
                    <div className="mb-4 p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-900">AI 분석 의견</span>
                      </div>
                      <p className="text-sm text-purple-800">{analysis.llm_opinions.news}</p>
                    </div>
                  )}
                  {/* API의 실제 구조에 맞게 수정 */}
                  {(analysis.news_analysis?.sentiment_data?.news_sentiments?.length > 0 ||
                    analysis.news_analysis?.recent_news?.length > 0 ||
                    analysis.news_analysis?.perplexity_news?.length > 0) && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">최근 주요 뉴스</h4>
                      {/* sentiment_data의 news_sentiments 먼저 표시 */}
                      {(analysis.news_analysis?.sentiment_data?.news_sentiments || []).map((news, index) => (
                        <div key={`sentiment-${index}`} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-sm mb-1">{news.title}</h5>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{news.published_at}</span>
                                <Badge variant="outline" className="text-xs">
                                  {news.sentiment === 'positive' ? '긍정' :
                                   news.sentiment === 'negative' ? '부정' : '중립'}
                                </Badge>
                                {news.confidence && (
                                  <span>신뢰도: {(news.confidence * 100).toFixed(0)}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* 기존 recent_news 표시 (폴백) */}
                      {(analysis.news_analysis?.recent_news || []).slice(0, 5).map((news, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-sm mb-1">{news.title}</h5>
                              {news.summary && (
                                <p className="text-xs text-gray-600 mb-1">{news.summary}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{new Date(news.date).toLocaleDateString('ko-KR')}</span>
                                {news.sentiment && (
                                  <Badge variant="outline" className="text-xs">
                                    {news.sentiment === 'positive' ? '긍정' :
                                     news.sentiment === 'negative' ? '부정' : '중립'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {news.url && (
                              <a
                                href={news.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2"
                              >
                                <ExternalLink className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {(analysis.news_analysis?.sentiment_data?.overall_sentiment ||
                    analysis.news_analysis?.sentiment_summary ||
                    analysis.news_analysis?.summary) && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">시장 심리 분석</h4>
                      <p className="text-sm text-gray-700">
                        전반적인 시장 심리: {analysis.news_analysis?.sentiment_data?.overall_sentiment ||
                                           analysis.news_analysis?.sentiment_summary ||
                                           analysis.news_analysis?.summary}
                      </p>
                      {analysis.news_analysis?.sentiment_data?.sentiment_counts && (
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className="text-green-600">
                            긍정: {analysis.news_analysis.sentiment_data.sentiment_counts.positive || 0}
                          </span>
                          <span className="text-gray-600">
                            중립: {analysis.news_analysis.sentiment_data.sentiment_counts.neutral || 0}
                          </span>
                          <span className="text-red-600">
                            부정: {analysis.news_analysis.sentiment_data.sentiment_counts.negative || 0}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}


          {/* 위험 및 기회 평가 */}
          {(analysis.risk_assessment?.length > 0 || analysis.opportunity_assessment?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.risk_assessment?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-700">위험 요소</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.risk_assessment.map((risk, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {analysis.opportunity_assessment?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700">기회 요소</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.opportunity_assessment.map((opportunity, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* 분석 일시 */}
      {analysis?.analysis_date && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              분석 일시: {new Date(analysis.analysis_date).toLocaleString('ko-KR')}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 보고서 보기 버튼 */}
      {analysis && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Button
                onClick={handleOpenReport}
                variant="outline"
                size="lg"
                className="w-full max-w-md"
              >
                <FileText className="h-5 w-5 mr-2" />
                분석 보고서 보기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 채팅 모달 */}
      <StockChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        stockCode={stockCode}
        stockName={stock?.name}
        analysisData={analysis}
        onRequestStart={(requestId) => setCurrentRequestId(requestId)}
        socket={socket}
        userId={userId}
      />

      {/* 보고서 모달 */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportContent={reportData?.report_content}
        stockCode={stockCode}
        stockName={stock?.name}
        isLoading={reportLoading}
      />
    </div>
  );
};

export default StockDetail;

