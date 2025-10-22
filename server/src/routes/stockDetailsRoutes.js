import express from "express";
import {
  getStockInfo,
  getStockQuote,
  getTechnicalIndicators,
  getHistoricalData,
  getTradeAnalysis,
} from "../controllers/stockDetailsController.js";

const router = express.Router();
router.get("/info", getStockInfo);
router.get("/quote", getStockQuote);
router.get("/technical", getTechnicalIndicators);
router.get("/historical", getHistoricalData);
router.get("/analysis", getTradeAnalysis);

export default router;
