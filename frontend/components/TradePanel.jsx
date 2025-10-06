"use client";
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

export default function TradePanel({ stock }) {
  const [tradeType, setTradeType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { balance, refreshBalance, token } = useAuth();

  const handleTrade = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please log in to trade.');
      return;
    }
    if (!quantity || quantity <= 0) {
      toast.error('Please enter a valid quantity.');
      return;
    }
    setIsLoading(true);

    const endpoint = tradeType === 'buy' ? '/portfolio/buy' : '/portfolio/sell';
    const loadingToast = toast.loading(`Processing ${tradeType}...`);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: stock.symbol,
          quantity: Number(quantity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Trade failed');
      }
      
      toast.success(data.message, { id: loadingToast });
      await refreshBalance(); // Update balance in the UI
      setQuantity('');

    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const cost = (stock.price * (Number(quantity) || 0)).toFixed(2);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Trade {stock.symbol}</h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Your Balance: <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </p>
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <button
            onClick={() => setTradeType('buy')}
            className={`px-4 py-2 font-semibold text-sm w-1/2 ${tradeType === 'buy' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
            Buy
            </button>
            <button
            onClick={() => setTradeType('sell')}
            className={`px-4 py-2 font-semibold text-sm w-1/2 ${tradeType === 'sell' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
            Sell
            </button>
        </div>
        <form onSubmit={handleTrade} className="space-y-4">
            <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Quantity
                </label>
                <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    min="1"
                    className="mt-1 block w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
                />
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{tradeType === 'buy' ? 'Estimated Cost' : 'Estimated Revenue'}:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">${cost}</span>
            </div>
            <button
            type="submit"
            disabled={isLoading || !quantity}
            className={`w-full font-semibold py-3 px-4 border border-transparent rounded-md shadow-sm text-white text-sm
                ${tradeType === 'buy' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
            {isLoading ? 'Processing...' : `Execute ${tradeType === 'buy' ? 'Buy' : 'Sell'}`}
            </button>
        </form>
    </div>
  );
}