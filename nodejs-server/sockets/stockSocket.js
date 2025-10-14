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
      try {
        const stocks = await Stock.find({ symbol: { $in: socket.subscribedSymbols } });
        stocks.forEach((s) => {
          socket.emit("stockInit", {
            symbol: s.symbol,
            name: s.name,
            price: s.price,
            history: s.history.slice(-50), // Send last 50 points
          });
        });
      } catch(err) {
          console.error("Error fetching initial stock data:", err);
      }
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

  // 🔄 Restructure to use a recursive setTimeout to prevent race conditions
  const runSimulation = async () => {
    try {
      const stocks = await Stock.find({});
      for (let stock of stocks) {
        // 1. Simulate trading volume
        const tradingVolume = stock.avgVolume * (Math.random() * 0.1);

        // 2. Simulate buy/sell pressure
        const buyPressure = Math.random();
        const simulatedBuyVolume = Math.floor(tradingVolume * buyPressure);
        const simulatedSellVolume = Math.floor(tradingVolume * (1 - buyPressure));

        // 3. Calculate net demand ratio
        const netDemandRatio = stock.avgVolume > 0 ? (simulatedBuyVolume - simulatedSellVolume) / stock.avgVolume : 0;
        
        // 4. Calculate price change
        const scalingFactor = 5; 
        const changePercent = netDemandRatio * stock.volatility * scalingFactor;

        const oldPrice = stock.price;
        let newPrice = oldPrice * (1 + changePercent);
        newPrice = Math.max(0.01, +newPrice.toFixed(2));

        // 5. Create new history point and update stock data
        const newPoint = {
          price: newPrice,
          volume: simulatedBuyVolume + simulatedSellVolume,
          timestamp: new Date(),
        };

        stock.price = newPrice;
        stock.volume += newPoint.volume;
        stock.history.push(newPoint);

        if (stock.history.length > 500) {
            stock.history.shift();
        }

        await stock.save();

        // 6. Emit updates
        const priceChangeDecimal = (newPrice - oldPrice) / oldPrice;

        io.sockets.sockets.forEach((client) => {
          if (client.subscribedSymbols?.includes(stock.symbol)) {
            client.emit("stockUpdate", {
              symbol: stock.symbol,
              price: stock.price,
              change: priceChangeDecimal * 100,
              point: newPoint,
            });
          }
        });
      }
    } catch (err) {
      // Don't crash the server on an error, just log it.
      // A VersionError here is not critical and the simulation will recover on the next run.
      console.error("Error during stock price simulation:", err.message);
    } finally {
      // Schedule the next run ONLY after the current one has finished
      setTimeout(runSimulation, 3000);
    }
  };

  // Start the simulation loop
  runSimulation();
};

