import React from 'react';
import BaseNode from './BaseNode';
import { TrendingUp } from 'lucide-react';
import { NODE_COLORS } from '../constants/nodeStyles';
import { AGENT_CATEGORIES } from '../constants/agentTypes';

const AnalyzerNode = (props) => {
  const { data } = props;
  const { score } = data;

  const style = {
    borderColor: NODE_COLORS.analyzer.border,
    backgroundColor: NODE_COLORS.analyzer.background,
    color: NODE_COLORS.analyzer.text
  };

  return (
    <BaseNode {...props} style={style} category={AGENT_CATEGORIES.ANALYZER}>
      <div className="flex items-center space-x-1 text-xs text-green-700">
        <TrendingUp className="w-3 h-3" />
        {score !== undefined && (
          <span>Score: {score}/100</span>
        )}
      </div>
    </BaseNode>
  );
};

export default AnalyzerNode;
