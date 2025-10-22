import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    dob: { type: Date, default: null },
    address: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },

    defaultCapital: { type: Number, default: 500000 },
    riskPercent: { type: Number, default: 1 },
    positionSizing: { type: String, default: "equal" },
    commission: { type: Number, default: 0.05 },
    partialBooking: { type: Number, default: 50 },
    baseCurrency: { type: String, default: "INR" },
    twoFA: { type: Boolean, default: false },
    idleTimeoutMins: { type: Number, default: 30 },
    themeDark: { type: Boolean, default: false },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      inapp: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
