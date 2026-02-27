const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => crypto.randomUUID(),
      unique: true,
      index: true,
      immutable: true,
    },

    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },

    phone_number: { type: String, required: true, trim: true },

    email_id: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },

    password: { type: String, required: true, select: false },

    profile_picture: { type: String, default: "" },

    is_email_verified: { type: Boolean, default: false },
    otp_code_hash: { type: String, default: "", select: false },
    otp_expires_at: { type: Date, default: null },
    otp_last_sent_at: { type: Date, default: null },
    otp_attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

UserSchema.methods.toSafeJSON = function () {
  return {
    id: this.id,
    first_name: this.first_name,
    last_name: this.last_name,
    phone_number: this.phone_number,
    email_id: this.email_id,
    profile_picture: this.profile_picture,
    is_email_verified: this.is_email_verified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model("User", UserSchema);
module.exports = { User };