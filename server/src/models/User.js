import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // 🔑 Zerodha KiteConnect Integration
    kiteAccessToken: {
      type: String,
      default: null,
    },
    kitePublicToken: {
      type: String,
      default: null,
    },
    kiteUserId: {
      type: String, // Zerodha client_id
      default: null,
    },
    kiteTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
