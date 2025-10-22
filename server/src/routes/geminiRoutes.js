import express from "express";
import { improveTradeNotes } from "../controllers/geminiController.js";

const router = express.Router();

router.post("/improve-notes", improveTradeNotes);

export default router;
