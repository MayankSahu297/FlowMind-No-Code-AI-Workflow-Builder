import React, { useState, useEffect } from 'react';

const NodeConfiguration = ({ node, updateNodeData }) => {
    if (!node) return <div className="text-gray-400 text-center mt-10">Select a node to configure</div>;

    const [files, setFiles] = useState([]);
    const [uploadStatus, setUploadStatus] = useState('');

    const handleChange = (key, value) => {
        updateNodeData(node.id, key, value);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('collection_name', node.data.collection || 'knowledge_base');

        setUploadStatus('Uploading...');
        try {
            const res = await fetch('http://localhost:8000/api/v1/upload/', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setUploadStatus(`Success: ${data.message}`);
                // Optionally update collection list or something
            } else {
                setUploadStatus(`Error: ${data.detail}`);
            }
        } catch (error) {
            setUploadStatus(`Error: ${error.message}`);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <h3 className="text-lg font-bold border-b border-gray-700 pb-2 mb-4">
                Configure {node.type}
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Label</label>
                    <input
                        type="text"
                        value={node.data.label || ''}
                        onChange={(e) => handleChange('label', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                    />
                </div>

                {node.type === 'llmNode' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Provider</label>
                            <select
                                value={node.data.provider || 'gemini'}
                                onChange={(e) => handleChange('provider', e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="gemini">Google Gemini</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Model</label>
                            <input
                                type="text"
                                value={node.data.model || 'gemini-1.5-flash'}
                                onChange={(e) => handleChange('model', e.target.value)}
                                placeholder="e.g. gemini-1.5-pro"
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </>
                )}

                {node.type === 'knowledgeNode' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Collection Name</label>
                            <input
                                type="text"
                                value={node.data.collection || 'knowledge_base'}
                                onChange={(e) => handleChange('collection', e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="pt-4 border-t border-gray-700">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Upload PDF to Knowledge Base</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                "
                            />
                            {uploadStatus && <p className="text-xs mt-2 text-gray-300">{uploadStatus}</p>}
                        </div>
                    </>
                )}

                {node.type === 'searchNode' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Search Engine</label>
                        <select
                            value={node.data.engine || 'serpapi'}
                            onChange={(e) => handleChange('engine', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="serpapi">SerpAPI</option>
                            <option value="brave">Brave Search (Coming Soon)</option>
                        </select>
                        <p className="text-[10px] text-gray-500 mt-1 italic">Note: Requires SERPAPI_KEY in .env for live results.</p>
                    </div>
                )}

                <div className="text-xs text-gray-500 mt-4">
                    ID: {node.id}
                </div>
            </div>
        </div>
    );
};

export default NodeConfiguration;
