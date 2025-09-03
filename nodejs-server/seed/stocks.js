const mongoose = require("mongoose");
const Stock = require("../models/stockModel.js");
const dotenv = require("dotenv");
dotenv.config();

const MONGO_URI = process.env.MONGO_URL;

const seedStocks = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected...");

    const stocks = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    description:
      "Apple designs and sells consumer electronics including iPhone, iPad, and Mac, along with services like the App Store and iCloud.",
    logoUrl: "https://logo.clearbit.com/apple.com",
    price: 150,
    marketCap: 2400,
    peRatio: 28,
    dividendYield: 0.5,
    avgVolume: 90000000,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    sector: "Technology",
    description:
      "Microsoft develops software, cloud solutions, and devices, with leading products like Windows, Azure, and Office 365.",
    logoUrl: "https://logo.clearbit.com/microsoft.com",
    price: 300,
    marketCap: 2300,
    peRatio: 32,
    dividendYield: 0.8,
    avgVolume: 35000000,
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    sector: "Finance",
    description:
      "JPMorgan Chase is a global financial services firm offering investment banking, financial services, and asset management.",
    logoUrl: "https://logo.clearbit.com/jpmorganchase.com",
    price: 160,
    marketCap: 480,
    peRatio: 12,
    dividendYield: 2.5,
    avgVolume: 12000000,
  },
  {
    symbol: "XOM",
    name: "Exxon Mobil Corporation",
    sector: "Energy",
    description:
      "ExxonMobil explores and produces crude oil and natural gas, and manufactures petroleum products and chemicals.",
    logoUrl: "https://logo.clearbit.com/exxonmobil.com",
    price: 110,
    marketCap: 460,
    peRatio: 9,
    dividendYield: 3.7,
    avgVolume: 18000000,
  },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    sector: "Healthcare",
    description:
      "Johnson & Johnson develops pharmaceuticals, medical devices, and consumer health products globally.",
    logoUrl: "https://logo.clearbit.com/jnj.com",
    price: 170,
    marketCap: 420,
    peRatio: 15,
    dividendYield: 2.6,
    avgVolume: 7000000,
  },
  {
    symbol: "WMT",
    name: "Walmart Inc.",
    sector: "Consumer",
    description:
      "Walmart operates retail stores worldwide, offering a wide variety of goods and expanding into e-commerce and logistics.",
    logoUrl: "https://logo.clearbit.com/walmart.com",
    price: 140,
    marketCap: 390,
    peRatio: 22,
    dividendYield: 1.5,
    avgVolume: 8000000,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    sector: "Technology",
    description:
      "Alphabet is the parent company of Google, specializing in search, advertising, cloud computing, and artificial intelligence.",
    logoUrl: "https://logo.clearbit.com/abc.xyz",
    price: 2800,
    marketCap: 1900,
    peRatio: 30,
    dividendYield: 0,
    avgVolume: 1500000,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    sector: "Consumer",
    description:
      "Amazon is a global e-commerce leader and cloud provider through AWS, also expanding into AI, logistics, and streaming.",
    logoUrl: "https://logo.clearbit.com/amazon.com",
    price: 3500,
    marketCap: 1700,
    peRatio: 60,
    dividendYield: 0,
    avgVolume: 4000000,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    sector: "Automotive",
    description:
      "Tesla designs and manufactures electric vehicles and renewable energy solutions, pioneering EV adoption worldwide.",
    logoUrl: "https://logo.clearbit.com/tesla.com",
    price: 700,
    marketCap: 800,
    peRatio: 55,
    dividendYield: 0,
    avgVolume: 25000000,
  },
  {
    symbol: "BAC",
    name: "Bank of America",
    sector: "Finance",
    description:
      "Bank of America provides banking, investment, asset management, and financial services globally.",
    logoUrl: "https://logo.clearbit.com/bankofamerica.com",
    price: 40,
    marketCap: 340,
    peRatio: 11,
    dividendYield: 2.2,
    avgVolume: 60000000,
  },
  {
    symbol: "GS",
    name: "Goldman Sachs Group",
    sector: "Finance",
    description:
      "Goldman Sachs provides investment banking, securities, and asset management services globally.",
    logoUrl: "https://logo.clearbit.com/goldmansachs.com",
    price: 380,
    marketCap: 130,
    peRatio: 9,
    dividendYield: 2,
    avgVolume: 3000000,
  },
  {
    symbol: "CVX",
    name: "Chevron Corporation",
    sector: "Energy",
    description:
      "Chevron engages in integrated energy operations, including oil, gas, and renewable energy projects.",
    logoUrl: "https://logo.clearbit.com/chevron.com",
    price: 120,
    marketCap: 220,
    peRatio: 10,
    dividendYield: 4.2,
    avgVolume: 9000000,
  },
  {
    symbol: "PFE",
    name: "Pfizer Inc.",
    sector: "Healthcare",
    description:
      "Pfizer is a global biopharmaceutical company known for developing innovative medicines and vaccines.",
    logoUrl: "https://logo.clearbit.com/pfizer.com",
    price: 45,
    marketCap: 250,
    peRatio: 13,
    dividendYield: 3.8,
    avgVolume: 25000000,
  },
  {
    symbol: "UNH",
    name: "UnitedHealth Group",
    sector: "Healthcare",
    description:
      "UnitedHealth is a diversified healthcare company providing insurance and healthcare services.",
    logoUrl: "https://logo.clearbit.com/unitedhealthgroup.com",
    price: 500,
    marketCap: 470,
    peRatio: 21,
    dividendYield: 1.3,
    avgVolume: 4000000,
  },
  {
    symbol: "NKE",
    name: "Nike Inc.",
    sector: "Consumer",
    description:
      "Nike is a global sportswear and apparel brand, known for footwear, clothing, and sports equipment.",
    logoUrl: "https://logo.clearbit.com/nike.com",
    price: 130,
    marketCap: 200,
    peRatio: 35,
    dividendYield: 1,
    avgVolume: 7000000,
  },
  {
    symbol: "KO",
    name: "Coca-Cola Company",
    sector: "Consumer",
    description:
      "Coca-Cola is a global beverage company, producing and selling soft drinks, juices, and bottled water.",
    logoUrl: "https://logo.clearbit.com/coca-cola.com",
    price: 55,
    marketCap: 240,
    peRatio: 24,
    dividendYield: 3,
    avgVolume: 15000000,
  },
  {
    symbol: "CAT",
    name: "Caterpillar Inc.",
    sector: "Industrials",
    description:
      "Caterpillar manufactures construction and mining equipment, diesel engines, and industrial turbines.",
    logoUrl: "https://logo.clearbit.com/caterpillar.com",
    price: 210,
    marketCap: 110,
    peRatio: 18,
    dividendYield: 2,
    avgVolume: 4000000,
  },
  {
    symbol: "BA",
    name: "Boeing Company",
    sector: "Industrials",
    description:
      "Boeing designs, manufactures, and sells airplanes, rotorcraft, rockets, satellites, and telecommunications equipment.",
    logoUrl: "https://logo.clearbit.com/boeing.com",
    price: 220,
    marketCap: 120,
    peRatio: 14,
    dividendYield: 0,
    avgVolume: 8000000,
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    sector: "Technology",
    description:
      "Meta Platforms operates Facebook, Instagram, WhatsApp, and develops metaverse and VR technologies.",
    logoUrl: "https://logo.clearbit.com/meta.com",
    price: 330,
    marketCap: 950,
    peRatio: 29,
    dividendYield: 0,
    avgVolume: 25000000,
  },
  {
    symbol: "DIS",
    name: "Walt Disney Company",
    sector: "Media",
    description:
      "Disney operates theme parks, studios, and media networks, including Disney+, Marvel, and ESPN.",
    logoUrl: "https://logo.clearbit.com/disney.com",
    price: 180,
    marketCap: 320,
    peRatio: 20,
    dividendYield: 1.2,
    avgVolume: 10000000,
  },
];

    for (const stock of stocks) {
      const exists = await Stock.findOne({ symbol: stock.symbol });
      if (!exists) {
        await Stock.create(stock);
        console.log(`Seeded: ${stock.symbol}`);
      } else {
        console.log(`Skipped (already exists): ${stock.symbol}`);
      }
    }

    console.log("Stock seeding completed!");
    process.exit();
  } catch (err) {
    console.error("Error seeding stocks:", err);
    process.exit(1);
  }
};

seedStocks();
