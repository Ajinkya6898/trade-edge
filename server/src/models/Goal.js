import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    totalCapital: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    expectedReturnPercent: { type: Number, required: true },
    totalExpectedReturnAmount: { type: Number, required: true },
    monthlyExpectedReturnPercent: { type: Number },
    monthlyExpectedReturnAmount: { type: Number },
    status: {
      type: String,
      enum: ["active", "completed", "expired"],
      default: "active",
    },
    completedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);
