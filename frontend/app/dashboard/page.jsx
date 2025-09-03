"use client";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import StockCard from "@/components/StockCard";

export default function DashboardPage() {
  const socket = useSocket();
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // 1. Get initial stocks
    socket.emit("getStocks");

    socket.on("stocksInit", (data) => {
      setStocks(data);
    });

    // 2. Subscribe to all symbols
    socket.emit("subscribeStocks", [
      "AAPL", "MSFT", "JPM", "XOM", "JNJ", "WMT",
      "AMZN", "GOOGL", "TSLA", "NVDA", "META",
      "V", "PG", "DIS", "NFLX", "BAC",
      "KO", "PEP", "CSCO", "ORCL"
    ]);

    // 3. Listen for realtime updates
    socket.on("stockUpdate", (update) => {
      setStocks((prev) =>
        prev.map((s) =>
          s.symbol === update.symbol ? { ...s, ...update } : s
        )
      );
    });

    return () => {
      socket.off("stocksInit");
      socket.off("stockUpdate");
    };
  }, [socket]);

  return (
    <div className="flex">
      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-950">
        <h1 className="text-3xl font-bold mb-6">📊 Live Market</h1>
        {stocks.length === 0 ? (
          <p className="text-gray-500">Loading stocks...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((s) => (
              <StockCard key={s.symbol} stock={s} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
