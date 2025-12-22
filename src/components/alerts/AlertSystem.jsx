import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { 
  Bell, 
  BellRing, 
  TrendingUp, 
  Info, 
  CheckCircle,
  X,
  Settings,
  Filter,
  Clock,
  Target,
  Activity
} from 'lucide-react';
import { dashboardAPI } from '../../lib/api';

const AlertSystem = ({ className = "" }) => {
  const [alerts, setAlerts] = useState([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // 알림 데이터 조회
  const { data: alertsData, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => dashboardAPI.getAlerts(),
    refetchInterval: isEnabled ? 30000 : false, // 30초마다 새로고침
    enabled: isEnabled
  });

  // 모의 알림 데이터 (실제로는 API에서 가져옴)
  const mockAlerts = [
    {
      id: 1,
      type: 'price_target',
      priority: 'high',
      title: '삼성전자 목표가 도달',
      message: '삼성전자가 설정한 목표가 75,000원에 근접했습니다. (현재: 74,500원)',
      stockCode: '005930',
      stockName: '삼성전자',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      action: 'SELL'
    },
    {
      id: 2,
      type: 'technical_signal',
      priority: 'medium',
      title: 'NAVER 골든크로스 발생',
      message: '단기 이평선이 장기 이평선을 상향 돌파했습니다. 매수 신호가 감지되었습니다.',
      stockCode: '035420',
      stockName: 'NAVER',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isRead: false,
      action: 'BUY'
    },
    {
      id: 3,
      type: 'news',
      priority: 'medium',
      title: '카카오 긍정적 뉴스',
      message: '카카오뱅크 실적 호조로 모회사 주가에 긍정적 영향 예상',
      stockCode: '035720',
      stockName: '카카오',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: true,
      action: 'HOLD'
    },
    {
      id: 4,
      type: 'volume',
      priority: 'low',
      title: 'SK하이닉스 거래량 급증',
      message: '평균 거래량의 200% 이상 거래되고 있습니다. 주요 이슈를 확인해보세요.',
      stockCode: '000660',
      stockName: 'SK하이닉스',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      isRead: true,
      action: 'WATCH'
    }
  ];

  useEffect(() => {
    setAlerts(alertsData?.data?.alerts || mockAlerts);
  }, [alertsData]);

  const getAlertIcon = (type, priority) => {
    const iconClass = priority === 'high' ? 'text-red-600' : 
                     priority === 'medium' ? 'text-yellow-600' : 'text-blue-600';
    
    switch(type) {
      case 'price_target': return <Target className={`h-4 w-4 ${iconClass}`} />;
      case 'technical_signal': return <TrendingUp className={`h-4 w-4 ${iconClass}`} />;
      case 'news': return <Info className={`h-4 w-4 ${iconClass}`} />;
      case 'volume': return <Activity className={`h-4 w-4 ${iconClass}`} />;
      default: return <Bell className={`h-4 w-4 ${iconClass}`} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'BUY': return 'bg-green-100 text-green-800';
      case 'SELL': return 'bg-red-100 text-red-800';
      case 'HOLD': return 'bg-blue-100 text-blue-800';
      case 'WATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (value) => {
    const date = toDate(value);
    if (Number.isNaN(date.getTime())) return '-';

    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60));

    if (diff < 1) return '방금 전';
    if (diff < 60) return `${diff}분 전`;
    if (diff < 24 * 60) return `${Math.floor(diff / 60)}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const toDate = (v) => (v instanceof Date ? v : new Date(v));

  const markAsRead = (alertId) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.isRead;
    if (filter === 'important') return ['high', 'medium'].includes(alert.priority);
    return true;
  });

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BellRing className="h-5 w-5 text-blue-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <CardTitle>투자 알림</CardTitle>
              <CardDescription>
                시장 변동·신호·뉴스를 실시간으로 알려드려요
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span>알림</span>
              <Switch 
                checked={isEnabled} 
                onCheckedChange={setIsEnabled}
              />
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              설정
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* 필터 */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <div className="flex gap-2">
            {[
              { key: 'all', label: '전체' },
              { key: 'unread', label: '읽지 않음' },
              { key: 'high', label: '중요' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(key)}
              >
                {label}
                {key === 'unread' && unreadCount > 0 && (
                  <Badge className="ml-1 bg-red-500">{unreadCount}</Badge>
                )}
              </Button>
            ))}
          </div>
          
          <div className="ml-auto text-xs text-gray-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            마지막 업데이트: {formatTime(lastUpdate)}
          </div>
        </div>

        {/* 알림 목록 */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                  alert.isRead ? 'bg-gray-50' : 'bg-white border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getAlertIcon(alert.type, alert.priority)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-medium ${!alert.isRead ? 'font-semibold' : ''}`}>
                          {alert.title}
                        </h4>
                        <Badge className={getPriorityColor(alert.priority)} size="sm">
                          {alert.priority === 'high' ? '긴급' : 
                           alert.priority === 'medium' ? '중요' : '일반'}
                        </Badge>
                        {alert.action && (
                          <Badge className={getActionColor(alert.action)} size="sm">
                            {alert.action === 'BUY' ? '매수' :
                             alert.action === 'SELL' ? '매도' :
                             alert.action === 'HOLD' ? '보유' : '관찰'}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {alert.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="font-medium text-blue-600">
                          {alert.stockName} ({alert.stockCode})
                        </span>
                        <span>{formatTime(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    {!alert.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(alert.id)}
                        className="h-6 w-6 p-0"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {filter === 'unread' ? '읽지 않은 알림이 없습니다.' : 
                 filter === 'high' ? '중요한 알림이 없습니다.' : 
                 '새로운 알림이 없습니다.'}
              </p>
              <p className="text-sm text-gray-400">
                새로운 투자 기회나 시장 변동이 있으면 알려드리겠습니다.
              </p>
            </div>
          )}
        </div>

        {/* 알림 요약 */}
        {filteredAlerts.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-red-600">
                  {alerts.filter(a => a.priority === 'high').length}
                </div>
                <div className="text-xs text-gray-500">긴급</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {alerts.filter(a => a.priority === 'medium').length}
                </div>
                <div className="text-xs text-gray-500">중요</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {alerts.filter(a => a.priority === 'low').length}
                </div>
                <div className="text-xs text-gray-500">일반</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertSystem;