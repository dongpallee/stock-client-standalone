/**
 * 노드 및 엣지 스타일 정의
 */

export const NODE_COLORS = {
  orchestrator: {
    border: '#9333ea',      // purple-600
    background: '#f3e8ff',  // purple-100
    text: '#581c87'         // purple-900
  },
  collector: {
    border: '#3b82f6',      // blue-600
    background: '#dbeafe',  // blue-100
    text: '#1e3a8a'         // blue-900
  },
  analyzer: {
    border: '#10b981',      // green-600
    background: '#d1fae5',  // green-100
    text: '#064e3b'         // green-900
  },
  llm_processor: {
    border: '#f59e0b',      // amber-600
    background: '#fef3c7',  // amber-100
    text: '#78350f'         // amber-900
  },
  reporter: {
    border: '#6b7280',      // gray-600
    background: '#f3f4f6',  // gray-100
    text: '#1f2937'         // gray-900
  },
  validator: {
    border: '#8b5cf6',      // violet-600
    background: '#ede9fe',  // violet-100
    text: '#5b21b6'         // violet-900
  },
  monitor: {
    border: '#06b6d4',      // cyan-600
    background: '#cffafe',  // cyan-100
    text: '#164e63'         // cyan-900
  },
  support: {
    border: '#84cc16',      // lime-600
    background: '#ecfccb',  // lime-100
    text: '#365314'         // lime-900
  },
  workflow_control: {
    border: '#ec4899',      // pink-600
    background: '#fce7f3',  // pink-100
    text: '#831843'         // pink-900
  }
};

export const STATUS_COLORS = {
  pending: {
    border: '#9ca3af',      // gray-400
    background: 'transparent',
    glow: 'none'
  },
  running: {
    border: '#3b82f6',      // blue-600
    background: '#dbeafe',  // blue-100
    glow: '0 0 10px rgba(59, 130, 246, 0.5)'
  },
  completed: {
    border: '#10b981',      // green-600
    background: '#d1fae5',  // green-100
    glow: 'none'
  },
  failed: {
    border: '#ef4444',      // red-600
    background: '#fee2e2',  // red-100
    glow: '0 0 10px rgba(239, 68, 68, 0.5)'
  },
  retrying: {
    border: '#f59e0b',      // amber-600
    background: '#fef3c7',  // amber-100
    glow: '0 0 10px rgba(245, 158, 11, 0.5)'
  },
  skipped: {
    border: '#6b7280',      // gray-600
    background: '#f3f4f6',  // gray-100
    glow: 'none'
  }
};

export const EDGE_STYLES = {
  default: {
    stroke: '#9ca3af',      // gray-400
    strokeWidth: 2,
    animated: false
  },
  active: {
    stroke: '#3b82f6',      // blue-600
    strokeWidth: 3,
    animated: true,
    animationDuration: 1
  },
  completed: {
    stroke: '#10b981',      // green-600
    strokeWidth: 2,
    animated: false
  },
  retry: {
    stroke: '#f59e0b',      // amber-600
    strokeWidth: 2,
    strokeDasharray: '5,5',
    animated: false
  }
};

export const NODE_SHAPES = {
  orchestrator: 'rounded-rectangle',    // 둥근 사각형
  collector: 'rectangle',               // 사각형
  analyzer: 'hexagon',                  // 육각형
  llm_processor: 'circle',              // 원형
  reporter: 'document',                 // 문서 모양
  validator: 'diamond',                 // 마름모
  monitor: 'octagon',                   // 팔각형
  support: 'ellipse',                   // 타원
  workflow_control: 'parallelogram'     // 평행사변형
};
