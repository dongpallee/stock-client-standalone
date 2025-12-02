import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { stockAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Star,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react';

const Watchlist = () => {
  const queryClient = useQueryClient();

  // 관심종목 목록 조회
  const {
    data: watchlistData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => stockAPI.watchlist.getList(),
  });

  // 관심종목 제거
  const removeFromWatchlistMutation = useMutation({
    mutationFn: (stockCode) => stockAPI.watchlist.remove(stockCode),
    onSuccess: () => {
      queryClient.invalidateQueries(['watchlist']);
    },
  });

  const watchlist = watchlistData?.watchlist || [];

  const handleRemove = (stockCode) => {
    if (window.confirm('관심종목에서 제거하시겠습니까?')) {
      removeFromWatchlistMutation.mutate(stockCode);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">관심종목</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">데이터를 불러올 수 없습니다</h3>
                <p className="text-gray-500">
                  관심종목 목록을 불러오는 중 오류가 발생했습니다.
                </p>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">관심종목</h1>
          <p className="text-gray-500 mt-1">
            관심있는 종목들을 관리하고 분석 결과를 확인하세요
          </p>
        </div>
        <Button asChild>
          <Link to="/stocks">
            <Plus className="h-4 w-4 mr-2" />
            종목 추가
          </Link>
        </Button>
      </div>

      {/* 관심종목 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            내 관심종목
          </CardTitle>
          <CardDescription>
            {watchlist.length}개의 관심종목이 등록되어 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : watchlist.length > 0 ? (
            <div className="space-y-4">
              {watchlist.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.stock_name}
                      </h3>
                      <Badge className={getMarketColor(item.market)}>
                        {item.market}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {item.stock_code}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>섹터: {item.sector || '미분류'}</span>
                      <span>
                        추가일: {new Date(item.added_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    
                    {item.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        메모: {item.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link to={`/stocks/${item.stock_code}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        상세보기
                      </Link>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(item.stock_code)}
                      disabled={removeFromWatchlistMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {removeFromWatchlistMutation.isPending && removeFromWatchlistMutation.variables === item.stock_code ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">관심종목이 없습니다</h3>
              <p className="text-gray-500 mb-4">
                관심있는 종목을 추가하여 쉽게 관리해보세요.
              </p>
              <Button asChild>
                <Link to="/stocks">
                  <Plus className="h-4 w-4 mr-2" />
                  첫 번째 종목 추가하기
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 도움말 */}
      <Card>
        <CardHeader>
          <CardTitle>관심종목 활용 팁</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📊 분석 추적</h4>
              <p className="text-gray-600">
                관심종목의 분석 결과 변화를 지속적으로 추적할 수 있습니다.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">⭐ 빠른 접근</h4>
              <p className="text-gray-600">
                자주 확인하는 종목들을 관심종목에 추가하여 빠르게 접근하세요.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📝 메모 기능</h4>
              <p className="text-gray-600">
                각 종목에 대한 개인적인 메모를 추가할 수 있습니다.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🔄 실시간 업데이트</h4>
              <p className="text-gray-600">
                새로운 분석 결과가 나오면 관심종목에서 바로 확인 가능합니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Watchlist;

