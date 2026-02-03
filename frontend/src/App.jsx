import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState, addEdge } from 'reactflow';
import axios_client from './api/client';

// UI Components
import Sidebar from './components/Sidebar';
import WorkflowCanvas from './components/WorkflowArea';
import ExecutionPanel from './components/ChatPanel';
import ConfigSidebar from './components/NodeConfiguration';

// Styles
import 'reactflow/dist/style.css';

/**
 * Main Application Component
 * Manages the global state of nodes, edges, and the active side panel.
 */
const FlowMindApp = () => {
  // Navigation state for the right sidebar (Settings vs. Chat)
  const [activeTab, setActiveTab] = useState('config'); // values: 'config' | 'chat'

  // React Flow state for managing the visual graph
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: 'entry-node',
      type: 'queryNode',
      position: { x: 100, y: 100 },
      data: { label: 'User Query' }
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Workflow Persistence (Requirement #3)
  useEffect(() => {
    const handleSave = async (event) => {
      try {
        const { name } = event.detail;
        await axios_client.post(`/workflows/save?name=${encodeURIComponent(name)}`, {
          nodes,
          edges
        });
        alert(`Success: Workflow "${name}" has been saved to the database.`);
      } catch (err) {
        console.error("Save error:", err);
        alert("Database Error: Failed to save workflow states.");
      }
    };

    window.addEventListener('save-workflow', handleSave);
    return () => window.removeEventListener('save-workflow', handleSave);
  }, [nodes, edges]);

  // State for the currently clicked/focused node
  const [focusedNode, setFocusedNode] = useState(null);

  // Callback to handle manual connection of nodes on the canvas
  const handleConnect = useCallback(
    (params) => setEdges((existingEdges) => addEdge(params, existingEdges)),
    [setEdges]
  );

  // Handles clicking a node to show its specific settings
  const handleNodeSelection = useCallback((event, node) => {
    setFocusedNode(node);
    setActiveTab('config');
  }, []);

  /**
   * Updates specific data within a node (e.g., model name, provider)
   * while keeping the rest of the node properties intact.
   */
  const handleUpdateNode = useCallback((nodeId, field, newValue) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.id === nodeId) {
          const updatedData = { ...node.data, [field]: newValue };

          // If the node being modified is currently focused, update the focus state too
          if (focusedNode && focusedNode.id === nodeId) {
            setFocusedNode({ ...node, data: updatedData });
          }

          return { ...node, data: updatedData };
        }
        return node;
      })
    );
  }, [setNodes, focusedNode]);

  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen bg-gray-950 text-slate-100 font-sans overflow-hidden select-none">

        {/* Left: Component Toolbox */}
        <Sidebar />

        {/* Center: Interactive Workflow Canvas */}
        <main className="flex-1 h-full relative">
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            setNodes={setNodes}
            onNodeClick={handleNodeSelection}
          />
        </main>

        {/* Right: Dual-Mode Panel (Configuration or Execution) */}
        <aside className="w-[400px] border-l border-gray-800 bg-gray-900/50 backdrop-blur-md flex flex-col shadow-2xl">

          {/* Panel Selector Tabs */}
          <nav className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab('config')}
              className={`flex-1 py-4 text-xs uppercase tracking-widest font-bold transition-all ${activeTab === 'config' ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
            >
              Node Settings
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-4 text-xs uppercase tracking-widest font-bold transition-all ${activeTab === 'chat' ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
            >
              Run Workflow
            </button>
          </nav>

          {/* Dynamic Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'config' ? (
              <ConfigSidebar
                node={focusedNode}
                updateNodeData={handleUpdateNode}
              />
            ) : (
              <ExecutionPanel />
            )}
          </div>
        </aside>

      </div>
    </ReactFlowProvider>
  );
}

export default FlowMindApp;
