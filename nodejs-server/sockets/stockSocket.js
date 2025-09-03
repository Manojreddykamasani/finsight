const Stock = require("../models/stockModel");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);
    socket.subscribedSymbols = [];

    // Load all stocks once (for dashboard)
    socket.on("getStocks", async () => {
      try {
        const stocks = await Stock.find({});
        socket.emit("stocksInit", stocks);
      } catch (err) {
        console.error("Error fetching stocks:", err);
      }
    });

    // Subscribe to symbols
    socket.on("subscribeStocks", async (symbols) => {
  // Reset previous subscriptions (only track new ones)
  socket.subscribedSymbols = symbols.map((s) => s.toUpperCase());
  console.log(`📡 Client ${socket.id} subscribed ONLY to:`, socket.subscribedSymbols);

  // Send initial snapshot for these
  const stocks = await Stock.find({ symbol: { $in: socket.subscribedSymbols } });
  stocks.forEach((s) => {
    socket.emit("stockUpdate", s.toObject());
  });
});

    // Unsubscribe
    socket.on("unsubscribeStocks", (symbols) => {
      socket.subscribedSymbols = socket.subscribedSymbols.filter(
        (s) => !symbols.includes(s)
      );
      console.log(`🛑 Client ${socket.id} unsubscribed →`, socket.subscribedSymbols);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  // 🔄 Price simulation every 5s
  const simulateStockPrices = async () => {
    try {
      const stocks = await Stock.find({});
      for (let stock of stocks) {
        const changePercent = (Math.random() * 4 - 2) / 100;
        const newPrice = +(stock.price * (1 + changePercent)).toFixed(2);

        stock.price = newPrice;
        stock.history.push({
          price: newPrice,
          volume: Math.floor(Math.random() * 1000),
        });
        await stock.save();

        // Emit updates only to subscribed clients
        io.sockets.sockets.forEach((client) => {
          if (client.subscribedSymbols?.includes(stock.symbol)) {
            client.emit("stockUpdate", {
              symbol: stock.symbol,
              name: stock.name,
              price: stock.price,
              volume: stock.history[stock.history.length - 1].volume,
              change: changePercent * 100,
            });
          }
        });
      }
    } catch (err) {
      console.error("Error simulating stock prices:", err);
    }
  };

  setInterval(simulateStockPrices, 5000);
};
