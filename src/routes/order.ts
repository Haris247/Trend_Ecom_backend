import express from "express";
import {
  allOrder,
  createOrder,
  deleteOrder,
  getSingleOrder,
  myOrder,
  processOrder,
} from "../controller/order.js";
import { adminAuth } from "../middlewares/admin.js";
const app = express.Router();

app.post("/new", createOrder);

app.post("/my", myOrder);

app.get("/all", adminAuth, allOrder);

app
  .route("/:id")
  .get(getSingleOrder)
  .post(adminAuth, processOrder)
  .delete(adminAuth, deleteOrder);

export default app;
