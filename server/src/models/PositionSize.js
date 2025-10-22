import mongoose from "mongoose";

const positionSizeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stockName: { type: String, required: true },
    entryPrice: { type: Number, required: true },
    atr: { type: Number, required: true },
    atrMultiplier: { type: Number, required: true },
    riskPercentage: { type: Number, required: true },

    syntheticStop: { type: Number, required: true },
    riskPerShare: { type: Number, required: true },
    riskAmount: { type: Number, required: true },
    positionSize: { type: Number, required: true },
    capitalUsed: { type: Number, required: true },

    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PositionSize = mongoose.model("PositionSize", positionSizeSchema);
export default PositionSize;
