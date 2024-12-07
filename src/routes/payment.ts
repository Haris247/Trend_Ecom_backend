import express from "express";
import {
  allCoupon,
  applyDiscount,
  createCoupon,
  deleteCoupon,
  paymentIntent,
} from "../controller/payments.js";
import { adminAuth } from "../middlewares/admin.js";

const app = express.Router();

app.post("/coupon/new", adminAuth, createCoupon);

app.get("/coupon/all", adminAuth, allCoupon);

app.delete("/coupon/:id", adminAuth, deleteCoupon);

app.get("/discount", applyDiscount);

app.post("/pay", paymentIntent);

export default app;
