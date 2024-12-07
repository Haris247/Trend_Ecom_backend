import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: ["true", "please enter the coupon code"],
  },
  amount: {
    type: String,
    required: ["true", "Please enter the discount"],
  },
});
export const Coupon = mongoose.model("Coupen", couponSchema);
