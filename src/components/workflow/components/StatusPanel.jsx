/**
 * 워크플로우 전체 상태 패널
 */

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { NODE_STATUS, WORKFLOW_STAGE } from '../constants/workflowStates';

const StatusPanel = React.memo(({ nodes, startTime, currentStage }) => {
  // 통계 계산
  const stats = useMemo(() => {
    const total = nodes.length;
    const completed = nodes.filter(n => n.data.status === NODE_STATUS.COMPLETED).length;
    const running = nodes.filter(n => n.data.status === NODE_STATUS.RUNNING).length;
    const failed = nodes.filter(n => n.data.status === NODE_STATUS.FAILED).length;
    const pending = nodes.filter(n => n.data.status === NODE_STATUS.PENDING).length;

    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, running, failed, pending, progress };
  }, [nodes]);

  // 경과 시간 계산
  const elapsedTime = useMemo(() => {
    if (!startTime) return '0s';
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }, [startTime]);

  // 현재 단계 표시 이름
  const stageDisplayNames = {
    [WORKFLOW_STAGE.INITIALIZATION]: '초기화',
    [WORKFLOW_STAGE.DATA_COLLECTION]: '데이터 수집',
    [WORKFLOW_STAGE.DATA_ANALYSIS]: '데이터 분석',
    [WORKFLOW_STAGE.LLM_PROCESSING]: 'AI 분석',
    [WORKFLOW_STAGE.REPORT_GENERATION]: '보고서 생성',
    [WORKFLOW_STAGE.COMPLETED]: '완료',
    [WORKFLOW_STAGE.FAILED]: '실패'
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* 전체 진행률 */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">전체 진행률</span>
              <span className="text-sm text-muted-foreground">{stats.progress}%</span>
            </div>
            <Progress value={stats.progress} className="h-2" />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{stats.completed} / {stats.total} 완료</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{elapsedTime}</span>
              </div>
            </div>
          </div>

          {/* 현재 단계 */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground mb-1">현재 단계</span>
            <Badge variant="outline" className="text-sm">
              {stageDisplayNames[currentStage] || currentStage}
            </Badge>
          </div>

          {/* 상태별 카운트 */}
          <div className="col-span-2 grid grid-cols-4 gap-2">
            <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center justify-center mb-1">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              </div>
              <div className="text-lg font-bold text-blue-600">{stats.running}</div>
              <div className="text-xs text-blue-700">실행 중</div>
            </div>

            <div className="text-center p-2 bg-green-50 rounded border border-green-200">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-lg font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-green-700">완료</div>
            </div>

            <div className="text-center p-2 bg-red-50 rounded border border-red-200">
              <div className="flex items-center justify-center mb-1">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-lg font-bold text-red-600">{stats.failed}</div>
              <div className="text-xs text-red-700">실패</div>
            </div>

            <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center justify-center mb-1">
                <Clock className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-lg font-bold text-gray-600">{stats.pending}</div>
              <div className="text-xs text-gray-700">대기</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

StatusPanel.displayName = 'StatusPanel';

export default StatusPanel;
