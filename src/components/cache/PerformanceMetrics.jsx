/**
 * 성능 메트릭 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Activity,
  Clock,
  Zap,
  Database,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw
} from 'lucide-react';

import { cacheAPI, queryKeys } from '@/lib/api';

const PerformanceMetrics = () => {
  const [timeRange, setTimeRange] = useState('1h');
  const [metricType, setMetricType] = useState('overview');
  const [performanceData, setPerformanceData] = useState([]);
  const [aggregatedStats, setAggregatedStats] = useState({});

  // 캐시 통계 조회
  const { data: cacheStats, refetch } = useQuery({
    queryKey: [queryKeys.cacheStats, timeRange],
    queryFn: () => cacheAPI.getStats({ timeRange }),
    refetchInterval: 10000,
    onSuccess: (data) => {
      // 성능 데이터 시뮬레이션 (실제로는 백엔드에서 제공)
      generatePerformanceData(data);
    }
  });

  // 성능 데이터 생성 (시뮬레이션)
  const generatePerformanceData = (stats) => {
    const now = new Date();
    const points = timeRange === '1h' ? 60 : timeRange === '24h' ? 24 : 7;
    const interval = timeRange === '1h' ? 60000 : timeRange === '24h' ? 3600000 : 86400000;

    const data = Array.from({ length: points }, (_, i) => {
      const time = new Date(now.getTime() - (points - i - 1) * interval);
      const baseHitRate = 85 + Math.random() * 10;
      const baseResponseTime = 50 + Math.random() * 30;
      const baseThroughput = 800 + Math.random() * 400;

      return {
        time: time.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          ...(timeRange !== '1h' && { month: '2-digit', day: '2-digit' })
        }),
        timestamp: time.getTime(),
        hitRate: Math.max(0, Math.min(100, baseHitRate + (Math.random() - 0.5) * 5)),
        responseTime: Math.max(10, baseResponseTime + (Math.random() - 0.5) * 20),
        throughput: Math.max(100, baseThroughput + (Math.random() - 0.5) * 200),
        memoryUsage: 60 + Math.random() * 30,
        cpuUsage: 20 + Math.random() * 40,
        networkIO: Math.random() * 1000,
        diskIO: Math.random() * 500
      };
    });

    setPerformanceData(data);

    // 집계 통계 계산
    const hitRates = data.map(d => d.hitRate);
    const responseTimes = data.map(d => d.responseTime);
    const throughputs = data.map(d => d.throughput);

    setAggregatedStats({
      avgHitRate: hitRates.reduce((a, b) => a + b, 0) / hitRates.length,
      maxHitRate: Math.max(...hitRates),
      minHitRate: Math.min(...hitRates),
      avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      maxResponseTime: Math.max(...responseTimes),
      minResponseTime: Math.min(...responseTimes),
      avgThroughput: throughputs.reduce((a, b) => a + b, 0) / throughputs.length,
      maxThroughput: Math.max(...throughputs),
      minThroughput: Math.min(...throughputs),
      trend: calculateTrend(data)
    });
  };

  const calculateTrend = (data) => {
    if (data.length < 2) return 'stable';

    const recent = data.slice(-10);
    const earlier = data.slice(-20, -10);

    const recentAvg = recent.reduce((a, b) => a + b.hitRate, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b.hitRate, 0) / earlier.length;

    const diff = recentAvg - earlierAvg;

    if (diff > 2) return 'improving';
    if (diff < -2) return 'declining';
    return 'stable';
  };

  const formatNumber = (num, decimals = 1) => {
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTrendBadge = (trend) => {
    switch (trend) {
      case 'improving':
        return <Badge variant="default" className="bg-green-500">개선</Badge>;
      case 'declining':
        return <Badge variant="destructive">악화</Badge>;
      default:
        return <Badge variant="secondary">안정</Badge>;
    }
  };

  // 파이 차트 데이터
  const pieData = [
    { name: '캐시 히트', value: aggregatedStats.avgHitRate || 0, color: '#10b981' },
    { name: '캐시 미스', value: 100 - (aggregatedStats.avgHitRate || 0), color: '#ef4444' }
  ];

  const memoryData = [
    { name: '사용중', value: 65, color: '#3b82f6' },
    { name: '여유', value: 35, color: '#e5e7eb' }
  ];

  return (
    <div className="space-y-6">
      {/* 제어 패널 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>성능 메트릭</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getTrendIcon(aggregatedStats.trend)}
                {getTrendBadge(aggregatedStats.trend)}
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">최근 1시간</SelectItem>
                  <SelectItem value="24h">최근 24시간</SelectItem>
                  <SelectItem value="7d">최근 7일</SelectItem>
                </SelectContent>
              </Select>
              <Select value={metricType} onValueChange={setMetricType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">개요</SelectItem>
                  <SelectItem value="performance">성능</SelectItem>
                  <SelectItem value="resource">리소스</SelectItem>
                  <SelectItem value="distribution">분포</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 요약 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(aggregatedStats.avgHitRate || 0)}%
              </div>
              <div className="text-sm text-muted-foreground">평균 히트율</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(aggregatedStats.avgResponseTime || 0)}ms
              </div>
              <div className="text-sm text-muted-foreground">평균 응답시간</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(aggregatedStats.avgThroughput || 0, 0)}
              </div>
              <div className="text-sm text-muted-foreground">평균 처리량/초</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {performanceData.length}
              </div>
              <div className="text-sm text-muted-foreground">데이터 포인트</div>
            </div>
          </div>

          {/* 차트 영역 */}
          {metricType === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium mb-4">히트율 추이</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value) => [`${formatNumber(value)}%`, '히트율']}
                      labelFormatter={(label) => `시간: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="hitRate"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-4">응답시간 & 처리량</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#3b82f6"
                      name="응답시간 (ms)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="throughput"
                      stroke="#8b5cf6"
                      name="처리량 (req/s)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {metricType === 'performance' && (
            <div>
              <h4 className="text-lg font-medium mb-4">성능 지표 비교</h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceData.slice(-10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hitRate" fill="#10b981" name="히트율 %" />
                  <Bar dataKey="responseTime" fill="#3b82f6" name="응답시간 ms" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {metricType === 'resource' && (
            <div>
              <h4 className="text-lg font-medium mb-4">리소스 사용률</h4>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${formatNumber(value)}%`, '']} />
                  <Area
                    type="monotone"
                    dataKey="memoryUsage"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    name="메모리 사용률"
                  />
                  <Area
                    type="monotone"
                    dataKey="cpuUsage"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    name="CPU 사용률"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {metricType === 'distribution' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
                  <PieChartIcon className="h-5 w-5" />
                  <span>캐시 히트율 분포</span>
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${formatNumber(value)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${formatNumber(value)}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>메모리 사용 분포</span>
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={memoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {memoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 성능 인사이트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>성능 인사이트</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2">💡 최적화 제안</h5>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• 히트율이 {formatNumber(aggregatedStats.avgHitRate || 0)}%로 양호한 수준입니다</p>
                <p>• 응답시간이 {formatNumber(aggregatedStats.avgResponseTime || 0)}ms로 빠른 성능을 보입니다</p>
                <p>• 메모리 사용량 모니터링을 지속해주세요</p>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h5 className="font-medium text-green-900 mb-2">📊 성능 요약</h5>
              <div className="text-sm text-green-800 space-y-1">
                <p>• 최고 히트율: {formatNumber(aggregatedStats.maxHitRate || 0)}%</p>
                <p>• 최저 응답시간: {formatNumber(aggregatedStats.minResponseTime || 0)}ms</p>
                <p>• 최고 처리량: {formatNumber(aggregatedStats.maxThroughput || 0, 0)} req/s</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMetrics;