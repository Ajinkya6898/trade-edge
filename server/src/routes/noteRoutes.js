import express from "express";
import {
  improveNote,
  summarizeNotes,
} from "../controllers/notesAIController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/improve", authMiddleware, improveNote);
router.get("/summary", authMiddleware, summarizeNotes);

export default router;
