"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import StockChart from "@/components/StockChart";
import TradePanel from "@/components/TradePanel";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function StockDetailPage() {
  // useParams() can return { symbol: null } initially
  const { symbol } = useParams(); 
  const socket = useSocket();
  const { token, balance } = useAuth();

  const [stock, setStock] = useState(null);
  const [marketHistory, setMarketHistory] = useState([]);
  const [userHolding, setUserHolding] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);

  // Use useCallback to memoize this function
  const fetchUserData = useCallback(async () => {
    // 🚨 FIX 1: Ensure symbol is available before making API calls
    if (!token || !symbol) { 
      setUserHolding(null);
      setUserTransactions([]);
      return;
    };
    
    // Convert symbol to uppercase once for consistent comparison and API calls
    const stockSymbol = symbol.toUpperCase();

    try {
      // --- Fetch Portfolio ---
      const portfolioRes = await fetch(`${API_BASE_URL}/portfolio`, { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (!portfolioRes.ok) {
        const errorText = await portfolioRes.text();
        console.error("Error fetching portfolio data. Server response:", errorText);
        throw new Error(`Failed to fetch portfolio. Server responded with status: ${portfolioRes.status}`);
      }
      
      const portfolioData = await portfolioRes.json();
      if (portfolioData.status === 'success') {
        // Use stockSymbol here
        const holding = portfolioData.data.portfolio.find(h => h.stock.symbol.toUpperCase() === stockSymbol);
        setUserHolding(holding || null);
      }

      // --- Fetch Transactions ---
      // Use stockSymbol here
      const transRes = await fetch(`${API_BASE_URL}/portfolio/transactions/${stockSymbol}`, { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (!transRes.ok) {
        const errorText = await transRes.text();
        console.error("Error fetching transaction data. Server response:", errorText);
        throw new Error(`Failed to fetch transactions. Server responded with status: ${transRes.status}`);
      }
      
      const transData = await transRes.json();
      
      console.log(`[Debug] Transaction API Response for ${stockSymbol}:`, transData);

      if (transData.status === 'success') {
        setUserTransactions(transData.data);
        
        if (transData.data.length === 0) {
          console.log("[Debug] The API successfully returned 0 transactions for this user and stock.");
        }
      }
    } catch (error) {
      // This catch block will now receive a more useful error message.
      // This is where your original error was being thrown if symbol was null
      console.error("An error occurred in fetchUserData:", error.message);
    }
  }, [token, symbol]); // symbol is now correctly included

  // This effect sets up sockets and initially fetches data
  useEffect(() => {
    // 🚨 FIX 2: Prevent running when symbol is null/undefined
    if (!socket || !symbol) return; 

    const stockSymbol = symbol.toUpperCase();

    // Socket Setup
    socket.emit("subscribeStocks", [stockSymbol]);
    
    socket.on("stockInit", (data) => {
      if (data.symbol.toUpperCase() !== stockSymbol) return;
      setStock(data);
      setMarketHistory(data.history || []);
    });
    
    socket.on("stockUpdate", (data) => {
      if (data.symbol.toUpperCase() !== stockSymbol) return;
      setStock((prev) => ({ ...prev, price: data.price }));
      if (data.point) {
        setMarketHistory((prev) => [...prev, { price: data.point.price, timestamp: data.point.timestamp }]);
      }
    });
    
    // Initial data fetch
    fetchUserData();

    return () => {
      // Only unsubscribe if symbol is available for cleanup
      if (symbol) {
        socket.emit("unsubscribeStocks", [stockSymbol]);
        socket.off("stockInit");
        socket.off("stockUpdate");
      }
    };
  }, [socket, symbol, fetchUserData]);

  // This effect listens for changes in balance (after a trade) and refetches user data
  useEffect(() => {
    // 🚨 FIX 3: Prevent running when symbol is null/undefined
    if (!symbol) return; 
    
    fetchUserData();
  }, [balance, fetchUserData, symbol]); // Added symbol dependency for completeness

  // If symbol is null or stock data hasn't loaded, show loading state
  if (!symbol || !stock) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading {symbol ? symbol.toUpperCase() : 'Stock'} details...</div>;

  // --- Rendering Calculations ---
  const marketValue = userHolding ? userHolding.quantity * stock.price : 0;
  const totalCost = userHolding ? userHolding.quantity * userHolding.averageBuyPrice : 0;
  const totalProfitLoss = marketValue - totalCost;
  const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

  // --- JSX Structure ---
  return (
    <main className="p-4 md:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {stock.name} ({stock.symbol})
        </h1>
        <div className="text-right mt-2 sm:mt-0">
          <span className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
            ${stock.price?.toFixed(2) ?? "—"}
          </span>
        </div>
      </header>
      
      <div className="h-64 md:h-96 w-full">
        <StockChart data={marketHistory} />
      </div>

      {token && userHolding && (
        <section className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Your Position</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Shares Owned</p><p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{userHolding.quantity}</p></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Avg. Cost / Share</p><p className="font-semibold text-lg text-gray-900 dark:text-gray-100">${userHolding.averageBuyPrice.toFixed(2)}</p></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Market Value</p><p className="font-semibold text-lg text-gray-900 dark:text-gray-100">${marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total P/L</p>
              <p className={`font-semibold text-lg ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toFixed(2)} ({totalProfitLossPercent.toFixed(2)}%)
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            {token && (
                <section className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md">
                <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Your Transaction History</h2>
                {userTransactions.length > 0 ? (
                    <ul className="space-y-2 text-sm max-h-60 overflow-y-auto pr-2">
                    {userTransactions.map((t) => (
                        <li key={t._id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <div>
                            <span className={`font-bold text-sm ${t.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>{t.type.toUpperCase()}</span>
                            <span className="ml-3 text-gray-600 dark:text-gray-300">{t.quantity} shares @ ${t.price.toFixed(2)}</span>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(t.timestamp).toLocaleString()}</span>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">You have no trade history for this stock.</p>
                )}
                </section>
            )}
        </div>
        <div className="lg-col-span-1">
            <TradePanel stock={stock} sharesOwned={userHolding?.quantity || 0} />
        </div>
      </div>
    </main>
  );
}