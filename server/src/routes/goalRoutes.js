import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createGoal,
  getGoalProgress,
  completeGoal,
} from "../controllers/goalController.js";

const router = express.Router();
router.use(authMiddleware);
router.post("/", authMiddleware, createGoal);
router.get("/progress", authMiddleware, getGoalProgress);
router.get("/", authMiddleware, completeGoal);

export default router;
