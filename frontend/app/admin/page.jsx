"use client";

import { useEffect, useState } from "react";
// Link from "next/link" is removed as it's specific to the Next.js router
// and was causing a compilation error. Replaced with standard <a> tags.
import { UserPlus, Trash2, BrainCircuit, Users, Eye, AlertCircle, Newspaper, CheckCircle } from 'lucide-react';

// --- MAIN PAGE COMPONENT ---
export default function AgentManagementPage() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for the agent creation form
    const [newAgentName, setNewAgentName] = useState('');
    const [newAgentPersona, setNewAgentPersona] = useState('');
    // --- MODIFIED ---
    const [newAgentModel, setNewAgentModel] = useState('gemini-2.5-pro'); // Set correct default
    // ---
    const [isSubmittingAgent, setIsSubmittingAgent] = useState(false);
    const [agentFormError, setAgentFormError] = useState('');

    // State for the news trigger form
    const [newsHeadline, setNewsHeadline] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [isTriggeringNews, setIsTriggeringNews] = useState(false);
    const [newsFormError, setNewsFormError] = useState('');
    const [newsFormSuccess, setNewsFormSuccess] = useState('');


    // --- API HELPER FUNCTIONS ---

    const fetchAgents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/agents`);
            if (!response.ok) {
                throw new Error(`Failed to fetch agents (Status: ${response.status})`);
            }
            const result = await response.json();
            setAgents(result.data || []);
        } catch (e) {
            console.error("Error fetching agents:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAgent = async (e) => {
        e.preventDefault();
        // MODIFIED: Check all three fields
        if (!newAgentName || !newAgentPersona || !newAgentModel) {
            setAgentFormError("Name, persona, and model are all required.");
            return;
        }
        setIsSubmittingAgent(true);
        setAgentFormError('');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/agents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // MODIFIED: Include the new agent model in the body
                body: JSON.stringify({ 
                    name: newAgentName, 
                    persona: newAgentPersona,
                    model: newAgentModel 
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                // Use the error message from the backend if available
                throw new Error(result.message || `Failed to create agent (Status: ${response.status})`);
            }
            setAgents(prev => [...prev, result.data]);
            setNewAgentName('');
            setNewAgentPersona('');
            // --- MODIFIED ---
            setNewAgentModel('gemini-2.5-pro'); // Reset model dropdown to correct default
            // ---
        } catch (e) {
            console.error("Error creating agent:", e);
            setAgentFormError(e.message);
        } finally {
            setIsSubmittingAgent(false);
        }
    };
    
    const handleDeleteAgent = async (agentId) => {
        if (!window.confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
            return;
        }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/agents/${agentId}`, {
                method: 'DELETE',
            });
            if (response.status !== 204) {
                 throw new Error(`Failed to delete agent (Status: ${response.status})`);
            }
            setAgents(prev => prev.filter(agent => agent._id !== agentId));
        } catch (e) {
            console.error("Error deleting agent:", e);
            alert(e.message);
        }
    };

    const handleTriggerNews = async (e) => {
        e.preventDefault();
        if (!newsHeadline || !newsContent) {
            setNewsFormError("Headline and content are required to trigger news.");
            return;
        }
        setIsTriggeringNews(true);
        setNewsFormError('');
        setNewsFormSuccess('');

        try {
            // NOTE: Using 127.0.0.1 for FastAPI server
            const response = await fetch(`${process.env.NEXT_PUBLIC_FAST_URL}/trigger/news`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    news_headline: newsHeadline,
                    news_content: newsContent,
                }),
            });

            if (!response.ok) {
                const errorResult = await response.json().catch(() => ({ detail: "An unknown error occurred" }));
                throw new Error(errorResult.detail || `Failed with status: ${response.status}`);
            }

            setNewsFormSuccess('News event triggered successfully!');
            setNewsHeadline('');
            setNewsContent('');
            setTimeout(() => setNewsFormSuccess(''), 5000); // Clear success message after 5 seconds

        } catch (e) {
            console.error("Error triggering news event:", e);
            setNewsFormError(e.message);
        } finally {
            setIsTriggeringNews(false);
        }
    };


    useEffect(() => {
        fetchAgents();
    }, []);

    // --- RENDER LOGIC ---

    return (
        <main className="flex-1 p-4 sm:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Agent Management</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- Left Column for Forms --- */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 space-y-8">
                            
                            {/* --- Create Agent Form Card --- */}
                            <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <UserPlus className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
                                    Create New Agent
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">Add a new AI trader to the simulation.</p>
                                <form onSubmit={handleCreateAgent} className="space-y-4">
                                    <div>
                                        <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agent Name</label>
                                        <input type="text" id="agentName" value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} placeholder="e.g., 'Momentum Max'" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                                    </div>
                                    <div>
                                        <label htmlFor="agentPersona" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Persona</label>
                                        <input type="text" id="agentPersona" value={newAgentPersona} onChange={(e) => setNewAgentPersona(e.target.value)} placeholder="e.g., 'Aggressive Growth Investor'" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                                    </div>

                                    {/* --- MODIFIED: Model Selection Dropdown --- */}
                                    <div>
                                        <label htmlFor="agentModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            AI Model
                                        </label>
                                        <select 
                                            id="agentModel" 
                                            value={newAgentModel} 
                                            onChange={(e) => setNewAgentModel(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <optgroup label="Cloud APIs (Google)">
                                                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                            </optgroup>
                                            <optgroup label="Local Models (Ollama)">
                                                <option value="ollama/phi3:mini">Local: Phi-3 Mini</option>
                                                <option value="ollama/tinyllama">Local: TinyLlama</option>
                                                <option value="ollama/llama3:8b">Local: Llama 3 (8B)</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                    {/* --- END: Model Selection Dropdown --- */}

                                    {agentFormError && (<p className="text-sm text-red-500 flex items-center"><AlertCircle className="h-4 w-4 mr-2" />{agentFormError}</p>)}
                                    <button type="submit" disabled={isSubmittingAgent} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        {isSubmittingAgent ? 'Creating...' : 'Create Agent'}
                                    </button>
                                </form>
                            </div>

                            {/* --- Trigger News Event Card --- */}
                            <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <Newspaper className="h-6 w-6 mr-3 text-green-600 dark:text-green-400" />
                                    Trigger News Event
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">Broadcast a news event to influence the market.</p>
                                <form onSubmit={handleTriggerNews} className="space-y-4">
                                    <div>
                                        <label htmlFor="newsHeadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">News Headline</label>
                                        <input type="text" id="newsHeadline" value={newsHeadline} onChange={(e) => setNewsHeadline(e.target.value)} placeholder="Charges increased on mobile companies" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
                                    </div>
                                    <div>
                                        <label htmlFor="newsContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">News Content</label>
                                        <textarea id="newsContent" value={newsContent} onChange={(e) => setNewsContent(e.target.value)} rows="3" placeholder="Mobile manufacturing companies may see many losses..." className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"></textarea>
                                    </div>
                                    {newsFormError && (<p className="text-sm text-red-500 flex items-center"><AlertCircle className="h-4 w-4 mr-2" />{newsFormError}</p>)}
                                    {newsFormSuccess && (<p className="text-sm text-green-600 flex items-center"><CheckCircle className="h-4 w-4 mr-2" />{newsFormSuccess}</p>)}
                                    <button type="submit" disabled={isTriggeringNews} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        {isTriggeringNews ? 'Broadcasting...' : 'Broadcast News'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* --- Agent List Card --- */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg p-6">
                             <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-4">
                                <Users className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
                                Existing Agents ({agents.length})
                            </h2>
                            <div className="space-y-3">
                                {loading && <p className="text-gray-500 dark:text-gray-400">Loading agents...</p>}
                                {error && <p className="text-red-500">{error}</p>}
                                {!loading && !error && agents.length === 0 && (
                                    <p className="text-center p-8 text-gray-500 dark:text-gray-400">No agents found. Create one to get started.</p>
                                )}
                                {!loading && !error && agents.map(agent => (
                                    <div key={agent._id} className="flex justify-between items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{agent.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                                <BrainCircuit className="h-4 w-4 mr-2" />{agent.persona}
                                            </p>
                                            {/* MODIFIED: Display the agent's model */}
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Model: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">{agent.model || 'gemini-2.5-pro'}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {/* FIX: Replaced <Link> with <a> to resolve compilation error */}
                                            <a href={`/agent/${agent._id}`} className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label="View Details">
                                                <Eye className="h-5 w-5" />
                                            </a>
                                            <button onClick={() => handleDeleteAgent(agent._id)} className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" aria-label="Delete Agent">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}