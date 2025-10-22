import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getPortfolio,
  updatePortfolio,
} from "../controllers/portfolioController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getPortfolio); // fetch portfolio stats
router.put("/", updatePortfolio); // update stats manually

export default router;
