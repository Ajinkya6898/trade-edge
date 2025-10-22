import Capital from "../models/Capital.js";
import Portfolio from "../models/Portfolio.js";

// Add or withdraw capital
export const updateCapital = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, amount, note } = req.body;

    // Validate type
    if (!["add", "withdraw"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Invalid type. Must be 'add' or 'withdraw'." });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be greater than 0." });
    }

    // Fetch or create portfolio
    let portfolio = await Portfolio.findOne({ user: userId });
    if (!portfolio) {
      portfolio = await Portfolio.create({
        user: userId,
        totalCapital: 0,
        availableCapital: 0,
      });
    }

    const balanceBefore = portfolio.availableCapital; // 👈 use availableCapital for withdrawals
    let balanceAfter;

    if (type === "add") {
      portfolio.totalCapital += amount;
      portfolio.availableCapital += amount;
      balanceAfter = portfolio.availableCapital;
    } else {
      if (amount > portfolio.availableCapital) {
        return res
          .status(400)
          .json({ message: "Withdrawal amount exceeds available capital." });
      }
      portfolio.availableCapital -= amount;
      balanceAfter = portfolio.availableCapital;
    }

    await portfolio.save();

    // Save capital movement
    const capitalEntry = await Capital.create({
      user: userId,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      note,
    });

    return res.json({
      message: `Capital ${type} successful`,
      capitalEntry,
      portfolio,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Get all capital transactions
export const getCapitalTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const transactions = await Capital.find({ user: userId }).sort({
      date: -1,
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
