/**
 * 실시간 모니터링 컴포넌트
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Square,
  AlertTriangle,
  TrendingUp,
  Volume2,
  Newspaper,
  Settings,
  RefreshCw,
  Clock,
  Users
} from 'lucide-react';

import { monitoringAPI, queryKeys } from '@/lib/api';
import AlertPanel from './AlertPanel';
import { wsManager } from '@/lib/wsManager'; // ✅ 실제 경로로 수정

const RealTimeMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState(['005930', '000660', '035420']);
  const [newStockCode, setNewStockCode] = useState('');
  const [alertThresholds, setAlertThresholds] = useState({
    price_change: 5.0,
    volume_spike: 3.0,
    news_surge: 10
  });
  const [monitoringInterval, setMonitoringInterval] = useState(60);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const queryClient = useQueryClient();

  // 모니터링 상태 조회
  const { data: monitoringStatus, refetch: refetchStatus } = useQuery({
    queryKey: [queryKeys.monitoringStatus],
    queryFn: monitoringAPI.getStatus,
    refetchInterval: isMonitoring ? 30000 : false,
    onSuccess: (data) => {
      setIsMonitoring(data.monitoring_status === 'active');
      if (data.active_alerts) {
        setRecentAlerts(data.active_alerts);
      }
    }
  });

  // 모니터링 시작 뮤테이션
  const startMonitoringMutation = useMutation({
    mutationFn: (params) => monitoringAPI.start(params),
    onSuccess: (data) => {
      setIsMonitoring(true);
      queryClient.invalidateQueries({ queryKey: [queryKeys.monitoringStatus] });

      // WebSocket 모니터링 시작
      if (wsManager.isConnected) {
        wsManager.joinMonitoring(selectedStocks);
        wsManager.startMonitoring(selectedStocks);
      }
    },
    onError: (error) => {
      console.error('모니터링 시작 실패:', error);
    }
  });

  // 모니터링 중단 뮤테이션
  const stopMonitoringMutation = useMutation({
    mutationFn: () => monitoringAPI.stop(),
    onSuccess: () => {
      setIsMonitoring(false);
      queryClient.invalidateQueries({ queryKey: [queryKeys.monitoringStatus] });

      // WebSocket 모니터링 중단
      if (wsManager.isConnected) {
        wsManager.stopMonitoring();
        wsManager.leaveMonitoring();
      }
    },
    onError: (error) => {
      console.error('모니터링 중단 실패:', error);
    }
  });

  // WebSocket 이벤트 처리
  useEffect(() => {
    const handleConnectionStatus = (data) => {
      setConnectionStatus(data.status);
    };

    const handleNewAlert = (alert) => {
      setRecentAlerts(prev => [alert, ...prev.slice(0, 4)]);

      // 브라우저 알림 (권한이 있는 경우)
      if (Notification.permission === 'granted') {
        new Notification(`${alert.stock_code} 알림`, {
          body: `${alert.alert_type}: ${alert.value}`,
          icon: '/favicon.ico'
        });
      }
    };

    const handleMonitoringStatus = (data) => {
      if (data.status === 'started') {
        setIsMonitoring(true);
      } else if (data.status === 'stopped') {
        setIsMonitoring(false);
      }
    };

    // 이벤트 리스너 등록
    wsManager.on('connection_status', handleConnectionStatus);
    wsManager.on('new_alert', handleNewAlert);
    wsManager.on('monitoring_started', handleMonitoringStatus);
    wsManager.on('monitoring_stopped', handleMonitoringStatus);

    // 정리
    return () => {
      wsManager.off('connection_status', handleConnectionStatus);
      wsManager.off('new_alert', handleNewAlert);
      wsManager.off('monitoring_started', handleMonitoringStatus);
      wsManager.off('monitoring_stopped', handleMonitoringStatus);
    };
  }, []);

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleStartMonitoring = useCallback(() => {
    if (selectedStocks.length === 0) {
      alert('모니터링할 종목을 선택해주세요.');
      return;
    }

    startMonitoringMutation.mutate({
      stock_codes: selectedStocks,
      alert_thresholds: alertThresholds,
      monitoring_interval: monitoringInterval
    });
  }, [selectedStocks, alertThresholds, monitoringInterval, startMonitoringMutation]);

  const handleStopMonitoring = useCallback(() => {
    stopMonitoringMutation.mutate();
  }, [stopMonitoringMutation]);

  const addStock = useCallback(() => {
    if (newStockCode && !selectedStocks.includes(newStockCode)) {
      setSelectedStocks(prev => [...prev, newStockCode]);
      setNewStockCode('');
    }
  }, [newStockCode, selectedStocks]);

  const removeStock = useCallback((stockCode) => {
    setSelectedStocks(prev => prev.filter(code => code !== stockCode));
  }, []);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const getConnectionStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      case 'connecting': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">실시간 모니터링</h2>
          <p className="text-muted-foreground">
            주가, 거래량, 뉴스 변동을 실시간으로 모니터링합니다
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm ${getConnectionStatusColor(connectionStatus)}`}>
              {connectionStatus === 'connected' ? '연결됨' : '연결 안됨'}
            </span>
          </div>
          <Badge variant={getStatusBadgeVariant(monitoringStatus?.monitoring_status)}>
            {isMonitoring ? '모니터링 중' : '대기 중'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="control" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="control">제어</TabsTrigger>
          <TabsTrigger value="alerts">알림</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        {/* 제어 탭 */}
        <TabsContent value="control" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 모니터링 제어 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>모니터링 제어</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 종목 선택 */}
                <div>
                  <Label>모니터링 종목</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      placeholder="종목코드 입력"
                      value={newStockCode}
                      onChange={(e) => setNewStockCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addStock()}
                    />
                    <Button onClick={addStock} variant="outline">
                      추가
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedStocks.map(code => (
                      <Badge
                        key={code}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeStock(code)}
                      >
                        {code} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 제어 버튼 */}
                <div className="flex space-x-2">
                  {!isMonitoring ? (
                    <Button
                      onClick={handleStartMonitoring}
                      disabled={startMonitoringMutation.isLoading || selectedStocks.length === 0}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {startMonitoringMutation.isLoading ? '시작 중...' : '모니터링 시작'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStopMonitoring}
                      disabled={stopMonitoringMutation.isLoading}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      {stopMonitoringMutation.isLoading ? '중단 중...' : '모니터링 중단'}
                    </Button>
                  )}
                  <Button
                    onClick={() => refetchStatus()}
                    variant="outline"
                    size="icon"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 모니터링 상태 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>상태 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {monitoringStatus && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">모니터링 종목</div>
                        <div className="text-2xl font-bold">
                          {monitoringStatus.monitored_stocks?.length || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">총 알림</div>
                        <div className="text-2xl font-bold">
                          {monitoringStatus.stats?.total_alerts || 0}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="text-sm text-muted-foreground">가동 시간</div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{monitoringStatus.stats?.uptime || '0s'}</span>
                      </div>
                    </div>

                    {monitoringStatus.start_time && (
                      <div>
                        <div className="text-sm text-muted-foreground">시작 시간</div>
                        <div>{new Date(monitoringStatus.start_time).toLocaleString()}</div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 최근 알림 */}
          {recentAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>최근 알림</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentAlerts.map((alert, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{alert.stock_code}</strong> - {alert.alert_type}: {alert.value}
                        <span className="text-muted-foreground ml-2">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 알림 탭 */}
        <TabsContent value="alerts">
          <AlertPanel />
        </TabsContent>

        {/* 설정 탭 */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>알림 임계값 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>가격 변동 (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={alertThresholds.price_change}
                    onChange={(e) => setAlertThresholds(prev => ({
                      ...prev,
                      price_change: parseFloat(e.target.value)
                    }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    가격이 이 비율 이상 변동 시 알림
                  </p>
                </div>

                <div>
                  <Label>거래량 급증 (배수)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={alertThresholds.volume_spike}
                    onChange={(e) => setAlertThresholds(prev => ({
                      ...prev,
                      volume_spike: parseFloat(e.target.value)
                    }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    평소 거래량의 이 배수 이상 시 알림
                  </p>
                </div>

                <div>
                  <Label>뉴스 급증 (개수)</Label>
                  <Input
                    type="number"
                    value={alertThresholds.news_surge}
                    onChange={(e) => setAlertThresholds(prev => ({
                      ...prev,
                      news_surge: parseInt(e.target.value)
                    }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    시간당 이 개수 이상의 뉴스 발생 시 알림
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <Label>모니터링 간격 (초)</Label>
                <Input
                  type="number"
                  min="30"
                  max="300"
                  value={monitoringInterval}
                  onChange={(e) => setMonitoringInterval(parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  30초 ~ 5분 사이에서 설정 가능
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeMonitor;