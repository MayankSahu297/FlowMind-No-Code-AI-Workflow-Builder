import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare } from 'lucide-react';

export default memo(({ data, selected }) => {
    return (
        <div className={`shadow-lg rounded-xl bg-gray-800 border-2 w-64 ${selected ? 'border-blue-500 shadow-blue-500/20' : 'border-gray-700'}`}>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700 bg-gray-900/50 rounded-t-xl">
                <MessageSquare size={16} className="text-blue-400" />
                <span className="text-sm font-bold text-gray-200">User Query</span>
            </div>
            <div className="p-4">
                <p className="text-xs text-gray-400">Entry point for the chat workflow. Captures user input.</p>
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500 border-2 border-gray-800" />
        </div>
    );
});
