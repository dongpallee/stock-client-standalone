/**
 * 노드 상세 정보 사이드바
 */

import React from 'react';
import { X, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NODE_STATUS } from '../constants/workflowStates';
import { AGENT_DISPLAY_NAMES } from '../constants/agentTypes';

const STATUS_ICONS = {
  [NODE_STATUS.PENDING]: Clock,
  [NODE_STATUS.RUNNING]: Clock,
  [NODE_STATUS.COMPLETED]: CheckCircle,
  [NODE_STATUS.FAILED]: XCircle,
  [NODE_STATUS.RETRYING]: AlertTriangle
};

const DetailSidebar = React.memo(({ node, onClose }) => {
  if (!node) return null;

  const { data } = node;
  const StatusIcon = STATUS_ICONS[data.status] || Clock;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l shadow-lg z-50 flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">{data.label}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <StatusIcon className="w-4 h-4" />
          <Badge variant={
            data.status === NODE_STATUS.COMPLETED ? 'default' :
            data.status === NODE_STATUS.FAILED ? 'destructive' :
            data.status === NODE_STATUS.RUNNING ? 'secondary' : 'outline'
          }>
            {data.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {data.category}
          </span>
        </div>
      </div>

      {/* 본문 */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* 실행 정보 */}
          <section>
            <h4 className="font-medium mb-2">실행 정보</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">노드 ID:</span>
                <span className="font-mono">{node.id}</span>
              </div>
              {data.start_time && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">시작 시간:</span>
                  <span>{new Date(data.start_time).toLocaleTimeString()}</span>
                </div>
              )}
              {data.end_time && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">종료 시간:</span>
                  <span>{new Date(data.end_time).toLocaleTimeString()}</span>
                </div>
              )}
              {data.duration && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">소요 시간:</span>
                  <span>{data.duration}초</span>
                </div>
              )}
              {data.progress !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">진행률:</span>
                  <span>{data.progress}%</span>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* 입력 데이터 */}
          {data.input_data && (
            <>
              <section>
                <h4 className="font-medium mb-2">입력 데이터</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(data.input_data, null, 2)}
                </pre>
              </section>
              <Separator />
            </>
          )}

          {/* 출력 데이터 */}
          {data.output_data && (
            <>
              <section>
                <h4 className="font-medium mb-2">출력 데이터</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(data.output_data, null, 2)}
                </pre>
              </section>
              <Separator />
            </>
          )}

          {/* 로그 */}
          {data.logs && data.logs.length > 0 && (
            <section>
              <h4 className="font-medium mb-2">실행 로그</h4>
              <div className="space-y-1">
                {data.logs.map((log, index) => (
                  <div key={index} className="text-xs font-mono bg-muted p-2 rounded">
                    <span className="text-muted-foreground">[{log.timestamp}]</span>{' '}
                    <span className={
                      log.level === 'error' ? 'text-red-600' :
                      log.level === 'warning' ? 'text-amber-600' :
                      'text-foreground'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 에러 메시지 */}
          {data.status === NODE_STATUS.FAILED && data.error_message && (
            <section>
              <h4 className="font-medium mb-2 text-red-600">에러 정보</h4>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-900">{data.error_message}</p>
                {data.error_stack && (
                  <pre className="text-xs text-red-800 mt-2 overflow-x-auto">
                    {data.error_stack}
                  </pre>
                )}
              </div>
            </section>
          )}

          <Separator />

          {/* 진행 데이터 (실시간 업데이트) */}
          {data.process_data && (
            <>
              <section>
                <h4 className="font-medium mb-2 text-blue-600">중간 처리 데이터</h4>
                <pre className="text-xs bg-blue-50 p-2 rounded overflow-x-auto border border-blue-100">
                  {JSON.stringify(data.process_data, null, 2)}
                </pre>
              </section>
              <Separator />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

DetailSidebar.displayName = 'DetailSidebar';

export default DetailSidebar;
