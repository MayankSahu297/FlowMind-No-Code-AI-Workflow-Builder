import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { useReactFlow } from 'reactflow';
import axios_client from '../api/client';

/**
 * ChatPanel Component
 * Provides an interface to interact with the visual workflow by sending messages
 * and receiving AI-generated responses based on the graph structure.
 */
const ChatPanel = () => {
    // Access the current graph state from React Flow
    const { getNodes, getEdges } = useReactFlow();

    // UI states
    const [conversation, setConversation] = useState([
        { role: 'assistant', content: 'Workflow is connected and ready. How can I help you today?' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);

    // Ref for auto-scrolling the chat to the bottom
    const chatContainerRef = useRef(null);

    // Scroll to bottom whenever the conversation updates
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [conversation]);

    const handleSendMessage = async () => {
        // Prevent sending empty messages or multiple requests
        if (!userInput.trim() || isExecuting) return;

        const newUserMessage = { role: 'user', content: userInput };

        // Update UI immediately with user message
        setConversation(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsExecuting(true);

        try {
            // Snapshot of the current visual layout
            const activeNodes = getNodes();
            const activeEdges = getEdges();

            // Client-side validation: Ensure there's an entry point for the logic
            const hasQueryNode = activeNodes.some(n => n.type === 'queryNode');
            if (!hasQueryNode) {
                throw new Error("Workflow must contain a 'User Query' node to begin execution.");
            }

            // Prepare the payload for the backend API
            const executionPayload = {
                workflow_id: null, // Placeholder for future persistence features
                graph: {
                    nodes: activeNodes,
                    edges: activeEdges
                },
                message: newUserMessage.content,
                history: conversation.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            };

            // Call our backend execution engine
            const { data } = await axios_client.post('/chat/execute', executionPayload);

            // Add the AI's response to the conversation
            setConversation(prev => [...prev, {
                role: 'assistant',
                content: data.response
            }]);

        } catch (err) {
            console.error("Execution error:", err);

            // Map error to a human-readable message
            const friendlyErrorMessage = err.response?.data?.detail || err.message || "Something went wrong while executing the workflow.";

            setConversation(prev => [...prev, {
                role: 'assistant',
                content: `Execution Notice: ${friendlyErrorMessage}`
            }]);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 shadow-inner">

            {/* Conversation History */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar"
            >
                {conversation.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-lg">
                                <Bot size={20} className="text-white" />
                            </div>
                        )}

                        <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'
                            }`}>
                            {msg.content}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0 shadow-lg">
                                <User size={20} className="text-white" />
                            </div>
                        )}
                    </div>
                ))}

                {/* Loading/Processing State Spinner */}
                {isExecuting && (
                    <div className="flex gap-4 justify-start animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center shrink-0">
                            <Bot size={20} className="text-gray-400" />
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-800 text-gray-400 border border-gray-700 rounded-tl-none flex items-center gap-3">
                            <Loader2 size={18} className="animate-spin" />
                            <span className="text-xs font-medium uppercase tracking-tight">AI is thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Overlay Area */}
            <div className="p-6 bg-gray-950/50 border-t border-gray-800 backdrop-blur-sm">
                <div className="relative group">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask about your workflow data..."
                        className="w-full bg-gray-800 border border-transparent rounded-2xl py-4 pl-6 pr-14 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-xl group-hover:bg-gray-800/80"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isExecuting || !userInput.trim()}
                        className="absolute right-3 top-2.5 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 transition-all shadow-lg active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default ChatPanel;
