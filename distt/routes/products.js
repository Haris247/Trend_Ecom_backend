import express from "express";
import { newProduct, allAdminProducts, getSingleProduct, updateProduct, deleteProduct, getLatestProduct, getAllCategories, getAllProducts, } from "../controller/products.js";
import { adminAuth } from "../middlewares/admin.js";
import { singlePhotoUpload } from "../middlewares/multer.js";
const app = express.Router();
app.post("/create", adminAuth, singlePhotoUpload, newProduct);
app.get("/admin-products", adminAuth, allAdminProducts);
app.get("/latest", getLatestProduct);
app.get("/categories", getAllCategories);
app.get("/all", getAllProducts);
app
    .route("/:id")
    .get(getSingleProduct)
    .post(adminAuth, singlePhotoUpload, updateProduct)
    .delete(adminAuth, deleteProduct);
export default app;
