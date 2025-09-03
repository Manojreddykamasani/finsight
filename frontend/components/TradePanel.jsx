"use client";
import { useState } from "react";

export default function TradePanel({ stock }) {
  const [amount, setAmount] = useState(0);

  const handleBuy = () => {
    alert(`Bought ${amount} shares of ${stock.symbol}`);
  };

  const handleSell = () => {
    alert(`Sold ${amount} shares of ${stock.symbol}`);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-3">Trade {stock.symbol}</h2>
      <div className="flex gap-3">
        <input
          type="number"
          className="p-2 rounded border dark:border-gray-700 dark:bg-gray-900"
          placeholder="Quantity"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleBuy} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white">
          Buy
        </button>
        <button onClick={handleSell} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white">
          Sell
        </button>
      </div>
    </div>
  );
}
