/**
 * 요청 최적화 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Zap,
  Settings,
  TrendingUp,
  Clock,
  Database,
  Network,
  Cpu,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Target,
  Activity,
  Gauge,
  BarChart3
} from 'lucide-react';

import { cacheAPI, agentAPI, queryKeys } from '@/lib/api';

const RequestOptimizer = () => {
  const [isOptimizationActive, setIsOptimizationActive] = useState(false);
  const [optimizationLevel, setOptimizationLevel] = useState('balanced');
  const [cachingEnabled, setCachingEnabled] = useState(true);
  const [batchingEnabled, setBatchingEnabled] = useState(true);
  const [compressionEnabled, setCompressionEnabled] = useState(false);
  const [requestTimeout, setRequestTimeout] = useState(30);
  const [maxConcurrentRequests, setMaxConcurrentRequests] = useState(10);
  const [optimizationMetrics, setOptimizationMetrics] = useState([]);

  const queryClient = useQueryClient();

  // 최적화 통계 조회
  const { data: optimizationStats, refetch } = useQuery({
    queryKey: ['optimization-stats'],
    queryFn: async () => {
      // 실제로는 백엔드에서 최적화 통계를 가져옴
      return {
        totalRequests: 12547,
        optimizedRequests: 8932,
        savedTime: 2345,
        cacheHits: 7834,
        batchedRequests: 1456,
        compressionSavings: 23.5,
        avgResponseTime: 245,
        throughput: 156,
        errorRate: 0.8,
        optimizationRatio: 71.2
      };
    },
    refetchInterval: 15000
  });

  // 실시간 성능 데이터 시뮬레이션
  useEffect(() => {
    const generateMetrics = () => {
      const now = new Date();
      const newMetric = {
        time: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestamp: now.getTime(),
        responseTime: 200 + Math.random() * 100,
        throughput: 100 + Math.random() * 100,
        cacheHitRate: 70 + Math.random() * 25,
        cpuUsage: 30 + Math.random() * 40,
        memoryUsage: 50 + Math.random() * 30,
        networkLatency: 10 + Math.random() * 20,
        errorRate: Math.random() * 5,
        optimizationGain: isOptimizationActive ? 15 + Math.random() * 20 : Math.random() * 5
      };

      setOptimizationMetrics(prev => {
        const newMetrics = [...prev, newMetric].slice(-30); // 최근 30개 데이터만 유지
        return newMetrics;
      });
    };

    const interval = setInterval(generateMetrics, 5000);
    return () => clearInterval(interval);
  }, [isOptimizationActive]);

  // 최적화 설정 적용
  const applyOptimizationMutation = useMutation({
    mutationFn: async (settings) => {
      // 실제로는 백엔드에 최적화 설정을 전송
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, message: '최적화 설정이 적용되었습니다.' };
    },
    onSuccess: () => {
      setIsOptimizationActive(true);
      refetch();
    }
  });

  // 최적화 재설정
  const resetOptimizationMutation = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      setIsOptimizationActive(false);
      setOptimizationLevel('balanced');
      setCachingEnabled(true);
      setBatchingEnabled(true);
      setCompressionEnabled(false);
      setRequestTimeout(30);
      setMaxConcurrentRequests(10);
    }
  });

  const handleApplyOptimization = () => {
    applyOptimizationMutation.mutate({
      level: optimizationLevel,
      caching: cachingEnabled,
      batching: batchingEnabled,
      compression: compressionEnabled,
      timeout: requestTimeout,
      maxConcurrent: maxConcurrentRequests
    });
  };

  const formatNumber = (num, decimals = 1) => {
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const getOptimizationLevelColor = (level) => {
    switch (level) {
      case 'aggressive': return 'text-red-600';
      case 'balanced': return 'text-blue-600';
      case 'conservative': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // 성능 분포 데이터
  const performanceDistribution = [
    { name: 'Cache Hit', value: optimizationStats?.cacheHits || 0, color: '#10b981' },
    { name: 'Direct Request', value: (optimizationStats?.totalRequests || 0) - (optimizationStats?.cacheHits || 0), color: '#3b82f6' }
  ];

  // 최적화 효과 데이터
  const optimizationEffect = [
    { category: '응답시간', before: 450, after: 245, improvement: 45.6 },
    { category: '처리량', before: 89, after: 156, improvement: 75.3 },
    { category: '에러율', before: 3.2, after: 0.8, improvement: 75.0 },
    { category: '메모리', before: 85, after: 62, improvement: 27.1 }
  ];

  return (
    <div className="space-y-6">
      {/* 상태 헤더 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>요청 최적화</span>
              <Badge variant={isOptimizationActive ? "default" : "secondary"}>
                {isOptimizationActive ? '활성' : '비활성'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsOptimizationActive(!isOptimizationActive)}
                variant={isOptimizationActive ? "destructive" : "default"}
                size="sm"
              >
                {isOptimizationActive ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {isOptimizationActive ? '중단' : '시작'}
              </Button>
              <Button
                onClick={() => resetOptimizationMutation.mutate()}
                variant="outline"
                size="sm"
                disabled={resetOptimizationMutation.isLoading}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 요약 지표 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(optimizationStats?.optimizationRatio || 0)}%
              </div>
              <div className="text-sm text-muted-foreground">최적화율</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(optimizationStats?.savedTime || 0, 0)}ms
              </div>
              <div className="text-sm text-muted-foreground">절약된 시간</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(optimizationStats?.avgResponseTime || 0, 0)}ms
              </div>
              <div className="text-sm text-muted-foreground">평균 응답시간</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatNumber(optimizationStats?.throughput || 0, 0)}
              </div>
              <div className="text-sm text-muted-foreground">처리량/초</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">설정</TabsTrigger>
          <TabsTrigger value="performance">성능</TabsTrigger>
          <TabsTrigger value="analysis">분석</TabsTrigger>
          <TabsTrigger value="monitoring">모니터링</TabsTrigger>
        </TabsList>

        {/* 설정 탭 */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>최적화 설정</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 최적화 레벨 */}
                <div>
                  <Label className="text-sm font-medium">최적화 레벨</Label>
                  <Select value={optimizationLevel} onValueChange={setOptimizationLevel}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">보수적 - 안정성 우선</SelectItem>
                      <SelectItem value="balanced">균형적 - 성능과 안정성 조화</SelectItem>
                      <SelectItem value="aggressive">적극적 - 최대 성능 추구</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    {optimizationLevel === 'conservative' && '안정성을 우선하여 보수적으로 최적화'}
                    {optimizationLevel === 'balanced' && '성능과 안정성의 균형을 추구'}
                    {optimizationLevel === 'aggressive' && '최대 성능을 위한 적극적 최적화'}
                  </p>
                </div>

                {/* 기능 스위치들 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>캐싱 활성화</Label>
                      <p className="text-sm text-muted-foreground">중복 요청 결과를 캐시에 저장</p>
                    </div>
                    <Switch checked={cachingEnabled} onCheckedChange={setCachingEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>배치 처리</Label>
                      <p className="text-sm text-muted-foreground">유사한 요청을 묶어서 처리</p>
                    </div>
                    <Switch checked={batchingEnabled} onCheckedChange={setBatchingEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>압축 활성화</Label>
                      <p className="text-sm text-muted-foreground">응답 데이터를 압축하여 전송</p>
                    </div>
                    <Switch checked={compressionEnabled} onCheckedChange={setCompressionEnabled} />
                  </div>
                </div>

                {/* 고급 설정 */}
                <div className="space-y-4">
                  <div>
                    <Label>요청 타임아웃 (초)</Label>
                    <Input
                      type="number"
                      min="5"
                      max="120"
                      value={requestTimeout}
                      onChange={(e) => setRequestTimeout(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>최대 동시 요청 수</Label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={maxConcurrentRequests}
                      onChange={(e) => setMaxConcurrentRequests(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* 적용 버튼 */}
                <Button
                  onClick={handleApplyOptimization}
                  disabled={applyOptimizationMutation.isLoading}
                  className="w-full"
                >
                  {applyOptimizationMutation.isLoading ? '적용 중...' : '설정 적용'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>현재 설정 요약</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>최적화 레벨</span>
                    <Badge className={getOptimizationLevelColor(optimizationLevel)}>
                      {optimizationLevel === 'conservative' && '보수적'}
                      {optimizationLevel === 'balanced' && '균형적'}
                      {optimizationLevel === 'aggressive' && '적극적'}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>캐싱</span>
                    <Badge variant={cachingEnabled ? "default" : "secondary"}>
                      {cachingEnabled ? '활성' : '비활성'}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>배치 처리</span>
                    <Badge variant={batchingEnabled ? "default" : "secondary"}>
                      {batchingEnabled ? '활성' : '비활성'}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>압축</span>
                    <Badge variant={compressionEnabled ? "default" : "secondary"}>
                      {compressionEnabled ? '활성' : '비활성'}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>타임아웃</span>
                    <span className="font-medium">{requestTimeout}초</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>최대 동시 요청</span>
                    <span className="font-medium">{maxConcurrentRequests}개</span>
                  </div>
                </div>

                {isOptimizationActive && (
                  <Alert className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      최적화가 활성화되어 있습니다. 실시간으로 요청을 최적화하고 있습니다.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 성능 탭 */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>실시간 성능 지표</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={optimizationMetrics.slice(-20)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#3b82f6"
                      name="응답시간 (ms)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="throughput"
                      stroke="#10b981"
                      name="처리량"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>요청 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={performanceDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {performanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatNumber(value, 0), '']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>캐시 히트율</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={optimizationMetrics.slice(-20)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${formatNumber(value)}%`, '히트율']} />
                    <Area
                      type="monotone"
                      dataKey="cacheHitRate"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>최적화 효과</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={optimizationEffect}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="before" fill="#ef4444" name="최적화 전" />
                    <Bar dataKey="after" fill="#10b981" name="최적화 후" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 분석 탭 */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>최적화 효과 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {optimizationEffect.map((item, index) => (
                  <div key={index} className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {formatNumber(item.improvement)}%
                    </div>
                    <div className="text-sm text-muted-foreground">{item.category} 개선</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">🚀 성능 향상</h4>
                  <div className="text-green-800 text-sm space-y-1">
                    <p>• 응답시간 45.6% 단축</p>
                    <p>• 처리량 75.3% 증가</p>
                    <p>• 캐시 히트율 85% 달성</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">💰 비용 절감</h4>
                  <div className="text-blue-800 text-sm space-y-1">
                    <p>• 서버 리소스 27% 절약</p>
                    <p>• 네트워크 대역폭 23% 감소</p>
                    <p>• 전력 소비 15% 감소</p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-2">🛡️ 안정성 향상</h4>
                  <div className="text-purple-800 text-sm space-y-1">
                    <p>• 에러율 75% 감소</p>
                    <p>• 타임아웃 발생 90% 감소</p>
                    <p>• 시스템 가용성 99.8%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 모니터링 탭 */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-1">
                  <Cpu className="h-4 w-4" />
                  <span>CPU 사용률</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {formatNumber(optimizationMetrics[optimizationMetrics.length - 1]?.cpuUsage || 0)}%
                </div>
                <Progress
                  value={optimizationMetrics[optimizationMetrics.length - 1]?.cpuUsage || 0}
                  className="h-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-1">
                  <Database className="h-4 w-4" />
                  <span>메모리 사용률</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {formatNumber(optimizationMetrics[optimizationMetrics.length - 1]?.memoryUsage || 0)}%
                </div>
                <Progress
                  value={optimizationMetrics[optimizationMetrics.length - 1]?.memoryUsage || 0}
                  className="h-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-1">
                  <Network className="h-4 w-4" />
                  <span>네트워크 지연</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {formatNumber(optimizationMetrics[optimizationMetrics.length - 1]?.networkLatency || 0, 0)}ms
                </div>
                <Progress
                  value={(optimizationMetrics[optimizationMetrics.length - 1]?.networkLatency || 0) / 50 * 100}
                  className="h-2"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>시스템 리소스 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={optimizationMetrics.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${formatNumber(value)}%`, '']} />
                  <Line
                    type="monotone"
                    dataKey="cpuUsage"
                    stroke="#ef4444"
                    name="CPU 사용률"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="memoryUsage"
                    stroke="#3b82f6"
                    name="메모리 사용률"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="networkLatency"
                    stroke="#8b5cf6"
                    name="네트워크 지연"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RequestOptimizer;