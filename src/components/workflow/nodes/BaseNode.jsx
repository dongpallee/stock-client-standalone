/**
 * 모든 에이전트 노드의 공통 베이스 컴포넌트
 */

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { CheckCircle, XCircle, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { NODE_STATUS } from '../constants/workflowStates';

const STATUS_ICONS = {
  [NODE_STATUS.PENDING]: Clock,
  [NODE_STATUS.RUNNING]: Loader2,
  [NODE_STATUS.COMPLETED]: CheckCircle,
  [NODE_STATUS.FAILED]: XCircle,
  [NODE_STATUS.RETRYING]: AlertTriangle,
  [NODE_STATUS.SKIPPED]: Clock
};

const BaseNode = memo(({ data, style, children }) => {
  const {
    label,
    status = NODE_STATUS.PENDING,
    category,
    progress,
    duration,
    onClick
  } = data;

  const StatusIcon = STATUS_ICONS[status];
  const isAnimated = status === NODE_STATUS.RUNNING || status === NODE_STATUS.RETRYING;

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 shadow-md
        transition-all duration-300 cursor-pointer
        min-w-[180px] max-w-[220px]
        ${onClick ? 'hover:shadow-lg hover:scale-105' : ''}
      `}
      style={style}
      onClick={onClick}
    >
      {/* 상단 핸들 (입력) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400"
      />

      {/* 노드 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <StatusIcon
            className={`w-4 h-4 ${isAnimated ? 'animate-spin' : ''}`}
            style={{ color: style.borderColor }}
          />
          <span className="text-xs font-medium uppercase tracking-wide opacity-70">
            {category}
          </span>
        </div>
        {duration && (
          <span className="text-xs text-gray-500">
            {duration}s
          </span>
        )}
      </div>

      {/* 노드 레이블 */}
      <div className="font-semibold text-sm mb-2">
        {label}
      </div>

      {/* 커스텀 컨텐츠 */}
      {children}

      {/* 프로그레스 바 (실행 중일 때만) */}
      {status === NODE_STATUS.RUNNING && progress !== undefined && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: style.borderColor
            }}
          />
        </div>
      )}

      {/* 하단 핸들 (출력) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-400"
      />
    </div>
  );
});

BaseNode.displayName = 'BaseNode';

export default BaseNode;
