import React from 'react';
import BaseNode from './BaseNode';
import { Brain } from 'lucide-react';
import { NODE_COLORS } from '../constants/nodeStyles';
import { AGENT_CATEGORIES } from '../constants/agentTypes';

const LLMProcessorNode = (props) => {
  const { data } = props;
  const { model } = data;

  const style = {
    borderColor: NODE_COLORS.llm_processor.border,
    backgroundColor: NODE_COLORS.llm_processor.background,
    color: NODE_COLORS.llm_processor.text
  };

  return (
    <BaseNode {...props} style={style} category={AGENT_CATEGORIES.LLM_PROCESSOR}>
      <div className="flex items-center space-x-1 text-xs text-amber-700">
        <Brain className="w-3 h-3" />
        {model && (
          <span className="truncate">{model}</span>
        )}
      </div>
    </BaseNode>
  );
};

export default LLMProcessorNode;
