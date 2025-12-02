/**
 * Dagre 기반 자동 레이아웃 엔진
 */

import dagre from 'dagre';

const DEFAULT_LAYOUT_OPTIONS = {
  rankdir: 'TB',        // Top to Bottom
  align: 'UL',          // Upper Left
  nodesep: 80,          // 노드 간 수평 간격
  ranksep: 100,         // 계층 간 수직 간격
  marginx: 50,
  marginy: 50
};

const NODE_DIMENSIONS = {
  width: 200,
  height: 80
};

/**
 * Dagre를 사용한 자동 레이아웃 계산
 */
export function calculateLayout(nodes, edges, options = {}) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // 레이아웃 옵션 설정
  const layoutOptions = { ...DEFAULT_LAYOUT_OPTIONS, ...options };
  dagreGraph.setGraph(layoutOptions);

  // 노드 추가
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: NODE_DIMENSIONS.width,
      height: NODE_DIMENSIONS.height
    });
  });

  // 엣지 추가
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 레이아웃 계산
  dagre.layout(dagreGraph);

  // 계산된 위치를 노드에 적용
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_DIMENSIONS.width / 2,
        y: nodeWithPosition.y - NODE_DIMENSIONS.height / 2
      }
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * 계층 구조 기반 레이아웃 (수동)
 */
export function calculateHierarchicalLayout(nodes, edges) {
  // 노드를 계층(depth)별로 그룹화
  const layers = organizeByDepth(nodes, edges);

  const layoutedNodes = [];
  const layerHeight = 150;
  const nodeSpacing = 220;

  layers.forEach((layer, layerIndex) => {
    const layerY = layerIndex * layerHeight + 50;
    const layerWidth = layer.length * nodeSpacing;
    const startX = -layerWidth / 2;

    layer.forEach((node, nodeIndex) => {
      layoutedNodes.push({
        ...node,
        position: {
          x: startX + nodeIndex * nodeSpacing + 100,
          y: layerY
        }
      });
    });
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * 노드를 깊이별로 조직화
 */
function organizeByDepth(nodes, edges) {
  const nodeMap = new Map(nodes.map(n => [n.id, { ...n, depth: -1 }]));
  const visited = new Set();
  const layers = [];

  // 루트 노드 찾기 (incoming edge가 없는 노드)
  const rootNodes = nodes.filter(node =>
    !edges.some(edge => edge.target === node.id)
  );

  // BFS로 깊이 계산
  const queue = rootNodes.map(n => ({ id: n.id, depth: 0 }));

  while (queue.length > 0) {
    const { id, depth } = queue.shift();

    if (visited.has(id)) continue;
    visited.add(id);

    const node = nodeMap.get(id);
    node.depth = depth;

    // 레이어 배열 초기화
    if (!layers[depth]) layers[depth] = [];
    layers[depth].push(node);

    // 자식 노드 탐색
    edges
      .filter(edge => edge.source === id)
      .forEach(edge => {
        queue.push({ id: edge.target, depth: depth + 1 });
      });
  }

  return layers;
}

/**
 * 노드 재정렬 (부드러운 애니메이션용)
 */
export function smoothReposition(oldNodes, newNodes) {
  const oldPositions = new Map(
    oldNodes.map(n => [n.id, n.position])
  );

  return newNodes.map(node => ({
    ...node,
    position: oldPositions.get(node.id) || node.position,
    // React Flow의 내장 애니메이션 활용
    positionAbsolute: node.position
  }));
}
