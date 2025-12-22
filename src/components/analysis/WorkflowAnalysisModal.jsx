import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Brain,
  Loader2,
  GitBranch,
  RotateCcw
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

// 커스텀 노드 타입 import
import OrchestratorNode from '../workflow/nodes/OrchestratorNode';
import CollectorNode from '../workflow/nodes/CollectorNode';
import AnalyzerNode from '../workflow/nodes/AnalyzerNode';
import LLMProcessorNode from '../workflow/nodes/LLMProcessorNode';
import ReporterNode from '../workflow/nodes/ReporterNode';

// Dagre 레이아웃 엔진
import { calculateLayout } from '../workflow/utils/layoutEngine';

// DetailSidebar
import DetailSidebar from '../workflow/components/DetailSidebar';

// 상수
import { AGENT_CATEGORY_MAP, AGENT_DISPLAY_NAMES } from '../workflow/constants/agentTypes';

/**
 * WorkflowAnalysisModal - 계층적 워크플로우 시각화
 * 
 * 주요 기능:
 * 1. 에이전트 계층 구조(Orchestrator -> Worker) 시각화
 * 2. 실시간 실행 로그 및 데이터 누적 (DetailSidebar 연동)
 * 3. 동적 노드 추가 및 자동 레이아웃
 */

// React Flow 노드 타입 등록
const NODE_TYPES = {
  OrchestratorNode,
  CollectorNode,
  AnalyzerNode,
  LLMProcessorNode,
  ReporterNode
};

// 에이전트 계층 구조 정의 (Child -> Parent)
const PARENT_MAPPING = {
  // 1. 초기화 및 검증
  'data_validation': 'orchestrator',
  'user_request_handler': 'orchestrator',
  'intent_analyzer': 'orchestrator',
  
  // 2. Step 1: 수집
  'data_collection_orchestrator': 'orchestrator',
  'comprehensive_collector': 'data_collection_orchestrator',
  'company_info_collector': 'data_collection_orchestrator',
  'financial_data_collector': 'data_collection_orchestrator',
  'news_collector': 'data_collection_orchestrator',
  'market_scanner': 'data_collection_orchestrator',
  'investment_info_collector': 'data_collection_orchestrator',
  'incremental_collector': 'data_collection_orchestrator',

  // 3. Step 2: 분석
  'data_analysis_orchestrator': 'orchestrator',
  'technical_analysis': 'data_analysis_orchestrator',
  'fundamental_analysis': 'data_analysis_orchestrator',
  'news_analysis': 'data_analysis_orchestrator',
  'financial_market_analyzer': 'data_analysis_orchestrator',
  'enhanced_technical_analyzer': 'data_analysis_orchestrator',

  // 4. Step 3: LLM
  'llm_processing_orchestrator': 'orchestrator',
  'comprehensive_analysis': 'llm_processing_orchestrator',
  'investment_recommendation': 'llm_processing_orchestrator',
  'financial_llm_analyzer': 'llm_processing_orchestrator',

  // 5. Step 4: 리포트
  'report_generation_orchestrator': 'orchestrator',
  'individual_report': 'report_generation_orchestrator',
  'portfolio_report': 'report_generation_orchestrator',
  
  // 종료
  'llm_complete': 'orchestrator'
};

// 에이전트 타입을 React Flow 노드 타입으로 매핑
const getNodeType = (agentType) => {
  const category = AGENT_CATEGORY_MAP[agentType];
  if (!category) return 'CollectorNode';

  const categoryToNodeType = {
    'orchestrator': 'OrchestratorNode',
    'collector': 'CollectorNode',
    'analyzer': 'AnalyzerNode',
    'llm_processor': 'LLMProcessorNode',
    'reporter': 'ReporterNode',
    'validator': 'AnalyzerNode',
    'monitor': 'CollectorNode',
    'support': 'CollectorNode',
    'workflow_control': 'OrchestratorNode'
  };

  return categoryToNodeType[category] || 'CollectorNode';
};

