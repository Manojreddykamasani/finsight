"use client";

import { useEffect, useState } from "react";
import { 
    Newspaper, 
    ChevronDown, 
    ChevronRight, 
    BrainCircuit, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    CircleDot,
    Loader2,
    MessageSquareQuote
} from 'lucide-react';

// --- Single News Item Component ---
const NewsItem = ({ event }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getActionIcon = (actionsTaken) => {
        if (!actionsTaken) return <CircleDot className="h-5 w-5 text-gray-500" />;
        if (actionsTaken.includes("BUY")) return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
        if (actionsTaken.includes("SELL")) return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
        return <CircleDot className="h-5 w-5 text-gray-500" />;
    };

    return (
        <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* --- Header / Clickable Area --- */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full p-4 text-left"
            >
                <div className="flex items-center gap-4">
                    <Newspaper className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{event.headline}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(event.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {event.reactions.length} Reaction(s)
                    </span>
                    {isOpen ? <ChevronDown className="h-5 w-5 text-gray-500" /> : <ChevronRight className="h-5 w-5 text-gray-500" />}
                </div>
            </button>

            {/* --- Collapsible Content --- */}
            {isOpen && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Agent Reactions:</h4>
                    {event.reactions.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No agent reactions were logged for this event.</p>
                    ) : (
                        <div className="space-y-4">
                            {event.reactions.map(reaction => (
                                <div key={reaction._id} className="flex gap-3">
                                    <div className="mt-1">
                                        {getActionIcon(reaction.actionsTaken)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {reaction.agent?.name || 'Unknown Agent'}
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <MessageSquareQuote className="h-4 w-4 text-gray-500" />
                                            <span className="italic">"{reaction.insight}"</span>
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">{reaction.actionsTaken}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Main Page Component ---
export default function NewsReactionsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchNewsReactions = async (page) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/analytics/news/reactions?page=${page}&limit=10`);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `Failed to fetch data (Status: ${response.status})`);
            }
            const result = await response.json();
            
            // If it's page 1, replace data. Otherwise, append.
            setEvents(prev => page === 1 ? result.data : [...prev, ...result.data]);
            setPagination(result.pagination);
            
        } catch (e) {
            console.error("Error fetching news reactions:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch data for the first page on initial component mount
        fetchNewsReactions(1);
    }, []); // Empty dependency array ensures this runs only once on mount

    const handleLoadMore = () => {
        if (pagination && currentPage < pagination.totalPages) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchNewsReactions(nextPage); // Fetch the next page's data
        }
    };

    return (
        <main className="flex-1 p-4 sm:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
                    <BrainCircuit className="h-8 w-8 text-blue-600" />
                    Market News & Agent Reactions
                </h1>

                <div className="space-y-6">
                    {/* Only show "No news" message if not loading and events array is empty */}
                    {!loading && events.length === 0 && !error && (
                         <p className="text-gray-500 dark:text-gray-400 p-8 text-center">No news events found.</p>
                    )}
                    {/* Show error message if an error occurred */}
                    {error && <p className="text-red-500 text-center p-8">{error}</p>}

                    {/* Map and display events if they exist */}
                    {events.map(event => (
                        <NewsItem key={event._id} event={event} />
                    ))}
                </div>

                {/* --- Loading & Pagination --- */}
                <div className="mt-8 text-center">
                    {/* Show loading spinner ONLY when loading */}
                    {loading && (
                        <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Loading reactions...
                        </p>
                    )}
                    
                    {/* Show "Load More" button if not loading and there are more pages */}
                    {!loading && !error && pagination && currentPage < pagination.totalPages && (
                        <button
                            onClick={handleLoadMore}
                            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Load More
                        </button>
                    )}

                    {/* Show "End of feed" message if not loading, on the last page, and there are events */}
                    {!loading && !error && pagination && currentPage === pagination.totalPages && events.length > 0 && (
                         <p className="text-gray-500 dark:text-gray-400">End of news feed.</p>
                    )}
                </div>
            </div>
        </main>
    );
}