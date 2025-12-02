/**
 * 에이전트 타입에 따른 노드 생성 및 스타일 적용
 */

import {
  AGENT_TYPES,
  AGENT_CATEGORY_MAP,
  AGENT_DISPLAY_NAMES
} from '../constants/agentTypes';
import { NODE_COLORS } from '../constants/nodeStyles';

// 노드 타입 컴포넌트 매핑
export const NODE_TYPE_COMPONENTS = {
  orchestrator: 'OrchestratorNode',
  collector: 'CollectorNode',
  analyzer: 'AnalyzerNode',
  llm_processor: 'LLMProcessorNode',
  reporter: 'ReporterNode',
  validator: 'CollectorNode',      // 공통 노드 재사용
  monitor: 'CollectorNode',        // 공통 노드 재사용
  support: 'CollectorNode',        // 공통 노드 재사용
  workflow_control: 'OrchestratorNode'  // 공통 노드 재사용
};

/**
 * 백엔드에서 전달받은 노드 데이터를 React Flow 형식으로 변환
 */
export function createFlowNode(agentData) {
  const {
    id,
    agent_type,
    status = 'pending',
    progress,
    duration,
    metadata = {}
  } = agentData;

  const category = AGENT_CATEGORY_MAP[agent_type];
  const displayName = AGENT_DISPLAY_NAMES[agent_type] || agent_type;
  const nodeType = NODE_TYPE_COMPONENTS[category] || 'CollectorNode';

  return {
    id,
    type: nodeType,
    data: {
      label: displayName,
      status,
      category,
      progress,
      duration,
      ...metadata
    },
    position: { x: 0, y: 0 }  // 레이아웃 엔진에서 계산
  };
}

/**
 * 여러 노드 배치 생성
 */
export function createFlowNodes(agentsData) {
  return agentsData.map(createFlowNode);
}

/**
 * 엣지 생성
 */
export function createFlowEdge(from, to, edgeType = 'default') {
  return {
    id: `${from}-${to}`,
    source: from,
    target: to,
    type: 'smoothstep',
    animated: edgeType === 'active',
    style: getEdgeStyle(edgeType)
  };
}

/**
 * 엣지 스타일 가져오기
 */
function getEdgeStyle(edgeType) {
  const styles = {
    default: { stroke: '#9ca3af', strokeWidth: 2 },
    active: { stroke: '#3b82f6', strokeWidth: 3 },
    completed: { stroke: '#10b981', strokeWidth: 2 },
    retry: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' }
  };
  return styles[edgeType] || styles.default;
}
