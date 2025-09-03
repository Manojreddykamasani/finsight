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

  useEffect(() => {
    if (!socket || !symbol) return;

    // Reset subscription for only this stock
    socket.emit("unsubscribeStocks", []); // clear any leftover
    socket.emit("subscribeStocks", [symbol]);

    socket.on("stockUpdate", (data) => {
      if (data.symbol !== symbol) return;

      setStock((prev) => ({ ...prev, ...data }));

      setHistory((prev) => [
        ...prev.slice(-30), // keep only last 30 points
        { time: new Date().toLocaleTimeString(), price: data.price },
      ]);
    });

    return () => {
      socket.emit("unsubscribeStocks", [symbol]); // cleanup
      socket.off("stockUpdate");
    };
  }, [socket, symbol]);

  if (!stock) return <p className="p-6">Loading {symbol}...</p>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {stock.name} ({stock.symbol})
        </h1>
        <span className="text-lg font-semibold">
          ${stock.price.toFixed(2)}
        </span>
      </div>

      {/* Modern Stock Chart */}
      <StockChart data={history} />

      <TradePanel stock={stock} />
    </div>
  );
}