const WorkflowAnalysisModal = ({ requestId, socket, onClose }) => {
  // React Flow nodeTypes 메모이제이션 (성능 최적화 및 경고 방지)
  const nodeTypes = useMemo(() => NODE_TYPES, []);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [progress, setProgress] = useState(0);
  const [isDynamic, setIsDynamic] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const hasInitialized = useRef(false);
  
  // 노드 데이터 refs (상태 업데이트 최적화 및 데이터 누적용)
  const nodesDataRef = useRef({});
  // 선택된 노드 ID 추적용 ref (useEffect 의존성 제거를 위해)
  const selectedNodeIdRef = useRef(null);

  // 선택된 노드가 변경될 때 ref 업데이트
  useEffect(() => {
    selectedNodeIdRef.current = selectedNode ? selectedNode.id : null;
  }, [selectedNode]);

  // 노드 클릭 핸들러
  const onNodeClick = useCallback((event, node) => {
    // ref에서 최신 데이터를 가져옴
    const latestData = nodesDataRef.current[node.id] || node.data;
    setSelectedNode({
      ...node,
      data: latestData
    });
  }, []);

  const closeSidebar = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // WebSocket 처리
  useEffect(() => {
    if (!socket || !requestId) return;

    console.log('[WorkflowModal] Setting up WebSocket for:', requestId);

    // Room 구독
    socket.emit('subscribe_agent_thinking', { request_id: requestId });

    const handleAgentThinking = (data) => {
      if (!data.agent_id) return;

      const agentId = data.agent_id;
      const displayName = AGENT_DISPLAY_NAMES[agentId] || data.agent_name || agentId;
      const category = AGENT_CATEGORY_MAP[agentId] || 'collector';
      
      // 타임스탬프 생성
      const timestamp = new Date().toLocaleTimeString();
      
      // 로그 엔트리 객체 생성 (DetailSidebar 호환)
      const logEntry = {
        timestamp: timestamp,
        message: data.message || data.status,
        level: (data.status === 'failed' || data.status === 'error') ? 'error' : 'info'
      };

      // 1. 데이터 누적 (Ref 업데이트)
      const prevData = nodesDataRef.current[agentId] || {
        logs: [],
        input_data: null,
        output_data: null,
        process_data: null, // 초기값 추가
        start_time: null
      };

      const newData = {
        ...prevData,
        label: displayName,
        status: data.status,
        category: category,
        message: data.message,
        agent_type: agentId,
        // 로그 누적
        logs: [...(prevData.logs || []), logEntry],
        // 시작 시간 보존
        start_time: prevData.start_time || data.start_time || (data.status === 'running' ? new Date().toISOString() : null),
        // 종료 시간 업데이트
        end_time: data.end_time || (data.status === 'completed' ? new Date().toISOString() : null),
        // 입출력 및 진행 데이터 업데이트 (있는 경우만)
        input_data: data.input_data || prevData.input_data,
        output_data: data.output_data || prevData.output_data,
        process_data: data.process_data || prevData.process_data, // process_data 처리 추가
        duration: data.duration || prevData.duration
      };

      nodesDataRef.current[agentId] = newData;

      // 2. 노드 및 엣지 업데이트 (React State)
      setNodes((prevNodes) => {
        const nodeExists = prevNodes.some(n => n.id === agentId);
        
        let updatedNodes = [];
        
        if (nodeExists) {
          // 기존 노드 업데이트
          updatedNodes = prevNodes.map(n => 
            n.id === agentId ? { ...n, data: newData } : n
          );
        } else {
          // 새 노드 생성
          const newNode = {
            id: agentId,
            type: getNodeType(agentId),
            data: newData,
            position: { x: 0, y: 0 } // 레이아웃 엔진이 재배치함
          };
          updatedNodes = [...prevNodes, newNode];
          setIsDynamic(true);
        }
        
        // 3. 엣지 자동 생성 (계층 구조 기반)
        setEdges((prevEdges) => {
          let newEdges = [...prevEdges];
          const parentId = PARENT_MAPPING[agentId];

          // 부모가 존재하고, 부모 노드가 이미 생성되어 있을 때 엣지 연결
          if (parentId && nodesDataRef.current[parentId]) {
            const edgeId = `e-${parentId}-${agentId}`;
            if (!prevEdges.some(e => e.id === edgeId)) {
              newEdges.push({
                id: edgeId,
                source: parentId,
                target: agentId,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#94a3b8', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed }
              });
            }
          } 
          
          return newEdges;
        });

        return updatedNodes;
      });

      // 진행률 계산
      setProgress(() => {
         const total = Object.keys(nodesDataRef.current).length;
         if (total === 0) return 0;
         const completed = Object.values(nodesDataRef.current).filter(d => d.status === 'completed').length;
         return Math.round((completed / total) * 100);
      });
      
      setLastUpdate(new Date().toISOString());

      // 선택된 노드 실시간 업데이트 (ref 사용으로 useEffect 의존성 제거)
      if (selectedNodeIdRef.current === agentId) {
        setSelectedNode(prev => prev ? { ...prev, data: newData } : null);
      }
    };

    socket.on('agent_thinking', handleAgentThinking);
    
    // Workflow 구조 업데이트 이벤트 리스너
    const handleWorkflowStructureUpdate = (data) => {
       // 구조 업데이트 로직 (필요시 구현)
    };
    socket.on('workflow_structure_update', handleWorkflowStructureUpdate);

    // 초기화 요청
    if (!hasInitialized.current) {
      socket.emit('get_workflow_metadata', { request_id: requestId });
      hasInitialized.current = true;
    }

    return () => {
      socket.off('agent_thinking', handleAgentThinking);
      socket.off('workflow_structure_update', handleWorkflowStructureUpdate);
      socket.emit('unsubscribe_agent_thinking', { request_id: requestId });
    };
  }, [socket, requestId]); // selectedNode 제거하여 재연결 방지

  // 노드/엣지 변경 시 레이아웃 재계산 (Debounced)
    const layoutTimerRef = useRef(null);

    const scheduleLayout = useCallback(() => {
      if (layoutTimerRef.current) clearTimeout(layoutTimerRef.current);

      layoutTimerRef.current = setTimeout(() => {
        setNodes((currNodes) => {
          // edges는 최신을 별도로 읽어야 함 → 아래 3)와 같이 구조 개선 권장
          return currNodes;
        });
      }, 100);
    }, [setNodes]);


  // 오버레이 클릭 핸들러
  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <Card className="w-full max-w-[95vw] h-[90vh] flex flex-col bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GitBranch className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                워크플로우 실행 현황
                {isDynamic && <Badge variant="outline" className="ml-2 text-blue-600 border-blue-200 bg-blue-50">실시간 연결됨</Badge>}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded">요청ID:{requestId}</span>
                {lastUpdate && <span>• 마지막 수신: {new Date(lastUpdate).toLocaleTimeString()}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button
              onClick={() => {
                 const { nodes: lNodes, edges: lEdges } = calculateLayout(nodes, edges);
                 setNodes(lNodes);
                 setEdges(lEdges);
              }}
              className="p-2 hover:bg-white rounded-full transition-colors text-slate-500"
              title="레이아웃 다시 정렬"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              분석 닫기
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-slate-100">
          <div
            className="h-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative flex overflow-hidden">
          <div className="flex-1 relative h-full bg-slate-50">
            {nodes.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">실행 이벤트를 기다리는 중...</p>
                <p className="text-xs text-slate-400 mt-1">실시간 스트림에 연결되었습니다. </p>
              </div>
            ) : (
              <ReactFlowProvider>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{ padding: 0.2 }}
                  minZoom={0.1}
                  maxZoom={2.0}
                  defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: '#94a3b8', strokeWidth: 2 }
                  }}
                >
                  <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#cbd5e1" />
                  <Controls showInteractive={false} className="bg-white shadow-lg border-slate-200" />
                  <MiniMap
                    nodeColor={(node) => {
                      const colors = {
                        orchestrator: '#9333ea',
                        collector: '#3b82f6',
                        analyzer: '#10b981',
                        llm_processor: '#f59e0b',
                        reporter: '#6b7280'
                      };
                      return colors[node.data.category] || '#9ca3af';
                    }}
                    className="bg-white shadow-lg border-slate-200 rounded-lg overflow-hidden"
                  />
                </ReactFlow>
              </ReactFlowProvider>
            )}
          </div>

          {/* Detail Sidebar (Slide-in) */}
          {selectedNode && (
            <div className="w-[400px] border-l bg-white shadow-xl z-10 overflow-hidden flex flex-col transition-all duration-300 ease-in-out">
              <DetailSidebar
                node={selectedNode}
                onClose={closeSidebar}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WorkflowAnalysisModal;
