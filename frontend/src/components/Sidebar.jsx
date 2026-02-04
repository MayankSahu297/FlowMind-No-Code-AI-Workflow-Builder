import React from 'react';
import { MessageSquare, Database, Bot, Terminal, Search } from 'lucide-react';

const Sidebar = () => {
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="w-64 border-r border-gray-700 bg-gray-800 p-4 flex flex-col gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                FlowMind
            </h1>
            <p className="text-xs text-gray-400">Drag components to the canvas</p>

            <div className="flex flex-col gap-3">
                <div
                    className="p-3 bg-gray-700 rounded-lg cursor-grab hover:bg-gray-600 transition flex items-center gap-3 border border-gray-600"
                    onDragStart={(event) => onDragStart(event, 'queryNode')}
                    draggable
                >
                    <MessageSquare size={18} className="text-blue-400" />
                    <span className="text-sm font-medium">User Query</span>
                </div>

                <div
                    className="p-3 bg-gray-700 rounded-lg cursor-grab hover:bg-gray-600 transition flex items-center gap-3 border border-gray-600"
                    onDragStart={(event) => onDragStart(event, 'knowledgeNode')}
                    draggable
                >
                    <Database size={18} className="text-green-400" />
                    <span className="text-sm font-medium">Knowledge Base</span>
                </div>

                <div
                    className="p-3 bg-gray-700 rounded-lg cursor-grab hover:bg-gray-600 transition flex items-center gap-3 border border-gray-600"
                    onDragStart={(event) => onDragStart(event, 'llmNode')}
                    draggable
                >
                    <Bot size={18} className="text-purple-400" />
                    <span className="text-sm font-medium">Gemini 1.5 Flash</span>
                </div>

                <div
                    className="p-3 bg-gray-700 rounded-lg cursor-grab hover:bg-gray-600 transition flex items-center gap-3 border border-gray-600"
                    onDragStart={(event) => onDragStart(event, 'searchNode')}
                    draggable
                >
                    <Search size={18} className="text-cyan-400" />
                    <span className="text-sm font-medium">Web Search</span>
                </div>

                <div
                    className="p-3 bg-gray-700 rounded-lg cursor-grab hover:bg-gray-600 transition flex items-center gap-3 border border-gray-600"
                    onDragStart={(event) => onDragStart(event, 'outputNode')}
                    draggable
                >
                    <Terminal size={18} className="text-orange-400" />
                    <span className="text-sm font-medium">Output</span>
                </div>
            </div>
            <div className="mt-auto pt-6 border-t border-gray-700 flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Workflow Name..."
                    className="bg-gray-900 border border-gray-700 rounded p-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    id="wf-name-input"
                />
                <button
                    onClick={async () => {
                        const name = document.getElementById('wf-name-input').value;
                        if (!name) return alert('Please enter a workflow name');
                        // Note: In a real app, we'd use a shared state or context for the graph
                        // For this assignment, we use window level access or props (simplified here)
                        window.dispatchEvent(new CustomEvent('save-workflow', { detail: { name } }));
                    }}
                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg text-xs font-bold shadow-lg transition-all active:scale-95"
                >
                    Save Workflow
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
