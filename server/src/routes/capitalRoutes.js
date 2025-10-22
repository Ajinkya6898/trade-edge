import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  updateCapital,
  getCapitalTransactions,
} from "../controllers/capitalController.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/", updateCapital); // Add or withdraw capital
router.get("/", getCapitalTransactions); // List all capital movements

export default router;
