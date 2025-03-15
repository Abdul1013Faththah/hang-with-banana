import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  provider: { type: String, default: "credentials" }, // 'google' for Google-auth users
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
