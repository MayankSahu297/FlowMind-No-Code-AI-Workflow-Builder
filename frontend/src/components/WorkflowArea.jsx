import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
    addEdge,
    Controls,
    Background,
    MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';

import QueryNode from '../nodes/QueryNode';
import KnowledgeNode from '../nodes/KnowledgeNode';
import LLMNode from '../nodes/LLMNode';
import OutputNode from '../nodes/OutputNode';
import SearchNode from '../nodes/SearchNode';

const nodeTypes = {
    queryNode: QueryNode,
    knowledgeNode: KnowledgeNode,
    llmNode: LLMNode,
    outputNode: OutputNode,
    searchNode: SearchNode,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

const WorkflowArea = ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    onNodeClick
}) => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const labels = {
                queryNode: 'User Query',
                llmNode: 'Gemini Pro',
                knowledgeNode: 'Knowledge Base',
                searchNode: 'Web Search',
                outputNode: 'Output'
            };

            const newNode = {
                id: getId(),
                type,
                position,
                data: {
                    label: labels[type] || type,
                    model: 'gemini-pro',
                    provider: 'gemini',
                    collection: 'knowledge_base'
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    return (
        <div className="h-full w-full bg-gray-900" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                className="bg-gray-900"
            >
                <Controls className="bg-gray-800 border-gray-700 fill-gray-400" />
                <Background color="#374151" gap={16} />
                <MiniMap
                    nodeColor={(n) => {
                        if (n.type === 'queryNode') return '#3b82f6';
                        if (n.type === 'knowledgeNode') return '#22c55e';
                        if (n.type === 'llmNode') return '#a855f7';
                        if (n.type === 'outputNode') return '#f97316';
                        if (n.type === 'searchNode') return '#06b6d4';
                        return '#eee';
                    }}
                    className="bg-gray-800 border-gray-700"
                    maskColor="rgba(17, 24, 39, 0.8)"
                />
            </ReactFlow>
        </div>
    );
};

export default WorkflowArea;
