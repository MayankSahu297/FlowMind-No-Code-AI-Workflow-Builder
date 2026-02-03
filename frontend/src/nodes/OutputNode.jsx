import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Terminal } from 'lucide-react';

export default memo(({ data, selected }) => {
    return (
        <div className={`shadow-lg rounded-xl bg-gray-800 border-2 w-64 ${selected ? 'border-orange-500 shadow-orange-500/20' : 'border-gray-700'}`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500 border-2 border-gray-800" />
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700 bg-gray-900/50 rounded-t-xl">
                <Terminal size={16} className="text-orange-400" />
                <span className="text-sm font-bold text-gray-200">Output</span>
            </div>
            <div className="p-4">
                <p className="text-xs text-gray-400">Displays the final response to the user.</p>
            </div>
        </div>
    );
});
