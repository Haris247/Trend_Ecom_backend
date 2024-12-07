import express from "express";
import { Stripe } from "stripe";

import DBConnection from "./utils/features.js";

import userRouter from "./routes/user.js";
import productRouter from "./routes/products.js";
import OrderRouter from "./routes/order.js";
import Payment from "./routes/payment.js";
import Stats from "./routes/stats.js";

import { errorMiddleware } from "./middlewares/error.js";

export const stripe = new Stripe(
  "sk_test_51JuCLYAy8nZmIqZyJExpI6KGGiSptlWfEICRlnGhTTCfIQnSwWlyl7Bic8T8jfCUSMRQCCmtAxUnuC37FArbSMuc00MD6Fk8LD"
);

import NodeCache from "node-cache";

export const myNode = new NodeCache();

const app = express();

const port = 3000;

DBConnection();

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", OrderRouter);
app.use("/api/v1/payment", Payment);
app.use("/api/v1/stats", Stats);

app.get("/", (req, res) => {
  res.send("server is working");
});

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`server connected to port http://localhost:${port}`);
});
