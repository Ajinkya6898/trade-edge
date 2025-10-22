import Trade from "../models/Trade.js";
import calculateChargesFromDates from "../utils/calculateCharges.js";
import dayjs from "dayjs";

const transformTrade = (t) => {
  const tradeObj = t.toObject();

  const tradeCategory = tradeObj.tradeCategory;

  // Calculate charges & PnL
  const { totals } = calculateChargesFromDates(
    tradeCategory,
    tradeObj.entryPrice,
    tradeObj.exitPrice,
    tradeObj.quantity
  );

  // Duration (days between entry and exit)
  const duration = tradeObj.exitDate
    ? `${dayjs(tradeObj.exitDate).diff(dayjs(tradeObj.entryDate), "day")} days`
    : "Open";

  // Absolute P&L
  const absolutePL =
    (tradeObj.exitPrice - tradeObj.entryPrice) * tradeObj.quantity -
    (tradeObj.commission || 0);

  // Percent P&L (vs entry investment)
  const percentPL = (
    (absolutePL / (tradeObj.entryPrice * tradeObj.quantity)) *
    100
  ).toFixed(2);

  // Risk Reward (Target - Entry) / (Entry - StopLoss)
  let riskReward = null;
  if (tradeObj.stopLoss && tradeObj.targetPrice) {
    const risk = tradeObj.entryPrice - tradeObj.stopLoss;
    const reward = tradeObj.targetPrice - tradeObj.entryPrice;
    if (risk > 0) riskReward = (reward / risk).toFixed(2);
  }

  return {
    id: `TRD-${t._id}`, // custom ID format
    symbol: tradeObj.symbol,
    fullName: tradeObj.companyName || tradeObj.symbol, // fallback
    tradeType: tradeObj.tradeType.toUpperCase(),
    status: tradeObj.status.toUpperCase(),
    entryDate: dayjs(tradeObj.entryDate).format("YYYY-MM-DD"),
    exitDate: tradeObj.exitDate
      ? dayjs(tradeObj.exitDate).format("YYYY-MM-DD")
      : null,
    entryPrice: tradeObj.entryPrice,
    exitPrice: tradeObj.exitPrice,
    quantity: tradeObj.quantity,
    targetPrice: tradeObj.targetPrice,
    stopLoss: tradeObj.stopLoss,
    commission: tradeObj.commission,
    absolutePL,
    percentPL: parseFloat(percentPL),
    riskReward,
    duration,
    atr: tradeObj.atr,
    volatility: tradeObj.volatility || null,
    relativeStrength: tradeObj.relativeStrength
      ? `${tradeObj.relativeStrength * 100}% vs Nifty`
      : null,
    notes: tradeObj.notes || "",
    reflection: tradeObj.reflection || "",
    strategyAdherence: tradeObj.strategyAdherence
      ? "Excellent - followed all entry and exit rules"
      : "Needs Improvement",
    tags: tradeObj.tags || [],
    attachments: tradeObj.attachments || [],
    chargesBreakdown: tradeObj.chargesBreakdown || {},
  };
};

// Create a trade
export const createTrade = async (req, res) => {
  try {
    const newTrade = await Trade.create({
      ...req.body,
      user: req.user.userId,
    });

    res
      .status(201)
      .json({ message: "Trade created successfully", trade: newTrade });
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ message: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get all trades of a user
export const getTrades = async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });

    // Map over trades to include P&L
    const tradesWithPnL = trades.map((t) => {
      // Determine tradeCategory dynamically if you want
      const tradeCategory = t.tradeCategory; // or use your getTradeCategory(t) function

      // Use utility to calculate charges & P&L
      const { totals } = calculateChargesFromDates(
        tradeCategory,
        t.entryPrice,
        t.exitPrice,
        t.quantity
      );

      return {
        ...t.toObject(), // convert mongoose doc to plain object
        grossPnL: totals.grossPnL,
        netPnL: totals.netPnL,
      };
    });

    res.json(tradesWithPnL);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get single trade
export const getTradeById = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!trade) return res.status(404).json({ message: "Trade not found" });
    res.json(transformTrade(trade));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update trade
export const updateTrade = async (req, res) => {
  try {
    const parsedData = tradeSchema.partial().parse(req.body);

    const updatedTrade = await Trade.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );

    if (!updatedTrade)
      return res.status(404).json({ message: "Trade not found" });
    res.json(updatedTrade);
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ message: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete trade
export const deleteTrade = async (req, res) => {
  try {
    const deleted = await Trade.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!deleted) return res.status(404).json({ message: "Trade not found" });
    res.json({ message: "Trade deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
