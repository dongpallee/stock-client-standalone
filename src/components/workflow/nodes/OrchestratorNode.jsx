import React from 'react';
import BaseNode from './BaseNode';
import { GitBranch } from 'lucide-react';
import { NODE_COLORS } from '../constants/nodeStyles';
import { AGENT_CATEGORIES } from '../constants/agentTypes';

const OrchestratorNode = (props) => {
  const style = {
    borderColor: NODE_COLORS.orchestrator.border,
    backgroundColor: NODE_COLORS.orchestrator.background,
    color: NODE_COLORS.orchestrator.text
  };

  return (
    <BaseNode {...props} style={style} category={AGENT_CATEGORIES.ORCHESTRATOR}>
      <div className="flex items-center space-x-1 text-xs text-purple-700">
        <GitBranch className="w-3 h-3" />
        <span>Coordinator</span>
      </div>
    </BaseNode>
  );
};

export default OrchestratorNode;
