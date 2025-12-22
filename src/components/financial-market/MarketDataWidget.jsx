/**
 * 금융시장 데이터 위젯 컴포넌트
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  RefreshCw,
  Globe,
  Banknote,
  Clock
} from 'lucide-react';

import { financialMarketAPI, queryKeys } from '@/lib/api';

const MarketDataWidget = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // 금융시장 데이터 조회
  const { data: marketData, isLoading, refetch } = useQuery({
    queryKey: [queryKeys.financialMarketData, refreshKey],
    queryFn: financialMarketAPI.getData,
    refetchInterval: 300000, // 5분마다 자동 갱신
    staleTime: 300000
  });

  const handleRefresh = async () => {
    try {
      await financialMarketAPI.refresh();
      setRefreshKey(prev => prev + 1);
      refetch();
    } catch (error) {
      console.error('데이터 갱신 실패:', error);
    }
  };

  const formatCurrency = (value, currency = 'KRW') => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'KRW' ? 0 : 2,
      maximumFractionDigits: currency === 'KRW' ? 0 : 4
    }).format(value);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  const getTrendColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getLastUpdated = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>금융시장 데이터</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>데이터를 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const exchangeRates = marketData?.exchange_rates || [];
  const interestRates = marketData?.interest_rates || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>금융시장 데이터</span>
          </div>

          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="exchange" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="exchange">환율</TabsTrigger>
            <TabsTrigger value="interest">금리</TabsTrigger>
          </TabsList>

          {/* 환율 탭 */}
          <TabsContent value="exchange" className="space-y-4">
            {exchangeRates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-8 w-8 mx-auto mb-2" />
                <p>환율 데이터가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exchangeRates.slice(0, 6).map((rate, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{rate.currency}</div>
                        <div className="text-sm text-muted-foreground">
                          {rate.currency_name || rate.currency}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">
                          {formatCurrency(rate.rate)}
                        </span>
                        {getTrendIcon(rate.change_rate)}
                      </div>
                      <div className={`text-sm ${getTrendColor(rate.change_rate)}`}>
                        {formatPercentage(rate.change_rate)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* 업데이트 시간 */}
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    업데이트: {getLastUpdated(exchangeRates[0]?.last_updated || marketData?.last_updated)}
                  </span>
                </div>
              </div>
            )}
          </TabsContent>

          {/* 금리 탭 */}
          <TabsContent value="interest" className="space-y-4">
            <div className="space-y-4">
              {/* 대출금리 */}
              {interestRates.loan_rate && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Banknote className="h-5 w-5 text-primary" />
                      <span className="font-medium">수출입은행 대출금리</span>
                    </div>
                    <Badge variant="outline">{interestRates.loan_rate}%</Badge>
                  </div>
                  <Progress value={interestRates.loan_rate * 10} className="h-2" />
                </div>
              )}

              {/* 국제금리 */}
              {interestRates.international_rates && Object.keys(interestRates.international_rates).length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>국제금리</span>
                  </h4>
                  {Object.entries(interestRates.international_rates).map(([rateName, rateValue]) => (
                    <div
                      key={rateName}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{rateName}</div>
                        <div className="text-sm text-muted-foreground">
                          {rateName === 'LIBOR' && 'London Interbank Offered Rate'}
                          {rateName === 'SOFR' && 'Secured Overnight Financing Rate'}
                          {rateName === 'EURIBOR' && 'Euro Interbank Offered Rate'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{rateValue}%</div>
                        <Progress value={rateValue * 10} className="h-1 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 업데이트 시간 */}
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  업데이트: {getLastUpdated(interestRates.last_updated || marketData?.last_updated)}
                </span>
              </div>

              {/* 금리 인사이트 */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-900 mb-2">💡 금리 인사이트</h5>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• 금리 상승 시: 은행주 긍정적, 성장주 부정적</p>
                  <p>• 금리 하락 시: 부동산/건설주 긍정적, 금융주 부정적</p>
                  <p>• 국제금리 차이는 자본 유출입에 영향</p>
                </div>
              </div>

              {Object.keys(interestRates).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Percent className="h-8 w-8 mx-auto mb-2" />
                  <p>금리 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MarketDataWidget;