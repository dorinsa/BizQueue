const mongoose = require("mongoose");

const ROLES = ["OWNER", "STAFF", "CUSTOMER"];

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    passwordHash: { type: String, required: true },

    role: { type: String, enum: ROLES, default: "CUSTOMER" },

    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
