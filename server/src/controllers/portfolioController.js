import Portfolio from "../models/Portfolio.js";
import { portfolioSchema } from "../utils/validationSchemas.js";

// Get portfolio stats
export const getPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user.userId });

    if (!portfolio) {
      // auto-create if not exists
      portfolio = await Portfolio.create({
        user: req.user.userId,
        totalCapital: 0,
      });
    }

    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update portfolio stats (manual update if needed)
export const updatePortfolio = async (req, res) => {
  try {
    const parsedData = portfolioSchema.partial().parse(req.body);

    const portfolio = await Portfolio.findOneAndUpdate(
      { user: req.user.userId },
      { ...parsedData, lastUpdated: new Date() },
      { new: true, upsert: true }
    );

    res.json({ message: "Portfolio updated successfully", portfolio });
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ message: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};
