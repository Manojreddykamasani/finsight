const Stock = require("../models/stockModel");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("✅ Client connected:", socket.id);
        socket.subscribedSymbols = [];

        socket.on("getStocks", async () => {
            try {
                const stocks = await Stock.find({});
                socket.emit("stocksInit", stocks);
            } catch (err) {
                console.error("Error fetching stocks:", err);
            }
        });

        socket.on("subscribeStocks", async (symbols) => {
            socket.subscribedSymbols = symbols.map((s) => s.toUpperCase());
            console.log(`📡 Client ${socket.id} subscribed ONLY to:`, socket.subscribedSymbols);

            try {
                const stocks = await Stock.find({ symbol: { $in: socket.subscribedSymbols } });
                stocks.forEach((s) => {
                    socket.emit("stockInit", {
                        symbol: s.symbol,
                        name: s.name,
                        price: s.price,
                        history: s.history.slice(-50), 
                    });
                });
            } catch(err) {
                console.error("Error fetching initial stock data:", err);
            }
        });

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

    const runSimulation = async () => {
        try {
            const stocks = await Stock.find({}).select("symbol price avgVolume volatility history");
            
            for (let stock of stocks) {
                const tradingVolume = stock.avgVolume * (Math.random() * 0.1);
                const buyPressure = Math.random();
                const simulatedBuyVolume = Math.floor(tradingVolume * buyPressure);
                const simulatedSellVolume = Math.floor(tradingVolume * (1 - buyPressure));
                const totalVolume = simulatedBuyVolume + simulatedSellVolume;

                const netDemandRatio = stock.avgVolume > 0 ? (simulatedBuyVolume - simulatedSellVolume) / stock.avgVolume : 0;
                
                const scalingFactor = 5; 
                const changePercent = netDemandRatio * stock.volatility * scalingFactor;

                const oldPrice = stock.price;
                let newPrice = oldPrice * (1 + changePercent);
                newPrice = Math.max(0.01, +newPrice.toFixed(2));

                const newPoint = {
                    price: newPrice,
                    volume: totalVolume,
                    timestamp: new Date(),
                };
                const updateResult = await Stock.findByIdAndUpdate(
                    stock._id,
                    {
                        $set: { price: newPrice },
                        $inc: { volume: totalVolume },
                        $push: {
                            history: {
                                $each: [newPoint],
                                $slice: -500
                            }
                        }
                    },
                    { new: true, runValidators: true }
                );

                if (!updateResult) {
                    console.error(`Error: Document not found for ID "${stock._id}" during update. Skipping broadcast.`);
                    continue; 
                }

                const priceChangeDecimal = (newPrice - oldPrice) / oldPrice;

                io.sockets.sockets.forEach((client) => {
                    if (client.subscribedSymbols?.includes(stock.symbol)) {
                        client.emit("stockUpdate", {
                            symbol: stock.symbol,
                            price: newPrice, 
                            change: priceChangeDecimal * 100,
                            point: newPoint,
                        });
                    }
                });
            }
        } catch (err) {
            console.error("General error during stock price simulation:", err.message);
        } finally {
            setTimeout(runSimulation, 3000);
        }
    };

    runSimulation();
};