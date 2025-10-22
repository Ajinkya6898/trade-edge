import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createTrade,
  getTrades,
  getTradeById,
  updateTrade,
  deleteTrade,
} from "../controllers/tradeController.js";

const router = express.Router();

router.use(authMiddleware); // all routes protected

router.post("/", createTrade);
router.get("/", getTrades);
router.get("/:id", getTradeById);
router.put("/:id", updateTrade);
router.delete("/:id", deleteTrade);

export default router;
