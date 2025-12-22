import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Activity,
  RefreshCw,
} from 'lucide-react';

const MarketData = () => {
  const [selectedStock, setSelectedStock] = useState('005930'); // 삼성전자
  const [timeframe, setTimeframe] = useState('1d');
  const [isLoading, setIsLoading] = useState(false);

  // Mock Korean stock market data
  const [marketData, setMarketData] = useState({
    '005930': { // 삼성전자
      name: '삼성전자',
      price: 71000,
      change_rate: 2.1,
      volume: 15000000,
      high: 72000,
      low: 69500,
      market_cap: '425조원'
    },
    '000660': { // SK하이닉스
      name: 'SK하이닉스',
      price: 128000,
      change_rate: -1.5,
      volume: 8500000,
      high: 132000,
      low: 127000,
      market_cap: '93조원'
    },
    '035420': { // NAVER
      name: 'NAVER',
      price: 185000,
      change_rate: 3.2,
      volume: 2100000,
      high: 188000,
      low: 180000,
      market_cap: '30조원'
    },
    '207940': { // 삼성바이오로직스
      name: '삼성바이오로직스',
      price: 785000,
      change_rate: 1.8,
      volume: 150000,
      high: 795000,
      low: 770000,
      market_cap: '112조원'
    }
  });

  // Mock chart data generator
  const generateChartData = () => {
    const data = [];
    const basePrice = marketData[selectedStock].price;
    const timePoints = timeframe === '1d' ? 24 : timeframe === '1w' ? 7 : 30;
    
    for (let i = timePoints - 1; i >= 0; i--) {
      const variation = (Math.random() - 0.5) * 0.04; // 4% variation
      const price = basePrice * (1 + variation);
      
      let timeLabel;
      if (timeframe === '1d') {
        timeLabel = new Date(Date.now() - i * 60 * 60 * 1000).toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else if (timeframe === '1w') {
        timeLabel = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR', { 
          month: 'short', 
          day: 'numeric' 
        });
      } else {
        timeLabel = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
      
      data.push({
        time: timeLabel,
        price: price,
        volume: Math.random() * 1000000
      });
    }
    return data;
  };

  const [chartData, setChartData] = useState(generateChartData());

  useEffect(() => {
    setChartData(generateChartData());
  }, [selectedStock, timeframe]);

  const formatKoreanCurrency = (amount) => {
    return amount.toLocaleString() + '원';
  };

  const formatVolume = (volume) => {
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}백만주`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}천주`;
    return `${volume}주`;
  };

  const stocks = [
    { code: '005930', name: '삼성전자' },
    { code: '000660', name: 'SK하이닉스' },
    { code: '035420', name: 'NAVER' },
    { code: '207940', name: '삼성바이오로직스' }
  ];
  
  const timeframes = [
    { value: '1d', label: '1일' },
    { value: '1w', label: '1주' },
    { value: '1m', label: '1개월' },
    { value: '3m', label: '3개월' }
  ];

  const currentData = marketData[selectedStock];
  const isPositive = currentData.change_rate >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <span>시장 데이터</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 1000);
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>
          실시간 한국 주식 시장 데이터 및 차트
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stock Selection */}
        <div className="flex flex-wrap gap-2">
          {stocks.map((stock) => (
            <Button
              key={stock.code}
              variant={selectedStock === stock.code ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStock(stock.code)}
              className="text-xs"
            >
              {stock.name}
            </Button>
          ))}
        </div>

        {/* Current Price */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">현재가</div>
            <div className="text-2xl font-bold">{formatKoreanCurrency(currentData.price)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">등락률</div>
            <div className={`text-lg font-bold flex items-center space-x-1 ${isPositive ? 'text-red-600' : 'text-blue-600'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{isPositive ? '+' : ''}{currentData.change_rate.toFixed(2)}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">고가</div>
            <div className="text-lg font-bold text-red-600">{formatKoreanCurrency(currentData.high)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">저가</div>
            <div className="text-lg font-bold text-blue-600">{formatKoreanCurrency(currentData.low)}</div>
          </div>
        </div>

        {/* Volume and Market Info */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">거래량</div>
            <div className="text-lg font-bold">{formatVolume(currentData.volume)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">시가총액</div>
            <div className="text-lg font-bold">{currentData.market_cap}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">시장 상태</div>
            <Badge variant="default" className="w-fit">
              <Activity className="h-3 w-3 mr-1" />
              개장
            </Badge>
          </div>
        </div>

        {/* Chart */}
        <Tabs value={timeframe} onValueChange={setTimeframe}>
          <TabsList className="grid w-full grid-cols-4">
            {timeframes.map((tf) => (
              <TabsTrigger key={tf.value} value={tf.value}>{tf.label}</TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={timeframe} className="mt-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis 
                    domain={['dataMin - 1000', 'dataMax + 1000']}
                    tickFormatter={(value) => `${Math.round(value / 1000)}K`}
                  />
                  <Tooltip 
                    formatter={(value) => [formatKoreanCurrency(Math.round(value)), '주가']}
                    labelStyle={{ color: '#000' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke={isPositive ? '#dc2626' : '#2563eb'} 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Technical Indicators */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">기술적 지표</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg border">
              <div className="text-sm text-muted-foreground">RSI (14)</div>
              <div className="text-lg font-bold">52.3</div>
              <Badge variant="outline" className="text-xs">중립</Badge>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-sm text-muted-foreground">MACD</div>
              <div className="text-lg font-bold text-red-600">+345</div>
              <Badge variant="default" className="text-xs bg-red-600">상승</Badge>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-sm text-muted-foreground">이평선 (20일)</div>
              <div className="text-lg font-bold">{formatKoreanCurrency(Math.round(currentData.price * 0.98))}</div>
              <Badge variant="outline" className="text-xs">상회</Badge>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-sm text-muted-foreground">거래량</div>
              <div className="text-lg font-bold text-blue-600">높음</div>
              <Badge variant="default" className="text-xs">활발</Badge>
            </div>
          </div>
        </div>

        {/* KOSPI/KOSDAQ Index */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">주요 지수</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">KOSPI</div>
                  <div className="text-lg font-bold">2,485.67</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-red-600">+15.23</div>
                  <div className="text-sm text-red-600">+0.62%</div>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">KOSDAQ</div>
                  <div className="text-lg font-bold">745.23</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600">-3.45</div>
                  <div className="text-sm text-blue-600">-0.46%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">시장 현황</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-sm text-green-700 dark:text-green-300">상승</div>
              <div className="text-lg font-bold text-green-600">1,245</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="text-sm text-red-700 dark:text-red-300">하락</div>
              <div className="text-lg font-bold text-red-600">856</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="text-sm text-gray-700 dark:text-gray-300">보합</div>
              <div className="text-lg font-bold text-gray-600">432</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="text-sm text-blue-700 dark:text-blue-300">거래정지</div>
              <div className="text-lg font-bold text-blue-600">23</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketData;