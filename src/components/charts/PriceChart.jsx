import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3,
  Target,
  Volume2
} from 'lucide-react';

const PriceChart = ({ stockData, analysisData, className = "" }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [chartType, setChartType] = useState('candlestick');
  const canvasRef = useRef(null);

  // 가격 데이터 포맷팅
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatPercent = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value?.toFixed(2)}%`;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-red-600';
    if (change < 0) return 'text-blue-600';
    return 'text-gray-600';
  };

  // 간단한 캔들스틱 차트 렌더링
  useEffect(() => {
    if (!canvasRef.current || !stockData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // 캔버스 클리어
    ctx.clearRect(0, 0, width, height);

    // 더미 데이터 (실제로는 API에서 가져와야 함)
    const priceData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      open: Math.random() * 10000 + 50000,
      high: Math.random() * 10000 + 55000,
      low: Math.random() * 10000 + 45000,
      close: Math.random() * 10000 + 50000,
      volume: Math.random() * 1000000
    }));

    const maxPrice = Math.max(...priceData.map(d => d.high));
    const minPrice = Math.min(...priceData.map(d => d.low));
    const priceRange = maxPrice - minPrice;

    // 차트 여백
    const margin = { top: 20, right: 60, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // 캔들스틱 그리기
    const candleWidth = chartWidth / priceData.length * 0.8;
    
    priceData.forEach((data, i) => {
      const x = margin.left + (i + 0.5) * chartWidth / priceData.length;
      const openY = margin.top + (maxPrice - data.open) / priceRange * chartHeight;
      const closeY = margin.top + (maxPrice - data.close) / priceRange * chartHeight;
      const highY = margin.top + (maxPrice - data.high) / priceRange * chartHeight;
      const lowY = margin.top + (maxPrice - data.low) / priceRange * chartHeight;

      // 심지 그리기
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // 캔들 바디 그리기
      const isRed = data.close > data.open;
      ctx.fillStyle = isRed ? '#dc2626' : '#2563eb';
      ctx.strokeStyle = isRed ? '#dc2626' : '#2563eb';
      ctx.lineWidth = 1;

      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY);

      ctx.fillRect(x - candleWidth/2, bodyTop, candleWidth, bodyHeight);
      ctx.strokeRect(x - candleWidth/2, bodyTop, candleWidth, bodyHeight);
    });

    // Y축 가격 레이블
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange * i / 5);
      const y = margin.top + chartHeight - (i * chartHeight / 5);
      ctx.fillText(formatPrice(Math.round(price)), margin.left - 10, y + 4);
    }

  }, [stockData, selectedPeriod, chartType]);

  if (!stockData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">차트 데이터를 불러오는 중...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stock = stockData.data?.stock;
  const currentPrice = stock?.current_price || 0;
  const changeAmount = stock?.change_amount || 0;
  const changeRate = stock?.change_rate || 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <span>{stock?.name || '종목명'}</span>
              <Badge variant="outline">{stock?.code || '000000'}</Badge>
            </CardTitle>
            <CardDescription>
              {stock?.market || '시장'} • {stock?.sector || '섹터'}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {formatPrice(currentPrice)}원
            </div>
            <div className={`text-sm font-medium ${getChangeColor(changeAmount)}`}>
              {changeAmount >= 0 ? '+' : ''}{formatPrice(changeAmount)}원 ({formatPercent(changeRate)})
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chart">차트</TabsTrigger>
            <TabsTrigger value="indicators">기술지표</TabsTrigger>
            <TabsTrigger value="volume">거래량</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            {/* 기간 선택 */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {['1D', '1W', '1M', '3M', '6M', '1Y'].map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={chartType === 'candlestick' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('candlestick')}
                >
                  캔들
                </Button>
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('line')}
                >
                  선형
                </Button>
              </div>
            </div>

            {/* 차트 캔버스 */}
            <div className="relative bg-white border rounded-lg p-4">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-64 md:h-80"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </TabsContent>

          <TabsContent value="indicators" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* RSI */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">RSI (14)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">
                        {analysisData?.data?.technical?.rsi?.toFixed(1) || '45.2'}
                      </span>
                      <Badge variant={
                        (analysisData?.data?.technical?.rsi || 45) > 70 ? 'destructive' :
                        (analysisData?.data?.technical?.rsi || 45) < 30 ? 'secondary' : 'outline'
                      }>
                        {(analysisData?.data?.technical?.rsi || 45) > 70 ? '과매수' :
                         (analysisData?.data?.technical?.rsi || 45) < 30 ? '과매도' : '중립'}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((analysisData?.data?.technical?.rsi || 45), 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* MACD */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">MACD</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">
                        {analysisData?.data?.technical?.macd?.toFixed(2) || '12.5'}
                      </span>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-sm text-gray-600">
                      Signal: {analysisData?.data?.technical?.macd_signal?.toFixed(2) || '10.2'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bollinger Bands */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">볼린저 밴드</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>상단:</span>
                      <span className="font-medium">
                        {formatPrice(analysisData?.data?.technical?.bb_upper || currentPrice * 1.05)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>현재:</span>
                      <span className="font-medium">{formatPrice(currentPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>하단:</span>
                      <span className="font-medium">
                        {formatPrice(analysisData?.data?.technical?.bb_lower || currentPrice * 0.95)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="volume" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">거래량 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Volume2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-lg font-bold">
                      {(stock?.volume || 1000000).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">오늘 거래량</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-lg font-bold">
                      {((stock?.volume || 1000000) / (stock?.avg_volume || 800000) * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">평균 대비</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-lg font-bold">
                      {formatPrice((stock?.volume || 1000000) * currentPrice / 1000000)}M
                    </div>
                    <div className="text-sm text-gray-600">거래대금</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PriceChart;