import mongoose from "mongoose";
import Portfolio from "./Portfolio.js";
import Capital from "./Capital.js";
import calculateChargesFromDates from "../utils/calculateCharges.js";

// --- Utility: detect intraday vs delivery ---
function getTradeCategory(entryDate, exitDate) {
  if (!exitDate) return "open"; // still running trade

  const entryDay = new Date(entryDate).toISOString().slice(0, 10);
  const exitDay = new Date(exitDate).toISOString().slice(0, 10);

  return entryDay === exitDay ? "intraday" : "delivery";
}

// --- Trade Schema ---
const tradeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    symbol: { type: String, required: true },
    stockName: { type: String },
    tradeType: { type: String, enum: ["Buy", "Sell"], required: true },

    tradeCategory: {
      type: String,
      enum: ["intraday", "delivery", "open"],
      default: "open",
    },

    status: {
      type: String,
      enum: ["Open", "Closed", "partially closed"],
      default: "open",
    },

    entryDate: { type: Date, required: true },
    exitDate: { type: Date },
    quantity: { type: Number, required: true },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number },

    commission: { type: Number, default: 0 },
    chargesBreakdown: { type: Object },

    timeframe: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily",
    },

    // Risk Management
    targetPrice: { type: Number },
    stopLoss: { type: Number },

    // Technical Data
    atr: { type: Number },
    relativeStrength: { type: Number },
    rsi: { type: Number },

    // Trade Analysis
    entryNotes: { type: String },
    postTradeReflection: { type: String },
    strategyAdherence: {
      type: Boolean,
      default: true,
    },

    tags: [{ type: String }],
  },
  { timestamps: true }
);

tradeSchema.pre("save", function (next) {
  if (this.exitDate) {
    this.tradeCategory = getTradeCategory(this.entryDate, this.exitDate);

    const { totalCharges, breakdown } = calculateChargesFromDates(
      this.tradeCategory,
      this.entryPrice,
      this.exitPrice,
      this.quantity
    );

    this.commission = totalCharges;
    this.chargesBreakdown = breakdown;
  }
  next();
});

async function updatePortfolioStats(userId) {
  const trades = await mongoose.model("Trade").find({ user: userId });

  const openTrades = trades.filter((t) => t.status === "Open");
  const closedTrades = trades.filter((t) => t.status !== "Open");

  const totalTrades = trades.length;
  const openTradesCount = openTrades.length;
  const closedTradesCount = closedTrades.length;

  const totalReturns = closedTrades.reduce((acc, t) => {
    if (!t.exitPrice) return acc;
    const pnl =
      t.tradeType === "Buy"
        ? (t.exitPrice - t.entryPrice) * t.quantity - (t.commission || 0)
        : (t.entryPrice - t.exitPrice) * t.quantity - (t.commission || 0);
    return acc + pnl;
  }, 0);

  const investedCapital = openTrades.reduce(
    (acc, t) => acc + t.entryPrice * t.quantity + (t.commission || 0),
    0
  );

  const winTrades = closedTrades.filter(
    (t) =>
      (t.tradeType === "Buy" && t.exitPrice > t.entryPrice) ||
      (t.tradeType === "Sell" && t.exitPrice < t.entryPrice)
  );
  const winRate = closedTradesCount
    ? Math.round((winTrades.length / closedTradesCount) * 100)
    : 0;

  const capitals = await Capital.find({ user: userId });

  const totalCapitalFromDeposits = capitals.reduce((acc, c) => {
    if (c.type === "add") return acc + c.amount;
    if (c.type === "withdraw") return acc - c.amount;
    return acc;
  }, 0);

  await Portfolio.findOneAndUpdate(
    { user: userId },
    {
      totalCapital: totalCapitalFromDeposits + totalReturns,
      availableCapital: investedCapital,
      totalTrades,
      openTrades: openTradesCount,
      closedTrades: closedTradesCount,
      totalReturns,
      percentageReturns: investedCapital
        ? Math.round((totalReturns / investedCapital) * 100)
        : 0,
      winRate,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );
}

tradeSchema.post("save", async function (doc) {
  await updatePortfolioStats(doc.user);
});

tradeSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) await updatePortfolioStats(doc.user);
});

const Trade = mongoose.model("Trade", tradeSchema);
export default Trade;
