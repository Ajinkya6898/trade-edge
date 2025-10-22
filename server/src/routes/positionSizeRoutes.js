import express from "express";
import {
  calculateATRPositionSize,
  getAllPositionSizes,
  deletePositionSizes,
} from "../controllers/positionSizeController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/atr", authMiddleware, calculateATRPositionSize);
router.get("/", authMiddleware, getAllPositionSizes);
router.delete("/", authMiddleware, deletePositionSizes);

export default router;
