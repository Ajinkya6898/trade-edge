import Trade from "../models/Trade.js";
import Portfolio from "../models/Portfolio.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1️⃣ Fetch Portfolio first (auto-updated by middleware)
    let portfolio = await Portfolio.findOne({ user: userId });

    // If Portfolio doesn't exist (edge case), create default
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: userId, totalCapital: 0 });
    }

    // 2️⃣ Fetch all trades
    const trades = await Trade.find({ user: userId });

    const openTrades = trades.filter((t) => t.status === "open");
    const closedTrades = trades.filter((t) => t.status !== "open");

    // Open trades snapshot
    const openTradesSnapshot = openTrades.map((t) => ({
      symbol: t.stockSymbol,
      stockName: t.stockName,
      tradeType: t.tradeType,
      quantity: t.quantity,
      entryPrice: t.entryPrice,
      currentPrice: t.exitPrice || null,
      unrealizedPnL: t.exitPrice
        ? t.tradeType === "buy"
          ? (t.exitPrice - t.entryPrice) * t.quantity
          : (t.entryPrice - t.exitPrice) * t.quantity
        : 0,
    }));

    // Recent closed trades (last 5)
    const recentClosedTrades = closedTrades
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5)
      .map((t) => ({
        symbol: t.stockSymbol,
        tradeType: t.tradeType,
        exitDate: t.exitDate,
        pnl:
          t.tradeType === "buy"
            ? (t.exitPrice - t.entryPrice) * t.quantity - (t.commission || 0)
            : (t.entryPrice - t.exitPrice) * t.quantity - (t.commission || 0),
        holdingPeriodDays:
          t.exitDate && t.entryDate
            ? Math.round((t.exitDate - t.entryDate) / (1000 * 60 * 60 * 24))
            : null,
      }));

    // Performance analytics
    const closedPnLs = closedTrades.map((t) =>
      t.tradeType === "buy"
        ? (t.exitPrice - t.entryPrice) * t.quantity - (t.commission || 0)
        : (t.entryPrice - t.exitPrice) * t.quantity - (t.commission || 0)
    );
    const bestTradeIndex = closedPnLs.indexOf(Math.max(...closedPnLs));
    const worstTradeIndex = closedPnLs.indexOf(Math.min(...closedPnLs));
    const avgReturn = closedPnLs.length
      ? closedPnLs.reduce((a, b) => a + b, 0) / closedPnLs.length
      : 0;
    const avgHolding = closedTrades.length
      ? closedTrades.reduce((a, b) => {
          if (b.exitDate && b.entryDate)
            return a + (b.exitDate - b.entryDate) / (1000 * 60 * 60 * 24);
          return a;
        }, 0) / closedTrades.length
      : 0;

    // Risk metrics
    const totalExposure = openTrades.reduce(
      (acc, t) => acc + t.entryPrice * t.quantity,
      0
    );
    const avgStopLossPercent = openTrades.length
      ? openTrades.reduce((acc, t) => {
          if (t.stopLoss)
            return acc + ((t.entryPrice - t.stopLoss) / t.entryPrice) * 100;
          return acc;
        }, 0) / openTrades.length
      : 0;

    // Tags / strategies breakdown
    const tagMap = {};
    trades.forEach((t) => {
      (t.tags || []).forEach((tag) => {
        if (!tagMap[tag]) tagMap[tag] = { trades: 0, wins: 0 };
        tagMap[tag].trades += 1;
        const pnl =
          t.exitPrice !== undefined
            ? t.tradeType === "buy"
              ? (t.exitPrice - t.entryPrice) * t.quantity
              : (t.entryPrice - t.exitPrice) * t.quantity
            : 0;
        if (pnl > 0) tagMap[tag].wins += 1;
      });
    });
    const tagsBreakdown = Object.entries(tagMap).map(([tag, val]) => ({
      tag,
      trades: val.trades,
      winRate: val.trades ? Math.round((val.wins / val.trades) * 100) : 0,
    }));

    // Build dashboard object using Portfolio as source of truth for main stats
    const dashboardData = {
      overview: {
        totalCapital: portfolio.totalCapital,
        investedCapital: totalExposure,
        totalReturns: portfolio.totalReturns,
        percentReturns: portfolio.percentageReturns,
        winRate: portfolio.winRate,
        totalTrades: portfolio.totalTrades,
        openTradesCount: openTrades.length,
        closedTradesCount: closedTrades.length,
      },
      openTrades: openTradesSnapshot,
      recentClosedTrades,
      performance: {
        bestTrade: closedTrades[bestTradeIndex]
          ? {
              symbol: closedTrades[bestTradeIndex].stockSymbol,
              pnl: closedPnLs[bestTradeIndex],
            }
          : null,
        worstTrade: closedTrades[worstTradeIndex]
          ? {
              symbol: closedTrades[worstTradeIndex].stockSymbol,
              pnl: closedPnLs[worstTradeIndex],
            }
          : null,
        averageReturnPerTrade: avgReturn,
        averageHoldingPeriodDays: avgHolding,
      },
      risk: {
        currentExposure: totalExposure,
        avgStoplossRiskPercent: avgStopLossPercent,
      },
      tagsBreakdown,
    };

    res.json(dashboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
