import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Database } from 'lucide-react';

export default memo(({ data, selected }) => {
    return (
        <div className={`shadow-lg rounded-xl bg-gray-800 border-2 w-64 ${selected ? 'border-green-500 shadow-green-500/20' : 'border-gray-700'}`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-gray-800" />
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700 bg-gray-900/50 rounded-t-xl">
                <Database size={16} className="text-green-400" />
                <span className="text-sm font-bold text-gray-200">Knowledge Base</span>
            </div>
            <div className="p-4">
                <p className="text-xs text-gray-400">
                    {data.files && data.files.length > 0
                        ? `${data.files.length} document(s) loaded`
                        : 'No documents uploaded'}
                </p>
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500 border-2 border-gray-800" />
        </div>
    );
});
