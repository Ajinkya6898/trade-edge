import PositionSize from "../models/PositionSize.js";
import Portfolio from "../models/Portfolio.js";
import asyncHandler from "express-async-handler";

// @desc    Calculate ATR-based position size
// @route   POST /api/position-size/atr
// @access  Private
export const calculateATRPositionSize = asyncHandler(async (req, res) => {
  const { stockName, entryPrice, atr, atrMultiplier, riskPercentage } =
    req.body;

  if (!stockName || !entryPrice || !atr || !atrMultiplier || !riskPercentage) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const portfolio = await Portfolio.findOne({ user: req.user.userId });
  if (!portfolio) {
    return res
      .status(404)
      .json({ message: "Portfolio not found for this user" });
  }

  const totalCapital = portfolio.totalCapital;
  const riskAmount = (totalCapital * riskPercentage) / 100;

  const syntheticStop = entryPrice - atrMultiplier * atr;
  const riskPerShare = entryPrice - syntheticStop;
  const positionSize = Math.floor(riskAmount / riskPerShare);
  const capitalUsed = positionSize * entryPrice;

  const newPosition = new PositionSize({
    user: req.user.userId,
    stockName,
    entryPrice,
    atr,
    atrMultiplier,
    riskPercentage,
    syntheticStop,
    riskPerShare,
    riskAmount: riskAmount.toFixed(2),
    positionSize,
    capitalUsed,
  });

  await newPosition.save();

  res.status(201).json({
    stockName,
    entryPrice,
    atr,
    atrMultiplier,
    riskPercentage,
    syntheticStop,
    riskPerShare,
    riskAmount: riskAmount.toFixed(2),
    positionSize,
    capitalUsed,
  });
});

// @desc    Get all saved position sizes for a user
// @route   GET /api/position-size
// @access  Private
export const getAllPositionSizes = asyncHandler(async (req, res) => {
  const positions = await PositionSize.find({ user: req.user.userId }).sort({
    createdAt: -1,
  });
  res.status(200).json(positions);
});

//  @desc    Delete one or multiple position size entries
//  @route   DELETE /api/position-size
//  @access  Private
export const deletePositionSizes = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { ids } = req.body; // Accepts single ID or array of IDs

  if (!ids || (Array.isArray(ids) && ids.length === 0)) {
    return res.status(400).json({ message: "No IDs provided" });
  }

  // Normalize to array
  const idArray = Array.isArray(ids) ? ids : [ids];

  const result = await PositionSize.deleteMany({
    _id: { $in: idArray },
    user: userId,
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "No matching entries found" });
  }

  res.status(200).json({
    message: `Deleted ${result.deletedCount} position size entr${
      result.deletedCount > 1 ? "ies" : "y"
    } successfully.`,
  });
});
