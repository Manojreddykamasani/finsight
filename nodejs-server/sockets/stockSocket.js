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

    // Subscribe to specific symbols
    socket.on("subscribeStocks", async (symbols) => {
  socket.subscribedSymbols = symbols.map((s) => s.toUpperCase());
  console.log(`📡 Client ${socket.id} subscribed ONLY to:`, socket.subscribedSymbols);

  // Send initial snapshot with history
  const stocks = await Stock.find({ symbol: { $in: socket.subscribedSymbols } });
  stocks.forEach((s) => {
    socket.emit("stockInit", {
      symbol: s.symbol,
      name: s.name,
      price: s.price,
      history: s.history.slice(-20), // 👈 send last 20 points
    });
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

  // 🔄 Simulate stock price changes
  const simulateStockPrices = async () => {
    try {
      const stocks = await Stock.find({});
      for (let stock of stocks) {
        const changePercent = (Math.random() * 4 - 2) / 100; // -2% to +2%
        const newPrice = +(stock.price * (1 + changePercent)).toFixed(2);

        // Create a new history point with timestamp
        const newPoint = {
          price: newPrice,
          volume: Math.floor(Math.random() * 1000),
          createdAt: new Date(), // 👈 unique time for each point
        };

        stock.price = newPrice;
        stock.history.push(newPoint);
        await stock.save();

        // Emit only the new point (not the whole history)
        io.sockets.sockets.forEach((client) => {
          if (client.subscribedSymbols?.includes(stock.symbol)) {
            client.emit("stockUpdate", {
              symbol: stock.symbol,
              price: stock.price,
              change: changePercent * 100,
              point: newPoint, // 👈 just send this new tick
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
