import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { stockAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import StockSearch from '../components/search/StockSearch';
import WorkflowAnalysisModal from '../components/analysis/WorkflowAnalysisModal';
import { initSocket } from '../utils/socket';
import { getUserIdFromToken } from '../lib/auth';
import {
  Search,
  TrendingUp,
  BarChart3,
  Loader2,
  RefreshCw,
  AlertCircle,
  Eye,
  Play,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';

const StockList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('market_cap'); // market_cap, name, code, change_rate
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [marketFilter, setMarketFilter] = useState('all'); // F-7: 시장 필터 (all, kospi, kosdaq)
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // F-4: 백그라운드 업데이트 상태

  // F-8: 추가 필터 상태
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false); // 상세 필터 표시 여부
  const [changeFilter, setChangeFilter] = useState('all'); // all, rising, falling
  const [marketCapMin, setMarketCapMin] = useState('');
  const [marketCapMax, setMarketCapMax] = useState('');
  const [volumeMin, setVolumeMin] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [analyzingStocks, setAnalyzingStocks] = useState(new Set()); // 분석 중인 종목 코드 추적
  const [lastAnalyzedStock, setLastAnalyzedStock] = useState(null); // 마지막 분석 종목
  const [lastAnalysisRequestId, setLastAnalysisRequestId] = useState(null); // 마지막 request ID
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false); // Workflow Modal 상태
  const [socket, setSocket] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // WebSocket 초기화
  useEffect(() => {
    const userId = getUserIdFromToken();
    if (userId) {
      const socketInstance = initSocket();
      setSocket(socketInstance);

      return () => {
        if (socketInstance) {
          socketInstance.disconnect();
        }
      };
    }
  }, []);

  // 주식 목록 조회
  const {
    data: stocksData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['stocks', {
      page: currentPage,
      per_page: 20,
      search: searchTerm,
      sort_by: sortBy,
      sort_order: sortOrder,
      market: marketFilter,
      change_type: changeFilter,
      market_cap_min: marketCapMin,
      market_cap_max: marketCapMax,
      volume_min: volumeMin,
      sector: sectorFilter
    }],
    
    queryFn: () => stockAPI.getStocks({
      page: currentPage,
      per_page: 20,
      search: searchTerm,
      sort_by: sortBy,
      sort_order: sortOrder,
      market: marketFilter,
      // F-8: 추가 필터 파라미터
      change_type: changeFilter,
      market_cap_min: marketCapMin ? parseFloat(marketCapMin) * 100000000 : undefined, // 억원 -> 원
      market_cap_max: marketCapMax ? parseFloat(marketCapMax) * 100000000 : undefined,
      volume_min: volumeMin ? parseInt(volumeMin) * 10000 : undefined, // 만주 -> 주
      sector: sectorFilter
    }),
  });

  // 관심종목 목록 조회
  const { data: watchlistData } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => stockAPI.watchlist.getList(),
  });

  // 관심종목 추가/제거 mutation
  const toggleWatchlistMutation = useMutation({
    mutationFn: async (stockCode) => {
      const inList = watchlistData?.watchlist?.some((item) => item.stock_code === stockCode);
      return inList
        ? stockAPI.watchlist.remove(stockCode)
        : stockAPI.watchlist.add(stockCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
    onError: (err) => {
      console.error('[watchlist] toggle failed:', err);
      // TODO: toast/alert로 사용자 피드백
    },
  });

  // 종목 분석 실행
  const analyzeStockMutation = useMutation({
    // React Query 재시도 비활성화 - 분석은 한 번만 실행되어야 함
    retry: false,
    // 오래 걸리는 분석 작업을 위한 타임아웃 설정 없음
    mutationFn: async (stockCode) => {
      // 분석 시작 시 해당 종목을 분석 중 목록에 추가
      setAnalyzingStocks(prev => new Set([...prev, stockCode]));

      // 분석 요청 ID 생성 (WebSocket 추적용) - 한 번만 생성
      const requestId = `analysis_${stockCode}_${Date.now()}`;

      // 모달 데이터 및 상태 저장
      setLastAnalyzedStock(stockCode);
      setLastAnalysisRequestId(requestId);
      setIsWorkflowModalOpen(true); // Workflow Modal 자동으로 열기

      console.log(`[StockList] Starting analysis with request_id: ${requestId}`);

      return stockAPI.analyzeStock(stockCode, requestId);
    },
    onSuccess: (data, stockCode) => {
      // 분석 완료 후 충분한 대기 시간 확보 (최소 2초)
      setTimeout(() => {
        // invalidateQueries로 데이터 자동 갱신 (refetch 제거로 페이지 리프레시 방지)
        queryClient.invalidateQueries(['stocks']);
        queryClient.invalidateQueries(['stock-analysis', stockCode]);

        // 분석 완료 후 해당 종목을 분석 중 목록에서 제거
        setAnalyzingStocks(prev => {
          const next = new Set(prev);
          next.delete(stockCode);
          return next;
        });

        // 모달은 열려있는 상태로 유지 (사용자가 수동으로 닫을 수 있음)
      }, 2000);
    },
    onError: (error, stockCode) => {
      // 에러 발생 시에도 분석 중 목록에서 제거
      setAnalyzingStocks(prev => {
        const next = new Set(prev);
        next.delete(stockCode);
        return next;
      });
      // 에러 시에도 모달은 유지 (에러 메시지 확인 가능)
    },
  });

  // 분석 데이터가 당일 것인지 확인하는 헬퍼 함수
  const parseLocalDate = (v) => {
    if (!v) return null;
    // "YYYY-MM-DD" 형태면 로컬 날짜로 강제
    const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const d = new Date(v);
    return Number.isFinite(d.getTime()) ? d : null;
  };

  const isAnalysisFromToday = (analysisDate) => {
    const analysisDt = parseLocalDate(analysisDate);
    if (!analysisDt) return false;
    const today = new Date();
    return (
      analysisDt.getFullYear() === today.getFullYear() &&
      analysisDt.getMonth() === today.getMonth() &&
      analysisDt.getDate() === today.getDate()
    );
  };

  // 관심종목 여부 확인 헬퍼 함수
  const isInWatchlist = (stockCode) => {
    return watchlistData?.watchlist?.some(
      item => item.stock_code === stockCode
    ) || false;
  };

  // 관심종목 토글 핸들러
  const handleToggleWatchlist = (e, stockCode) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지
    toggleWatchlistMutation.mutate(stockCode);
  };

  // 초기 데이터 수집 mutation
  const initializeStocksMutation = useMutation({
    mutationFn: (params) => stockAPI.initializeStocks(params),
    onSuccess: () => {
      queryClient.invalidateQueries(['stocks']);
      setIsInitializing(false);
    },
    onError: () => {
      setIsInitializing(false);
    },
  });

  const stocks = stocksData?.data?.stocks || [];
  const pagination = stocksData?.data?.pagination || {};
  const totalCount = pagination.total || 0;
  const totalPages = pagination.pages || 1;

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // refetch 제거: queryKey 변화로 자동 조회
  };



  const handleAnalyze = (stockCode) => {
    // 이미 분석 중이거나 mutation이 진행 중이면 무시
    if (analyzingStocks.has(stockCode) || analyzeStockMutation.isPending) {
      console.log(`[StockList] Analysis already in progress for ${stockCode}, ignoring duplicate request`);
      return;
    }

    console.log(`[StockList] Triggering analysis for ${stockCode}`);
    analyzeStockMutation.mutate(stockCode);
  };

  const handleQuickSearchResult = (stock) => {
    // 검색된 종목이 DB에 없으면 자동으로 수집 및 분석
    navigate(`/stocks/${stock.code}`);
  };

  const handleInitializeStocks = async (limit = 50) => {
    setIsInitializing(true);
    try {
      await initializeStocksMutation.mutateAsync({
        market: 'total',
        limit,
        analyze: false
      });
    } catch (error) {
      console.error('Failed to initialize stocks:', error);
    }
  };

  // F-4: 전체 시장 종목 백그라운드 업데이트
  const handleBulkUpdate = async (market = 'all') => {
    setIsUpdating(true);
    try {
      const result = await stockAPI.bulkUpdateStocks({ market, force_update: false });
      console.log('[F-4] Bulk update started:', result);

      // 5초 후 로딩 상태 해제 및 목록 새로고침
      setTimeout(() => {
        setIsUpdating(false);
        refetch();
      }, 5000);
    } catch (error) {
      console.error('[F-4] Failed to start bulk update:', error);
      setIsUpdating(false);
    }
  };

  // F-8: 필터 초기화
  const handleResetFilters = () => {
    setChangeFilter('all');
    setMarketCapMin('');
    setMarketCapMax('');
    setVolumeMin('');
    setSectorFilter('');
    setCurrentPage(1);
  };

  const getMarketColor = (market) => {
    switch (market) {
      case 'KOSPI': return 'bg-blue-100 text-blue-800';
      case 'KOSDAQ': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">주식 목록</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">데이터를 불러올 수 없습니다</h3>
                <p className="text-gray-500 mb-4">
                  서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.
                </p>
                <Button onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  다시 시도
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 메인 컨텐츠 영역 - 항상 전체 너비 유지 */}
      <div className="space-y-6 w-full">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">주식 목록</h1>
          <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowQuickSearch(!showQuickSearch)}
          >
            <Search className="h-4 w-4 mr-2" />
            빠른 검색
          </Button>
          <Button onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </div>

      {/* 빠른 검색 */}
      {showQuickSearch && (
        <StockSearch onResultClick={handleQuickSearchResult} />
      )}

      {/* F-7: 시장 필터 버튼 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>시장 선택</CardTitle>
              <CardDescription>
                KOSPI와 KOSDAQ 시장을 선택하여 종목을 필터링할 수 있습니다
              </CardDescription>
            </div>
            {/* F-4: 백그라운드 업데이트 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkUpdate(marketFilter)}
              disabled={isUpdating}
              className="ml-4"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  업데이트 중...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  전체 종목 가져오기
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={marketFilter === 'all' ? 'default' : 'outline'}
              onClick={() => {
                setMarketFilter('all');
                setCurrentPage(1); // 페이지 초기화
              }}
              className={marketFilter === 'all' ? 'bg-gray-900 hover:bg-gray-800' : ''}
            >
              전체
            </Button>
            <Button
              variant={marketFilter === 'kospi' ? 'default' : 'outline'}
              onClick={() => {
                setMarketFilter('kospi');
                setCurrentPage(1); // 페이지 초기화
              }}
              className={marketFilter === 'kospi' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}
            >
              KOSPI
            </Button>
            <Button
              variant={marketFilter === 'kosdaq' ? 'default' : 'outline'}
              onClick={() => {
                setMarketFilter('kosdaq');
                setCurrentPage(1); // 페이지 초기화
              }}
              className={marketFilter === 'kosdaq' ? 'bg-green-600 hover:bg-green-700' : 'border-green-300 text-green-700 hover:bg-green-50'}
            >
              KOSDAQ
            </Button>
          </div>
          {isUpdating && (
            <div className="mt-3 text-sm text-blue-700 flex items-center">
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              백그라운드에서 {marketFilter === 'all' ? '전체 시장' : marketFilter.toUpperCase()} 종목을 업데이트하고 있습니다...
            </div>
          )}
        </CardContent>
      </Card>

      {/* F-8: 추가 필터 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle>상세 필터</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="p-1 h-auto"
                >
                  {showAdvancedFilters ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <CardDescription>
                등락, 시가총액, 거래량, 업종별로 필터링할 수 있습니다
              </CardDescription>
            </div>
            {showAdvancedFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                필터 초기화
              </Button>
            )}
          </div>
        </CardHeader>
        {showAdvancedFilters && (
          <CardContent>
            <div className="space-y-4">
            {/* 등락 필터 */}
            <div>
              <label className="text-sm font-medium mb-2 block">등락 구분</label>
              <div className="flex gap-2">
                <Button
                  variant={changeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setChangeFilter('all');
                    setCurrentPage(1);
                  }}
                >
                  전체
                </Button>
                <Button
                  variant={changeFilter === 'rising' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setChangeFilter('rising');
                    setCurrentPage(1);
                  }}
                  className={changeFilter === 'rising' ? 'bg-red-600 hover:bg-red-700' : 'border-red-300 text-red-700 hover:bg-red-50'}
                >
                  상승
                </Button>
                <Button
                  variant={changeFilter === 'falling' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setChangeFilter('falling');
                    setCurrentPage(1);
                  }}
                  className={changeFilter === 'falling' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}
                >
                  하락
                </Button>
              </div>
            </div>

            {/* 시가총액 필터 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">시가총액 최소 (억원)</label>
                <Input
                  type="number"
                  placeholder="예: 1000"
                  value={marketCapMin}
                  onChange={(e) => {
                    setMarketCapMin(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">시가총액 최대 (억원)</label>
                <Input
                  type="number"
                  placeholder="예: 100000"
                  value={marketCapMax}
                  onChange={(e) => {
                    setMarketCapMax(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* 거래량 & 업종 필터 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">최소 거래량 (만주)</label>
                <Input
                  type="number"
                  placeholder="예: 100"
                  value={volumeMin}
                  onChange={(e) => {
                    setVolumeMin(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">업종</label>
                <Input
                  type="text"
                  placeholder="예: 반도체"
                  value={sectorFilter}
                  onChange={(e) => {
                    setSectorFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
          </CardContent>
        )}
      </Card>

      {/* 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>종목 검색</CardTitle>
          <CardDescription>
            종목명 또는 종목코드로 검색할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="종목명 또는 종목코드 입력..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                검색
              </Button>
            </div>
            <div className="flex space-x-2 text-sm">
              <span className="text-gray-500">정렬:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="market_cap">시가총액</option>
                <option value="name">종목명</option>
                <option value="code">종목코드</option>
                <option value="change_rate">변동률</option>
                <option value="per">PER</option>
                <option value="pbr">PBR</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="desc">내림차순</option>
                <option value="asc">오름차순</option>
              </select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 주식 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>종목 목록</CardTitle>
              <CardDescription>
                총 {totalCount.toLocaleString()}개 종목
              </CardDescription>
            </div>
            {totalCount === 0 && !isLoading && (
              <Button
                onClick={() => handleInitializeStocks(50)}
                disabled={isInitializing}
                variant="outline"
                size="sm"
              >
                {isInitializing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                시가총액 상위 종목 가져오기
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading || isInitializing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-gray-500">
                {isInitializing ? '종목 데이터를 수집하고 있습니다...' : '데이터를 불러오는 중...'}
              </p>
            </div>
          ) : stocks.length > 0 ? (
            <div className="space-y-4">
              {stocks.map((stock) => (
                <div key={stock.code} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {stock.name}
                        </h3>
                        <button
                          onClick={(e) => handleToggleWatchlist(e, stock.code)}
                          className="hover:scale-110 transition-transform"
                          disabled={toggleWatchlistMutation.isPending}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              isInWatchlist(stock.code)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-400 hover:text-yellow-400'
                            }`}
                          />
                        </button>
                        <Badge className={getMarketColor(stock.market)}>
                          {stock.market}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {stock.code}
                        </span>
                        {stock.market_cap_rank && stock.market_cap_rank <= 10 && (
                          <Badge variant="destructive">
                            TOP {stock.market_cap_rank}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <span>섹터: {stock.sector || '미분류'}</span>
                        {stock.market_cap && (
                          <span>
                            시가총액: {(stock.market_cap / 100000000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}억원
                          </span>
                        )}
                        {stock.current_price && (
                          <span>
                            현재가: {stock.current_price.toLocaleString()}원
                          </span>
                        )}
                        {stock.change_rate !== null && stock.change_rate !== undefined && (
                          <span className={stock.change_rate >= 0 ? 'text-red-600' : 'text-blue-600'}>
                            변동률: {stock.change_rate >= 0 ? '+' : ''}{Number(stock.change_rate).toFixed(2)}%
                          </span>
                        )}
                        {stock.per && (
                          <span>PER: {stock.per.toFixed(1)}</span>
                        )}
                        {stock.pbr && (
                          <span>PBR: {stock.pbr.toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* 당일 분석 데이터가 있는 경우에만 상세보기 활성화 */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!isAnalysisFromToday(stock.analysis_date) || analyzingStocks.has(stock.code)}
                        asChild={isAnalysisFromToday(stock.analysis_date) && !analyzingStocks.has(stock.code)}
                      >
                        {isAnalysisFromToday(stock.analysis_date) && !analyzingStocks.has(stock.code) ? (
                          <Link to={`/stocks/${stock.code}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            상세보기
                          </Link>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            상세보기
                          </>
                        )}
                      </Button>

                      {/* 분석 버튼 - 분석 중인 경우 로딩 표시 */}
                      <Button
                        size="sm"
                        onClick={() => handleAnalyze(stock.code)}
                        disabled={analyzingStocks.has(stock.code)}
                      >
                        {analyzingStocks.has(stock.code) ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            분석중
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            분석
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-500 mb-4">
                다른 검색어로 시도해보세요.
              </p>
              <p className="text-sm text-gray-500">
                찾으시는 종목이 없다면 종목 코드를 직접 입력하여 수집할 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">종목 데이터가 없습니다</h3>
              <p className="text-gray-500 mb-4">
                시가총액 상위 종목을 가져와서 시작하세요.
              </p>
              <div className="flex justify-center space-x-2">
                <Button
                  onClick={() => handleInitializeStocks(10)}
                  disabled={isInitializing}
                >
                  {isInitializing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  상위 10개 종목
                </Button>
                <Button
                  onClick={() => handleInitializeStocks(50)}
                  disabled={isInitializing}
                  variant="outline"
                >
                  상위 50개 종목
                </Button>
                <Button
                  onClick={() => handleInitializeStocks(100)}
                  disabled={isInitializing}
                  variant="outline"
                >
                  상위 100개 종목
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            이전
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={isLoading}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || isLoading}
          >
            다음
          </Button>
        </div>
      )}
      </div>

      {/* Workflow 분석 모달 */}
      {isWorkflowModalOpen && socket && lastAnalysisRequestId && (
        <WorkflowAnalysisModal
          isOpen={isWorkflowModalOpen}
          onClose={() => setIsWorkflowModalOpen(false)}
          socket={socket}
          requestId={lastAnalysisRequestId}
          userId={getUserIdFromToken()}
          stockCode={lastAnalyzedStock}
        />
      )}
    </div>
  );
};

export default StockList;