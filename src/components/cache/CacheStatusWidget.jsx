/**
 * 캐시 상태 위젯 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Database,
  RefreshCw,
  Trash2,
  Settings,
  Activity,
  Clock,
  HardDrive,
  Zap,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Server
} from 'lucide-react';

import { cacheAPI, queryKeys } from '@/lib/api';

const CacheStatusWidget = () => {
  const [realtimeStats, setRealtimeStats] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const queryClient = useQueryClient();

  // 캐시 통계 조회
  const { data: cacheStats, isLoading, refetch } = useQuery({
    queryKey: [queryKeys.cacheStats],
    queryFn: cacheAPI.getStats,
    refetchInterval: 30000
  });

  // 캐시 설정 조회
  const { data: cacheConfig } = useQuery({
    queryKey: [queryKeys.cacheConfig],
    queryFn: cacheAPI.getConfig,
    refetchInterval: 60000
  });

  // 캐시 헬스 체크
  const { data: healthStatus } = useQuery({
    queryKey: [queryKeys.cacheHealth],
    queryFn: cacheAPI.healthCheck,
    refetchInterval: 15000
  });

  // 캐시 갱신 뮤테이션
  const refreshMutation = useMutation({
    mutationFn: (params) => cacheAPI.refresh(params),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.cacheStats]);
    }
  });

  // 캐시 삭제 뮤테이션
  const clearMutation = useMutation({
    mutationFn: (params) => cacheAPI.clear(params),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.cacheStats]);
    }
  });

  // WebSocket 실시간 구독
  useEffect(() => {
    const handleCacheStatsUpdate = (data) => {
      setRealtimeStats(data);
    };

    const handleSubscriptionStatus = (data) => {
      setIsSubscribed(data.subscribed);
    };

    wsManager.on('cache_stats_update', handleCacheStatsUpdate);
    wsManager.on('cache_stats_subscribed', handleSubscriptionStatus);
    wsManager.on('cache_stats_unsubscribed', handleSubscriptionStatus);

    return () => {
      wsManager.off('cache_stats_update', handleCacheStatsUpdate);
      wsManager.off('cache_stats_subscribed', handleSubscriptionStatus);
      wsManager.off('cache_stats_unsubscribed', handleSubscriptionStatus);
    };
  }, []);

  const toggleSubscription = () => {
    if (isSubscribed) {
      wsManager.unsubscribeCacheStats();
    } else {
      wsManager.subscribeCacheStats();
    }
  };

  // 현재 통계 (실시간 데이터 우선)
  const currentStats = realtimeStats || cacheStats;

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const getHealthStatusBadge = () => {
    if (!healthStatus) return <Badge variant="outline">확인 중</Badge>;

    switch (healthStatus.status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />정상</Badge>;
      case 'warning':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />주의</Badge>;
      case 'critical':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />위험</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const calculateHitRate = () => {
    if (!currentStats || !currentStats.hits || !currentStats.misses) return 0;
    const total = currentStats.hits + currentStats.misses;
    return total > 0 ? (currentStats.hits / total) * 100 : 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>캐시 상태</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>캐시 상태를 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 메인 상태 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>캐시 시스템</span>
              {realtimeStats && <Badge variant="secondary">실시간</Badge>}
            </div>
            <div className="flex items-center space-x-2">
              {getHealthStatusBadge()}
              <Button
                onClick={toggleSubscription}
                variant={isSubscribed ? "default" : "outline"}
                size="sm"
              >
                <Activity className="h-4 w-4 mr-1" />
                {isSubscribed ? '실시간 ON' : '실시간 OFF'}
              </Button>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">개요</TabsTrigger>
              <TabsTrigger value="performance">성능</TabsTrigger>
              <TabsTrigger value="management">관리</TabsTrigger>
            </TabsList>

            {/* 개요 탭 */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(currentStats?.total_keys || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">총 키 수</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatBytes(currentStats?.memory_usage || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">메모리 사용량</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {calculateHitRate().toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">히트 비율</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatNumber(currentStats?.operations_per_sec || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">초당 연산</div>
                </div>
              </div>

              {/* 메모리 사용률 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">메모리 사용률</span>
                  <span className="text-sm text-muted-foreground">
                    {formatBytes(currentStats?.memory_usage || 0)} / {formatBytes(currentStats?.max_memory || 1)}
                  </span>
                </div>
                <Progress
                  value={(currentStats?.memory_usage || 0) / (currentStats?.max_memory || 1) * 100}
                  className="h-2"
                />
              </div>

              {/* 연결 상태 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">연결된 클라이언트</div>
                  <div className="flex items-center space-x-2">
                    <Server className="h-4 w-4" />
                    <span className="font-medium">{currentStats?.connected_clients || 0}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">가동 시간</div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{currentStats?.uptime || '0s'}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 성능 탭 */}
            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>캐시 히트</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(currentStats?.hits || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">총 히트 수</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>캐시 미스</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatNumber(currentStats?.misses || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">총 미스 수</p>
                  </CardContent>
                </Card>
              </div>

              {/* 성능 지표 */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">평균 응답 시간</span>
                    <span className="text-sm font-medium">{currentStats?.avg_response_time || 0}ms</span>
                  </div>
                  <Progress
                    value={Math.min((currentStats?.avg_response_time || 0) / 100 * 100, 100)}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">처리량 (요청/초)</span>
                    <span className="text-sm font-medium">{currentStats?.throughput || 0}</span>
                  </div>
                  <Progress
                    value={Math.min((currentStats?.throughput || 0) / 1000 * 100, 100)}
                    className="h-2"
                  />
                </div>
              </div>

              {/* 최근 성능 경고 */}
              {healthStatus?.warnings?.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>성능 경고:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {healthStatus.warnings.map((warning, index) => (
                        <li key={index} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* 관리 탭 */}
            <TabsContent value="management" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => refreshMutation.mutate()}
                  disabled={refreshMutation.isLoading}
                  className="h-20 flex-col"
                  variant="outline"
                >
                  <RefreshCw className="h-6 w-6 mb-2" />
                  <span>{refreshMutation.isLoading ? '갱신 중...' : '캐시 갱신'}</span>
                </Button>

                <Button
                  onClick={() => clearMutation.mutate()}
                  disabled={clearMutation.isLoading}
                  className="h-20 flex-col"
                  variant="outline"
                >
                  <Trash2 className="h-6 w-6 mb-2" />
                  <span>{clearMutation.isLoading ? '삭제 중...' : '캐시 삭제'}</span>
                </Button>
              </div>

              {/* 캐시 설정 */}
              {cacheConfig && (
                <div className="space-y-3">
                  <h4 className="font-medium">캐시 설정</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>기본 TTL:</span>
                      <span className="font-medium">{cacheConfig.default_ttl}초</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>최대 메모리:</span>
                      <span className="font-medium">{formatBytes(cacheConfig.max_memory)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>만료 정책:</span>
                      <span className="font-medium">{cacheConfig.eviction_policy}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>압축 활성화:</span>
                      <span className="font-medium">{cacheConfig.compression ? '예' : '아니오'}</span>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CacheStatusWidget;