"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import StockChart from "@/components/StockChart";
import TradePanel from "@/components/TradePanel";

export default function StockDetailPage() {
  const { symbol } = useParams();
  const socket = useSocket();
  const [stock, setStock] = useState(null);
  const [history, setHistory] = useState([]);
  const [change, setChange] = useState(0);

  useEffect(() => {
    if (!socket || !symbol) return;

    socket.emit("subscribeStocks", [symbol]);

    socket.on("stockInit", (data) => {
      if (data.symbol !== symbol) return;
      setStock(data);
      setHistory(data.history || []);
    });

    socket.on("stockUpdate", (data) => {
      if (data.symbol !== symbol) return;
      setStock((prev) => ({ ...prev, price: data.price }));
      setChange(data.change?.toFixed(2) || 0);

      if (data.point) {
        setHistory((prev) => [
          ...prev,
          { price: data.point.price, timestamp: data.point.createdAt },
        ]);
      }
    });

    return () => {
      socket.emit("unsubscribeStocks", [symbol]);
      socket.off("stockInit");
      socket.off("stockUpdate");
    };
  }, [socket, symbol]);

  if (!stock) return <p className="p-6">Loading {symbol}...</p>;

  const recentTrades = [...history].slice(-10).reverse();

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {stock.name} ({stock.symbol})
        </h1>
        <div className="text-right">
          <span className="text-xl font-semibold">
            ${stock.price?.toFixed(2) ?? "—"}
          </span>
          <span
            className={`ml-2 text-sm font-medium ${
              change >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {change >= 0 ? `+${change}%` : `${change}%`}
          </span>
        </div>
      </div>

      {/* Chart */}
      <StockChart data={history} />

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
        <div>
          <p className="text-xs text-gray-500">Market Cap</p>
          <p className="font-semibold">
            {stock.marketCap ? `$${stock.marketCap}B` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">P/E Ratio</p>
          <p className="font-semibold">{stock.peRatio ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Dividend Yield</p>
          <p className="font-semibold">
            {stock.dividendYield ? `${stock.dividendYield}%` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Avg Volume</p>
          <p className="font-semibold">
            {stock.avgVolume ? stock.avgVolume.toLocaleString() : "—"}
          </p>
        </div>
      </div>

      {/* Trade Panel */}
      <TradePanel stock={stock} />

      {/* Recent Trades */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Recent Trades</h2>
        <ul className="space-y-1 text-sm">
          {recentTrades.map((t, i) => (
            <li key={i} className="flex justify-between">
              <span>{new Date(t.timestamp).toLocaleTimeString()}</span>
              <span
                className={`font-medium ${
                  t.price >= stock.price ? "text-green-500" : "text-red-500"
                }`}
              >
                ${t.price.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Company Info */}
      {stock.description && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">About {stock.name}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {stock.description}
          </p>
        </div>
      )}
    </div>
  );
}
