import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Search } from 'lucide-react';

export default memo(({ data, selected }) => {
    return (
        <div className={`shadow-lg rounded-xl bg-gray-800 border-2 w-64 ${selected ? 'border-blue-500 shadow-blue-500/20' : 'border-gray-700'}`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-green-500 border-2 border-gray-800" />
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700 bg-gray-900/50 rounded-t-xl">
                <Search size={16} className="text-blue-400" />
                <span className="text-sm font-bold text-gray-200">Web Search</span>
            </div>
            <div className="p-4 flex flex-col gap-2">
                <div className="text-xs text-gray-400">
                    <span className="font-semibold text-gray-300">Engine:</span> {data.engine || 'SerpAPI'}
                </div>
                <div className="text-xs text-gray-400">
                    Performs online search to get real-time information.
                </div>
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500 border-2 border-gray-800" />
        </div>
    );
});
