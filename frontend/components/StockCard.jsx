"use client";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StockCard({ stock }) {
  const isUp = stock.change >= 0;

  return (
    <Link href={`/stock/${stock.symbol}`}>
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={stock.logoUrl} alt={stock.symbol} className="w-10 h-10 rounded-full" />
          <div>
            <h2 className="font-semibold">{stock.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{stock.symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">${stock.price.toFixed(2)}</p>
          <p className={`flex items-center gap-1 text-sm ${isUp ? "text-green-500" : "text-red-500"}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {stock.change?.toFixed(2)}%
        </p>
        </div>
      </div>
    </Link>
  );
}
