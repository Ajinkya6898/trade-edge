import Goal from "../models/Goal.js";
import Portfolio from "../models/Portfolio.js";
import Trade from "../models/Trade.js"; // or StockEntry, depending on your naming

// @desc Create a new goal
// @route POST /api/goal
// @access Private
export const createGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { totalCapital, startDate, expectedReturnPercent, timePeriod } =
      req.body;
    // `timePeriod` is number of months (frontend just passes integer)

    if (!totalCapital || !expectedReturnPercent || !timePeriod || !startDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for active goal
    const activeGoal = await Goal.findOne({ user: userId, status: "active" });
    if (activeGoal) {
      return res
        .status(400)
        .json({ message: "You already have an active goal" });
    }

    // Convert and compute
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(start.getMonth() + Number(timePeriod));

    // Total & monthly calculations
    const totalExpectedReturnAmount =
      (totalCapital * expectedReturnPercent) / 100;
    const monthlyExpectedReturnPercent = (
      expectedReturnPercent / timePeriod
    ).toFixed(2);
    const monthlyExpectedReturnAmount = (
      totalExpectedReturnAmount / timePeriod
    ).toFixed(2);

    // Create goal in DB
    const newGoal = await Goal.create({
      user: userId,
      startDate: start,
      endDate: end,
      totalCapital,
      expectedReturnPercent,
      timePeriodMonths: timePeriod, // backend calculates
      totalExpectedReturnAmount,
      monthlyExpectedReturnPercent,
      monthlyExpectedReturnAmount,
      status: "active",
    });

    res.status(201).json({
      message: "Goal created successfully",
      goal: newGoal,
    });
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Get active goal progress
// @route GET /api/goal/progress
// @access Private
export const getGoalProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    const goal = await Goal.findOne({ user: userId, status: "active" });
    if (!goal) {
      return res.json({ message: "No active goal found", goalActive: false });
    }

    // Get current portfolio (fallback if goal.totalCapital missing)
    const portfolio = await Portfolio.findOne({ user: userId });
    const totalCapital = Number(
      goal.totalCapital || portfolio?.totalCapital || 0
    );

    // Fetch closed trades only
    const closedTrades = await Trade.find({
      user: userId,
      status: { $ne: "open" },
    });

    // Defensive helper to compute pnl for one trade and also return debug info
    const computePnlForTrade = (t) => {
      const debug = {
        id: t._id,
        symbol: t.stockSymbol || t.symbol || null,
        tradeType: t.tradeType,
        raw: {
          entryPrice: t.entryPrice,
          exitPrice: t.exitPrice,
          quantity: t.quantity,
          commission: t.commission,
          entryDate: t.entryDate,
          exitDate: t.exitDate,
        },
      };

      // Ensure numeric values (coerce strings -> numbers)
      const entryPrice = Number(t.entryPrice);
      const exitPrice = Number(t.exitPrice);
      let quantity = Number(t.quantity);
      let commission = Number(t.commission || 0);

      // If quantity is NaN or 0 => mark invalid
      if (!entryPrice || !exitPrice || !quantity) {
        debug.error = "Missing or invalid entryPrice/exitPrice/quantity";
        debug.computedPnl = 0;
        return { pnl: 0, debug };
      }

      // Use absolute quantity as quantity sign conventions vary
      quantity = Math.abs(quantity);

      // Normalize tradeType string
      const tt = (t.tradeType || "").toString().toLowerCase();

      // Treat commission as absolute cost (can't be negative benefit)
      commission = Math.abs(commission || 0);

      // Compute pnl depending on type. Defensive for many naming conventions.
      let pnl = 0;
      if (tt === "buy" || tt === "long") {
        pnl = (exitPrice - entryPrice) * quantity - commission;
      } else if (tt === "sell" || tt === "short") {
        // For a short trade, profit if entryPrice > exitPrice
        pnl = (entryPrice - exitPrice) * quantity - commission;
      } else {
        // Unknown tradeType: infer from prices (fallback)
        // If exitPrice > entryPrice assume long/buy, else assume short
        if (exitPrice > entryPrice) {
          pnl = (exitPrice - entryPrice) * quantity - commission;
          debug.inferredType = "long";
        } else {
          pnl = (entryPrice - exitPrice) * quantity - commission;
          debug.inferredType = "short";
        }
      }

      // Round for readability
      pnl = Number(pnl.toFixed(2));
      debug.computedPnl = pnl;
      debug.components = { entryPrice, exitPrice, quantity, commission };

      return { pnl, debug };
    };

    // Sum PnL and collect debug per-trade
    let totalPnL = 0;
    const debugTrades = [];
    for (const t of closedTrades) {
      const { pnl, debug } = computePnlForTrade(t);
      totalPnL += pnl;
      debugTrades.push(debug);
    }
    totalPnL = Number(totalPnL.toFixed(2));

    const totalReturnPercent = totalCapital
      ? Number(((totalPnL / totalCapital) * 100).toFixed(2))
      : 0;

    // --- Monthly breakdown (use exitDate for realized PnL) ---
    const start = new Date(goal.startDate);
    const end = new Date(goal.endDate);
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth()) +
      1;

    const monthlyEarningsMap = {};
    for (const debug of debugTrades) {
      if (debug.error) continue; // skip invalid trades
      const trade = closedTrades.find(
        (t) => String(t._id) === String(debug.id)
      );
      const exitDate =
        trade && trade.exitDate ? new Date(trade.exitDate) : null;
      if (!exitDate) {
        // if no exitDate, attempt to use updatedAt as fallback
        continue;
      }
      const key = `${exitDate.getFullYear()}-${exitDate.getMonth() + 1}`;
      if (!monthlyEarningsMap[key]) monthlyEarningsMap[key] = 0;
      monthlyEarningsMap[key] += debug.computedPnl;
    }

    const now = new Date();
    const monthlyDistribution = [];
    // Ensure monthly target amount is number (could be string from toFixed)
    const targetAmount = Number(goal.monthlyExpectedReturnAmount) || 0;

    for (let i = 0; i < months; i++) {
      const monthDate = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const key = `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}`;
      const earned = Number((monthlyEarningsMap[key] || 0).toFixed(2));
      let status = "Pending";
      if (earned >= targetAmount && targetAmount !== 0) status = "Achieved";
      else if (
        monthDate.getFullYear() < now.getFullYear() ||
        (monthDate.getFullYear() === now.getFullYear() &&
          monthDate.getMonth() < now.getMonth())
      )
        status = "Not Achieved";

      // percent of monthly target (handle targetAmount===0)
      const percentOfTarget =
        targetAmount !== 0
          ? Number(((earned / targetAmount) * 100).toFixed(1))
          : 0;

      monthlyDistribution.push({
        month: monthDate.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        targetAmount: targetAmount ? Number(targetAmount).toFixed(2) : "0.00",
        earned: earned.toFixed(2),
        percentOfTarget: `${percentOfTarget}%`,
        status,
      });
    }

    const achievedAmount = totalPnL;
    const remainingAmount = Math.max(
      Number(goal.totalExpectedReturnAmount) - achievedAmount,
      0
    );

    const goalStatus =
      achievedAmount >= Number(goal.totalExpectedReturnAmount)
        ? "Achieved"
        : end < now
        ? "Expired"
        : "In Progress";

    // Return debugTrades so you can see per-trade computed values in the response
    res.json({
      goalActive: true,
      startDate: goal.startDate,
      endDate: goal.endDate,
      totalCapital,
      expectedReturnPercent: goal.expectedReturnPercent,
      totalExpectedReturnAmount: Number(goal.totalExpectedReturnAmount),
      totalReturnPercent,
      achievedAmount,
      remainingAmount,
      monthlyDistribution,
      goalStatus,
      debug: {
        totalClosedTradesCount: closedTrades.length,
        debugTrades, // array of {id, symbol, computedPnl, components, error?, inferredType?}
      },
    });
  } catch (error) {
    console.error("Error fetching goal progress:", error);
    res.status(500).json({ message: error.message });
  }
};

export const completeGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const goal = await Goal.findOneAndUpdate(
      { user: userId, status: "active" },
      { status: "completed", completedAt: new Date() },
      { new: true }
    );

    if (!goal) return res.status(404).json({ message: "No active goal found" });
    res.json({ message: "Goal marked as completed", goal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
