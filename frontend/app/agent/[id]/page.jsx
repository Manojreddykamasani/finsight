"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { 
    ArrowLeft, 
    BrainCircuit, 
    DollarSign, 
    Wallet, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    CircleDot,
    ChevronRight
} from 'lucide-react';

// --- HELPER & UTILITY FUNCTIONS ---
const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

// --- SKELETON COMPONENTS ---
const SkeletonLoader = () => (
    <div className="flex flex-col gap-6">
        <div className="animate-pulse flex items-center justify-between">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
        <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
    </div>
);


// --- UI SUB-COMPONENTS ---
const StatCard = ({ title, value, icon: Icon }) => (
    <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg flex items-start p-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-4">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700">
                <p className="label text-sm text-gray-900 dark:text-gray-100">{`${label}`}</p>
                <p className="intro text-sm text-blue-500">{`Net Worth : ${formatCurrency(payload[0].value)}`}</p>
            </div>
        );
    }
    return null;
};

// --- CORRECTED PERFORMANCE CHART ---
const PerformanceChart = ({ logs }) => {
    // FIX: 1. Filter out logs with 0 netWorthSnapshot to create an accurate chart.
    // FIX: 2. Use a more granular date format for the x-axis.
    const chartData = logs
        .filter(log => log.netWorthSnapshot > 0)
        .map(log => ({
            date: formatDate(log.createdAt), // Use detailed format for the axis
            'Net Worth': log.netWorthSnapshot,
        }))
        .reverse(); // Reverse to show chronological order (oldest to newest)

    // FIX: 3. Add a fallback UI if no valid data exists to create a chart.
    if (chartData.length < 2) {
        return (
             <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg p-4 sm:p-6 h-[22.5rem]">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Net Worth Over Time</h3>
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">Not enough valid performance data to display a chart.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Net Worth Over Time</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Performance based on decisions logged.</p>
            <div className="mt-6 h-72">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="date" 
                            stroke="gray" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            // Only show a few labels to prevent clutter
                            interval="preserveStartEnd"
                        />
                        <YAxis stroke="gray" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="Net Worth" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNetWorth)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const PortfolioTable = ({ portfolio = [] }) => (
     <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Current Portfolio</h3>
        <div className="mt-4 space-y-3">
            {portfolio.length > 0 ? portfolio.map(item => (
                <div key={item.stock._id} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{item.stock.symbol}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.stock.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-mono text-gray-900 dark:text-gray-100">{item.quantity} shares</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Avg. {formatCurrency(item.averageBuyPrice)}</p>
                    </div>
                </div>
            )) : <p className="text-center p-8 text-gray-500 dark:text-gray-400">No holdings in the portfolio.</p>}
        </div>
    </div>
);

const ActivityLog = ({ logs = [] }) => {
    const sentimentColor = {
        Optimistic: 'text-green-500',
        Cautious: 'text-yellow-500',
        Anxious: 'text-red-500',
        Greedy: 'text-orange-500',
        Neutral: 'text-gray-500',
        Skeptical: 'text-purple-500',
        Opportunistic: 'text-blue-500',
    };
    const actionIcon = {
        BUY: <ArrowUpCircle className="h-5 w-5 text-green-500" />,
        SELL: <ArrowDownCircle className="h-5 w-5 text-red-500" />,
        HOLD: <CircleDot className="h-5 w-5 text-gray-500" />,
    };

    return (
        <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Activity & Insights</h3>
            <div className="mt-4 space-y-4 max-h-[30rem] overflow-y-auto pr-2">
                {logs.length > 0 ? logs.map(log => {
                    const action = (log.actionsTaken.match(/Decision: (\w+)/) || [])[1] || 'HOLD';
                    return (
                        <div key={log._id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                {actionIcon[action.toUpperCase()] || actionIcon.HOLD}
                                <div className="w-px h-full bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(log.createdAt)}</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">"{log.insight}"</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{log.actionsTaken}</p>
                                <span className={`text-xs font-medium ${sentimentColor[log.marketSentiment] || sentimentColor.Neutral}`}>
                                    Sentiment: {log.marketSentiment}
                                </span>
                            </div>
                        </div>
                    );
                }) : <p className="text-center p-8 text-gray-500 dark:text-gray-400">No activity logs found.</p>}
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export default function AgentDetailPage({ params }) {
    const [analytics, setAnalytics] = useState(null);
    const [agentDetails, setAgentDetails] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const agentId = params.id;
        if (!agentId) return;

        const fetchAllAgentData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [analyticsRes, detailsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/analytics/agents/${agentId}/analytics`),
                    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/agents/${agentId}`)
                ]);

                if (!analyticsRes.ok) throw new Error(`Failed to fetch agent analytics (Status: ${analyticsRes.status})`);
                if (!detailsRes.ok) throw new Error(`Failed to fetch agent details (Status: ${detailsRes.status})`);

                const analyticsResult = await analyticsRes.json();
                const detailsResult = await detailsRes.json();

                if (!analyticsResult.data || !analyticsResult.data.agentDetails) {
                    throw new Error("Analytics API response is missing required data.");
                }
                 if (!detailsResult.data || !detailsResult.data.agent) {
                    throw new Error("Agent details API response is missing required data.");
                }

                setAnalytics(analyticsResult.data);
                setAgentDetails(detailsResult.data);

            } catch (e) {
                console.error("Error fetching agent data:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllAgentData();
    }, [params]);

    if (loading) return <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-950 min-h-screen"><SkeletonLoader /></main>;
    if (error) return <main className="flex-1 p-6 text-center text-red-500">Error: {error}</main>;
    if (!analytics || !agentDetails) return <main className="flex-1 p-6 text-center">Agent data could not be loaded.</main>;

    const { agentDetails: highLevelAgent, logs } = analytics;
    const { agent: detailedAgent } = agentDetails;

    return (
        <main className="flex-1 p-4 sm:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <a href="/leaderboard" className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2">
                           <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to Leaderboard
                        </a>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{highLevelAgent.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400 flex items-center">
                            <BrainCircuit className="h-4 w-4 mr-2" />
                            {highLevelAgent.persona}
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <StatCard title="Net Worth" value={formatCurrency(highLevelAgent.netWorth)} icon={DollarSign} />
                    <StatCard title="Cash Balance" value={formatCurrency(detailedAgent.balance)} icon={Wallet} />
                    <StatCard title="Logs Recorded" value={logs.length} icon={ChevronRight} />
                </div>
                
                <div className="mb-6">
                    <PerformanceChart logs={logs} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PortfolioTable portfolio={detailedAgent.portfolio} />
                    <ActivityLog logs={logs} />
                </div>
            </div>
        </main>
    );
}

