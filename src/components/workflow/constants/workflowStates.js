/**
 * 워크플로우 및 노드 상태 정의
 */

export const NODE_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  RETRYING: 'retrying'
};

export const WORKFLOW_STAGE = {
  INITIALIZATION: 'initialization',
  DATA_COLLECTION: 'data_collection',
  DATA_ANALYSIS: 'data_analysis',
  LLM_PROCESSING: 'llm_processing',
  REPORT_GENERATION: 'report_generation',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const EDGE_STATUS = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  RETRY: 'retry'
};
