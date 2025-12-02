import React from 'react';
import BaseNode from './BaseNode';
import { FileText } from 'lucide-react';
import { NODE_COLORS } from '../constants/nodeStyles';
import { AGENT_CATEGORIES } from '../constants/agentTypes';

const ReporterNode = (props) => {
  const { data } = props;
  const { format } = data;

  const style = {
    borderColor: NODE_COLORS.reporter.border,
    backgroundColor: NODE_COLORS.reporter.background,
    color: NODE_COLORS.reporter.text
  };

  return (
    <BaseNode {...props} style={style} category={AGENT_CATEGORIES.REPORTER}>
      <div className="flex items-center space-x-1 text-xs text-gray-700">
        <FileText className="w-3 h-3" />
        {format && (
          <span className="uppercase">{format}</span>
        )}
      </div>
    </BaseNode>
  );
};

export default ReporterNode;
