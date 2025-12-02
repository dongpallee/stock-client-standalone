import React from 'react';
import BaseNode from './BaseNode';
import { Database } from 'lucide-react';
import { NODE_COLORS } from '../constants/nodeStyles';
import { AGENT_CATEGORIES } from '../constants/agentTypes';

const CollectorNode = (props) => {
  const { data } = props;
  const { collected_items } = data;

  const style = {
    borderColor: NODE_COLORS.collector.border,
    backgroundColor: NODE_COLORS.collector.background,
    color: NODE_COLORS.collector.text
  };

  return (
    <BaseNode {...props} style={style} category={AGENT_CATEGORIES.COLLECTOR}>
      <div className="flex items-center space-x-1 text-xs text-blue-700">
        <Database className="w-3 h-3" />
        {collected_items && (
          <span>{collected_items} items</span>
        )}
      </div>
    </BaseNode>
  );
};

export default CollectorNode;
