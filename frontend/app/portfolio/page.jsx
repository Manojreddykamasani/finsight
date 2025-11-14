"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function PortfolioPage() {
    const { token, balance } = useAuth();
    const socket = useSocket();
    const [portfolio, setPortfolio] = useState([]);
    const [livePrices, setLivePrices] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPortfolio = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            };

            try {
                const response = await fetch(`${API_BASE_URL}/portfolio`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch portfolio');
                }

                const data = await response.json();
                const portfolioData = data.data.portfolio || [];
                setPortfolio(portfolioData);

                if (socket && portfolioData.length > 0) {
                    // FIX: Safely extract symbols using optional chaining and filter out nulls/undefineds
                    const symbols = portfolioData
                        .map(p => p.stock?.symbol)
                        .filter(symbol => symbol); 
                    
                    if (symbols.length > 0) {
                        socket.emit('subscribeStocks', symbols);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch portfolio', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPortfolio();

        if (socket) {
            socket.on('stockUpdate', (update) => {
                setLivePrices(prev => ({ ...prev, [update.symbol]: update.price }));
            });
        }

        return () => {
            if (socket) {
                socket.off('stockUpdate');
            }
        };
    }, [token, socket]);

    // --- JSX Rendering Logic ---
    
    if (isLoading) {
        return <p className="p-6 text-center">Loading your portfolio...</p>;
    }

    if (!token) {
        return (
            <div className="p-6 text-center">
                <p>Please <Link href="/login" className="text-blue-500 hover:underline">log in</Link> to view your portfolio.</p>
            </div>
        );
    }
    
    const totalPortfolioValue = portfolio.reduce((acc, holding) => {
        // Safe access here too, though the previous error was in the useEffect hook
        const symbol = holding.stock?.symbol;
        if (!symbol) return acc;
        
        const currentPrice = livePrices[symbol] || holding.stock.price;
        return acc + (currentPrice * holding.quantity);
    }, 0);
    
    const totalAssets = balance + totalPortfolioValue;

    return (
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-950">
            <h1 className="text-3xl font-bold mb-6">💼 My Portfolio</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
                    <p className="text-sm text-gray-500">Portfolio Value</p>
                    <p className="text-2xl font-semibold">${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                 <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
                    <p className="text-sm text-gray-500">Cash Balance</p>
                    <p className="text-2xl font-semibold">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                 <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
                    <p className="text-sm text-gray-500">Total Assets</p>
                    <p className="text-2xl font-semibold">${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Price</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {portfolio.length > 0 ? portfolio.map(holding => {
                             // Defensive check before rendering
                             if (!holding.stock || !holding.stock.symbol) return null;
                             
                             const currentPrice = livePrices[holding.stock.symbol] || holding.stock.price;
                             const marketValue = currentPrice * holding.quantity;
                             const priceChange = currentPrice - holding.averageBuyPrice;
                             return (
                                 <tr key={holding.stock.symbol}>
                                     <td className="px-6 py-4 whitespace-nowrap">
                                         <Link href={`/stock/${holding.stock.symbol}`} className="hover:underline">
                                             <div className="font-bold">{holding.stock.symbol}</div>
                                             <div className="text-sm text-gray-500">{holding.stock.name}</div>
                                         </Link>
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-right">{holding.quantity}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-right">${holding.averageBuyPrice.toFixed(2)}</td>
                                     <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>${currentPrice.toFixed(2)}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-right font-bold">${marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                 </tr>
                             )
                         }) : (
                             <tr>
                                 <td colSpan="5" className="text-center py-10 text-gray-500">You have no holdings. Start trading!</td>
                             </tr>
                         )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}