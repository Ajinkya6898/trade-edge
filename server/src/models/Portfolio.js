import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalCapital: { type: Number, default: 0 },
    availableCapital: { type: Number, default: 0 },
    totalTrades: { type: Number, default: 0 },
    openTrades: { type: Number, default: 0 },
    closedTrades: { type: Number, default: 0 },
    totalReturns: { type: Number, default: 0 },
    percentageReturns: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    avgProfit: { type: Number, default: 0 },
    avgLoss: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Portfolio = mongoose.model("Portfolio", portfolioSchema);
export default Portfolio;
