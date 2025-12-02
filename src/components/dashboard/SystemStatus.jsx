import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Cpu,
  HardDrive,
  MemoryStick,
  Database,
  Globe,
  TrendingUp
} from 'lucide-react';

const SystemStatus = ({ data }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'running':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
      case 'stopped':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
      case 'stopped':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}시간 ${minutes}분`;
  };

  const agents = [
    { name: '데이터 수집', key: 'data_collection', description: '네이버 증권 데이터 크롤링', icon: <Database className="h-4 w-4" /> },
    { name: '분석 엔진', key: 'analysis', description: '기술적/펀더멘털 분석', icon: <TrendingUp className="h-4 w-4" /> },
    { name: 'AI 분석', key: 'ai_analysis', description: 'GPT-4 & Gemini 분석', icon: <Globe className="h-4 w-4" /> },
    { name: 'API 서버', key: 'api_server', description: 'REST API 서비스', icon: <Cpu className="h-4 w-4" /> }
  ];

  // Default data structure if not provided
  const defaultData = {
    status: 'running',
    uptime: 86400,
    agents: {
      data_collection: 'active',
      analysis: 'active',
      ai_analysis: 'active',
      api_server: 'active'
    },
    performance: {
      cpu_usage: 25.5,
      memory_usage: 512.3,
      disk_usage: 15.2
    }
  };

  const systemData = data || defaultData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>시스템 상태</span>
        </CardTitle>
        <CardDescription>
          실시간 시스템 상태 및 에이전트 모니터링
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">시스템 상태</span>
              <Badge variant={systemData.status === 'running' ? 'default' : 'destructive'}>
                {systemData.status === 'running' ? '실행중' : '중지됨'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">운영 시간</span>
              <span className="text-sm text-muted-foreground">
                {formatUptime(systemData.uptime)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">버전</span>
              <span className="text-sm text-muted-foreground">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">마지막 업데이트</span>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleTimeString('ko-KR')}
              </span>
            </div>
          </div>
        </div>

        {/* Agent Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">에이전트 상태</h4>
          <div className="space-y-2">
            {agents.map((agent) => (
              <div key={agent.key} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className={`${getStatusIcon(systemData.agents[agent.key]) ? 'text-green-500' : 'text-gray-500'}`}>
                    {agent.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">{agent.description}</div>
                  </div>
                </div>
                <Badge 
                  variant={systemData.agents[agent.key] === 'active' ? 'default' : 'destructive'}
                  className="capitalize"
                >
                  {systemData.agents[agent.key] === 'active' ? '활성' : '비활성'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">성능 지표</h4>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">CPU 사용률</span>
                </div>
                <span className="text-sm font-medium">{systemData.performance.cpu_usage.toFixed(1)}%</span>
              </div>
              <Progress value={systemData.performance.cpu_usage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MemoryStick className="h-4 w-4 text-green-500" />
                  <span className="text-sm">메모리 사용량</span>
                </div>
                <span className="text-sm font-medium">{systemData.performance.memory_usage.toFixed(1)} MB</span>
              </div>
              <Progress value={(systemData.performance.memory_usage / 1024) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">디스크 사용률</span>
                </div>
                <span className="text-sm font-medium">{systemData.performance.disk_usage.toFixed(1)}%</span>
              </div>
              <Progress value={systemData.performance.disk_usage} className="h-2" />
            </div>
          </div>
        </div>

        {/* Market Data Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">시장 데이터 상태</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <span className="text-sm">KOSPI 연결</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-green-600">정상</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <span className="text-sm">KOSDAQ 연결</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-green-600">정상</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;