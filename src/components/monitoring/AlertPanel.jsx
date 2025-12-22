/**
 * 알림 패널 컴포넌트
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Volume2,
  Newspaper,
  Check,
  RefreshCw,
  Filter,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

import { monitoringAPI, queryKeys } from '@/lib/api';

const AlertPanel = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [alertTypeFilter, setAlertTypeFilter] = useState('');
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  const queryClient = useQueryClient();

  // 알림 히스토리 조회
  const { data: alertsData, isLoading, refetch } = useQuery({
    queryKey: [queryKeys.monitoringAlerts, { page: currentPage, per_page: perPage, type: alertTypeFilter }],
    queryFn: () => monitoringAPI.getAlerts({
      page: currentPage,
      per_page: perPage,
      type: alertTypeFilter || undefined
    }),
    refetchInterval: 30000 // 30초마다 갱신
  });

  // 알림 확인 뮤테이션
  const acknowledgeMutation = useMutation({
    mutationFn: (alertId) => monitoringAPI.acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.monitoringAlerts]);
    }
  });

  // 테스트 알림 뮤테이션
  const testAlertMutation = useMutation({
    mutationFn: (params) => monitoringAPI.testAlert(params),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.monitoringAlerts]);
    }
  });

  const alerts = alertsData?.alerts || [];
  const pagination = alertsData?.pagination || {};

  // 필터링된 알림
  const filteredAlerts = alerts.filter(alert => {
    if (!showAcknowledged && alert.acknowledged) {
      return false;
    }
    return true;
  });

  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'price_change':
        return <TrendingUp className="h-4 w-4" />;
      case 'volume_spike':
        return <Volume2 className="h-4 w-4" />;
      case 'news_surge':
        return <Newspaper className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertTypeLabel = (alertType) => {
    switch (alertType) {
      case 'price_change':
        return '가격 변동';
      case 'volume_spike':
        return '거래량 급증';
      case 'news_surge':
        return '뉴스 급증';
      default:
        return '기타';
    }
  };

  const getAlertVariant = (alertType) => {
    switch (alertType) {
      case 'price_change':
        return 'default';
      case 'volume_spike':
        return 'secondary';
      case 'news_surge':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  const formatDateTime = (dateString) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const alertTime = new Date(dateString);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}일 전`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 전`;
    } else if (diffMins > 0) {
      return `${diffMins}분 전`;
    } else {
      return '방금 전';
    }
  };

  const handleTestAlert = () => {
    const testData = {
      stock_code: '005930',
      alert_type: 'price_change',
      value: 5.5,
      threshold: 5.0,
      message: '테스트 가격 변동 알림'
    };

    testAlertMutation.mutate(testData);
  };

  return (
    <div className="space-y-6">
      {/* 필터 및 제어 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>알림 관리</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleTestAlert}
                disabled={testAlertMutation.isLoading}
                variant="outline"
                size="sm"
              >
                테스트 알림
              </Button>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* 알림 타입 필터 */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Select value={alertTypeFilter} onValueChange={setAlertTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="알림 타입" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  <SelectItem value="price_change">가격 변동</SelectItem>
                  <SelectItem value="volume_spike">거래량 급증</SelectItem>
                  <SelectItem value="news_surge">뉴스 급증</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 확인됨 표시 토글 */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowAcknowledged(!showAcknowledged)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                {showAcknowledged ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>확인됨 {showAcknowledged ? '숨기기' : '보기'}</span>
              </Button>
            </div>

            {/* 페이지 크기 선택 */}
            <Select value={perPage.toString()} onValueChange={(value) => setPerPage(parseInt(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10개</SelectItem>
                <SelectItem value="20">20개</SelectItem>
                <SelectItem value="50">50개</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 통계 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-2xl font-bold">{alerts.length}</div>
              <div className="text-sm text-muted-foreground">전체 알림</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-2xl font-bold">
                {alerts.filter(a => !a.acknowledged).length}
              </div>
              <div className="text-sm text-muted-foreground">미확인</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-2xl font-bold">
                {alerts.filter(a => a.alert_type === 'price_change').length}
              </div>
              <div className="text-sm text-muted-foreground">가격 변동</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-2xl font-bold">
                {alerts.filter(a => a.alert_type === 'volume_spike').length}
              </div>
              <div className="text-sm text-muted-foreground">거래량 급증</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 알림 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>알림 히스토리</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>알림을 불러오는 중...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">알림이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <Alert
                  key={alert.id}
                  className={`${alert.acknowledged ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.alert_type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline">{alert.stock_code}</Badge>
                          <Badge variant={getAlertVariant(alert.alert_type)}>
                            {getAlertTypeLabel(alert.alert_type)}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="secondary">
                              <Check className="h-3 w-3 mr-1" />
                              확인됨
                            </Badge>
                          )}
                        </div>
                        <AlertDescription className="mb-2">
                          {alert.message || `${alert.alert_type}: ${alert.value} (임계값: ${alert.threshold})`}
                        </AlertDescription>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDateTime(alert.timestamp)}</span>
                          <span>({getTimeAgo(alert.timestamp)})</span>
                        </div>
                      </div>
                    </div>

                    {!alert.acknowledged && (
                      <Button
                        onClick={() => acknowledgeMutation.mutate(alert.id)}
                        disabled={acknowledgeMutation.isLoading}
                        variant="outline"
                        size="sm"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        확인
                      </Button>
                    )}
                  </div>
                </Alert>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {pagination.pages > 1 && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {pagination.total}개 중 {((pagination.page - 1) * pagination.per_page) + 1}-
                  {Math.min(pagination.page * pagination.per_page, pagination.total)} 표시
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    variant="outline"
                    size="sm"
                  >
                    이전
                  </Button>
                  <span className="text-sm">
                    {currentPage} / {pagination.pages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                    disabled={currentPage >= pagination.pages}
                    variant="outline"
                    size="sm"
                  >
                    다음
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertPanel;