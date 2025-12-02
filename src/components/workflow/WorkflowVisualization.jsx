/**
 * 워크플로우 실시간 시각화 - React Flow 기반
 */

import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';

// 커스텀 노드 컴포넌트
import OrchestratorNode from './nodes/OrchestratorNode';
import CollectorNode from './nodes/CollectorNode';
import AnalyzerNode from './nodes/AnalyzerNode';
import LLMProcessorNode from './nodes/LLMProcessorNode';
import ReporterNode from './nodes/ReporterNode';

// UI 컴포넌트
import StatusPanel from './components/StatusPanel';
import DetailSidebar from './components/DetailSidebar';

// 훅
import { useWorkflowData } from './hooks/useWorkflowData';
import { useWorkflowWebSocket } from './hooks/useWebSocket';

// 상수
import { WORKFLOW_STAGE } from './constants/workflowStates';

// React Flow 노드 타입 등록
const nodeTypes = {
  OrchestratorNode,
  CollectorNode,
  AnalyzerNode,
  LLMProcessorNode,
  ReporterNode
};

const WorkflowVisualization = ({ requestId }) => {
  // 상태 관리
  const [selectedNode, setSelectedNode] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [currentStage, setCurrentStage] = useState(WORKFLOW_STAGE.INITIALIZATION);

  // 워크플로우 데이터 관리
  const {
    nodes,
    edges,
    updateNodeStatus,
    updateEdgeStatus,
    addDynamicNode,
    updateWorkflowStructure,
    setNodes,
    setEdges
  } = useWorkflowData(null);

  // WebSocket 콜백 핸들러
  const handleWorkflowMetadata = useCallback((data) => {
    console.log('[WorkflowVisualization] Metadata received:', data);

    // 초기 워크플로우 구조 설정
    if (data.nodes && data.edges) {
      const workflowData = {
        nodes: data.nodes,
        edges: data.edges
      };

      // useWorkflowData의 initializeWorkflow 로직 직접 호출
      setNodes(workflowData.nodes);
      setEdges(workflowData.edges);
    }

    // 시작 시간 설정
    if (data.start_time) {
      setStartTime(new Date(data.start_time));
    }

    // 현재 단계 설정
    if (data.current_stage) {
      setCurrentStage(data.current_stage);
    }
  }, [setNodes, setEdges]);

  const handleAgentThinking = useCallback((data) => {
    console.log('[WorkflowVisualization] Agent thinking:', data);

    const { node_id, status, progress, duration, metadata } = data;

    // 노드 상태 업데이트
    if (node_id) {
      updateNodeStatus(node_id, {
        status,
        progress,
        duration,
        ...metadata
      });
    }

    // 현재 단계 업데이트
    if (data.current_stage) {
      setCurrentStage(data.current_stage);
    }

    // 엣지 애니메이션 (실행 중인 노드의 incoming edge 활성화)
    if (status === 'running' && node_id) {
      const incomingEdge = edges.find(edge => edge.target === node_id);
      if (incomingEdge) {
        updateEdgeStatus(incomingEdge.id, 'active');
      }
    }
  }, [updateNodeStatus, updateEdgeStatus, edges]);

  const handleWorkflowStructureUpdate = useCallback((data) => {
    console.log('[WorkflowVisualization] Structure update:', data);

    // 동적 구조 변경 처리 (노드 추가/삭제)
    if (data.added_node) {
      addDynamicNode(data.added_node, data.connection);
    } else if (data.new_structure) {
      updateWorkflowStructure(data.new_structure);
    }
  }, [addDynamicNode, updateWorkflowStructure]);

  const handleWorkflowComplete = useCallback((data) => {
    console.log('[WorkflowVisualization] Workflow complete:', data);

    // 완료 상태로 전환
    setCurrentStage(WORKFLOW_STAGE.COMPLETED);

    // 모든 실행 중인 엣지 비활성화
    edges.forEach(edge => {
      if (edge.animated) {
        updateEdgeStatus(edge.id, 'completed');
      }
    });
  }, [edges, updateEdgeStatus]);

  const handleError = useCallback((error) => {
    console.error('[WorkflowVisualization] Error:', error);

    // 에러 상태로 전환
    setCurrentStage(WORKFLOW_STAGE.FAILED);
  }, []);

  // WebSocket 연결
  const { socket, requestNodeDetails, pauseWorkflow, resumeWorkflow } = useWorkflowWebSocket(
    requestId,
    {
      onWorkflowMetadata: handleWorkflowMetadata,
      onAgentThinking: handleAgentThinking,
      onWorkflowStructureUpdate: handleWorkflowStructureUpdate,
      onWorkflowComplete: handleWorkflowComplete,
      onError: handleError
    }
  );

  // 노드 클릭 핸들러
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);

    // 서버에 노드 상세 정보 요청
    if (requestNodeDetails) {
      requestNodeDetails(node.id);
    }
  }, [requestNodeDetails]);

  // 사이드바 닫기
  const closeSidebar = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // React Flow 기본 설정
  const defaultEdgeOptions = {
    animated: false,
    style: { stroke: '#9ca3af', strokeWidth: 2 }
  };

  const proOptions = { hideAttribution: true };

  return (
    <div className="relative w-full h-screen">
      {/* 상단 상태 패널 */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <StatusPanel
          nodes={nodes}
          startTime={startTime}
          currentStage={currentStage}
        />
      </div>

      {/* React Flow 캔버스 */}
      <div className="w-full h-full pt-32">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          defaultEdgeOptions={defaultEdgeOptions}
          proOptions={proOptions}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#e5e7eb"
          />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.data.category) {
                case 'orchestrator': return '#9333ea';
                case 'collector': return '#3b82f6';
                case 'analyzer': return '#10b981';
                case 'llm_processor': return '#f59e0b';
                case 'reporter': return '#6b7280';
                default: return '#9ca3af';
              }
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>
      </div>

      {/* 노드 상세 정보 사이드바 */}
      {selectedNode && (
        <DetailSidebar
          node={selectedNode}
          onClose={closeSidebar}
        />
      )}
    </div>
  );
};

export default WorkflowVisualization;
