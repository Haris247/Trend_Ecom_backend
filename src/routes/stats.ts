import express from "express";
import {
  barCharts,
  dashboardStats,
  lineCharts,
  pieCharts,
} from "../controller/stats.js";
import { adminAuth } from "../middlewares/admin.js";

const app = express.Router();

app.get("/dashboard-stats", adminAuth, dashboardStats);

app.get("/pie-chart", adminAuth, pieCharts);

app.get("/bar-chart", adminAuth, barCharts);

app.get("/line-chart", adminAuth, lineCharts);

export default app;
