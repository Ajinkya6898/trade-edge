import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import tradeRoutes from "./routes/tradeRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import capitalRoutes from "./routes/capitalRoutes.js";
import positionSizeRoutes from "./routes/positionSizeRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
import stockRoutes from "./routes/stockDetailsRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import notesRoutes from "./routes/noteRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/capital", capitalRoutes);
app.use("/api/position-size", positionSizeRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/stock-details", stockRoutes);
app.use("/api/goal", goalRoutes);
app.use("/api/note", notesRoutes);
app.use("/api/profile", profileRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes placeholder
app.get("/", (req, res) => {
  res.send("Trade Tracker Backend is running...");
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
