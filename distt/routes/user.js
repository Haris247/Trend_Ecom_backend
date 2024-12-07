import express from "express";
import { deleteUser, getAllUser, getUser, newUser, } from "../controller/user.js";
import { adminAuth } from "../middlewares/admin.js";
const app = express.Router();
app.post("/new", newUser);
app.get("/all", adminAuth, getAllUser);
app.route("/:id").delete(adminAuth, deleteUser).get(getUser);
export default app;
