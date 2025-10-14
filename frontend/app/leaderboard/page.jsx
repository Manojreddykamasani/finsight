"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Medal, Gem } from 'lucide-react'; // Icons for top ranks

// Helper component for a polished loading state
const LeaderboardSkeleton = () => (
    <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="w-10 h-6 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                <div className="ml-4 flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
        ))}
    </div>
);

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Fetch data from the new, agent-only leaderboard endpoint
                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/analytics/leaderboard/agents`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                setLeaderboard(result.data);
            } catch (e) {
                console.error("Failed to fetch leaderboard:", e);
                setError("Could not load agent leaderboard. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    // Function to render rank with special icons for top 3
    const renderRank = (rank) => {
        if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
        if (rank === 3) return <Gem className="w-6 h-6 text-amber-700" />;
        return <span className="font-mono text-gray-500 dark:text-gray-400">{rank}</span>;
    };

    return (
        <div className="flex">
            <main className="flex-1 p-4 sm:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
                <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">🏆 AI Agent Leaderboard</h1>

                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
                    {/* Header for the leaderboard table */}
                    <div className="hidden md:flex items-center px-4 py-3 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                        <div className="w-16 text-center">Rank</div>
                        <div className="flex-grow">Agent</div>
                        <div className="w-1/3 hidden lg:block">Persona</div>
                        <div className="w-1/4 text-right">Net Worth</div>
                    </div>

                    {/* Conditional Rendering */}
                    {loading ? (
                        <LeaderboardSkeleton />
                    ) : error ? (
                        <div className="p-8 text-center text-red-500">{error}</div>
                    ) : (
                        <div>
                            {leaderboard.map((agent, index) => (
                                <Link
                                    // Make sure your agent object from the API has an _id field
                                    href={`/agent/${agent._id || index}`}
                                    key={agent.name}
                                    className="block transition duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800/50"
                                >
                                    <div className="flex items-center px-4 py-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0">
                                        {/* Rank Column */}
                                        <div className="w-16 flex justify-center items-center">
                                            {renderRank(index + 1)}
                                        </div>

                                        {/* Agent Info Column (Main) */}
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{agent.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 lg:hidden">{agent.persona}</p>
                                        </div>
                                        
                                        {/* Persona (Hidden on smaller screens) */}
                                        <div className="w-1/3 text-sm text-gray-500 dark:text-gray-400 hidden lg:block">
                                            {agent.persona}
                                        </div>

                                        <div className="w-1/4 text-right">
                                            <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{formatCurrency(agent.netWorth)}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}