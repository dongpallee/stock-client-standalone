/**
 * 워크플로우 데이터 관리 훅
 */

import { useState, useCallback, useEffect } from 'react';
import { calculateLayout, smoothReposition } from '../utils/layoutEngine';
import { createFlowNodes, createFlowEdge } from '../utils/nodeFactory';

export function useWorkflowData(initialData) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isLayouted, setIsLayouted] = useState(false);

  /**
   * 초기 워크플로우 구조 설정
   */
  const initializeWorkflow = useCallback((workflowData) => {
    const { nodes: rawNodes, edges: rawEdges } = workflowData;

    // 노드 및 엣지 생성
    const flowNodes = createFlowNodes(rawNodes);
    const flowEdges = rawEdges.map(e =>
      createFlowEdge(e.source, e.target, e.type)
    );

    // 레이아웃 계산
    const { nodes: layoutedNodes, edges: layoutedEdges } =
      calculateLayout(flowNodes, flowEdges);

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setIsLayouted(true);
  }, []);

  /**
   * 노드 상태 업데이트
   */
  const updateNodeStatus = useCallback((nodeId, statusData) => {
    setNodes(prevNodes =>
      prevNodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...statusData
            }
          };
        }
        return node;
      })
    );
  }, []);

  /**
   * 동적 노드 추가 (재시도, 병렬 실행 등)
   */
  const addDynamicNode = useCallback((newNodeData, connectionData) => {
    const newFlowNode = createFlowNodes([newNodeData])[0];

    setNodes(prevNodes => {
      // 새 노드 추가
      const updatedNodes = [...prevNodes, newFlowNode];

      // 레이아웃 재계산
      const { nodes: relayoutedNodes } = calculateLayout(
        updatedNodes,
        edges
      );

      // 부드러운 전환
      return smoothReposition(prevNodes, relayoutedNodes);
    });

    // 연결 엣지 추가
    if (connectionData) {
      const newEdge = createFlowEdge(
        connectionData.from,
        newNodeData.id,
        'default'
      );
      setEdges(prevEdges => [...prevEdges, newEdge]);
    }
  }, [edges]);

  /**
   * 엣지 상태 업데이트
   */
  const updateEdgeStatus = useCallback((edgeId, edgeType) => {
    setEdges(prevEdges =>
      prevEdges.map(edge => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            animated: edgeType === 'active',
            style: getEdgeStyle(edgeType)
          };
        }
        return edge;
      })
    );
  }, []);

  /**
   * 전체 워크플로우 구조 갱신 (동적 변경 시)
   */
  const updateWorkflowStructure = useCallback((newStructure) => {
    const { nodes: rawNodes, edges: rawEdges } = newStructure;

    const flowNodes = createFlowNodes(rawNodes);
    const flowEdges = rawEdges.map(e =>
      createFlowEdge(e.source, e.target, e.type)
    );

    const { nodes: layoutedNodes, edges: layoutedEdges } =
      calculateLayout(flowNodes, flowEdges);

    // 기존 노드 위치 보존하며 부드럽게 전환
    const transitionedNodes = smoothReposition(nodes, layoutedNodes);

    setNodes(transitionedNodes);
    setEdges(layoutedEdges);
  }, [nodes]);

  // 초기 데이터 로드
  useEffect(() => {
    if (initialData && !isLayouted) {
      initializeWorkflow(initialData);
    }
  }, [initialData, isLayouted, initializeWorkflow]);

  return {
    nodes,
    edges,
    updateNodeStatus,
    updateEdgeStatus,
    addDynamicNode,
    updateWorkflowStructure,
    setNodes,
    setEdges
  };
}

function getEdgeStyle(edgeType) {
  const styles = {
    default: { stroke: '#9ca3af', strokeWidth: 2 },
    active: { stroke: '#3b82f6', strokeWidth: 3 },
    completed: { stroke: '#10b981', strokeWidth: 2 },
    retry: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' }
  };
  return styles[edgeType] || styles.default;
}
