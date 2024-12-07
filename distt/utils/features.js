import mongoose from "mongoose";
import { Product } from "../models/products.js";
import { myNode } from "../app.js";
const connectDB = async () => {
    try {
        const connect = await mongoose.connect("mongodb://127.0.0.1:27017/ecom");
        console.log(`DB Connected:${connect.connection.host}`);
    }
    catch (error) {
        console.log(error);
    }
};
export default connectDB;
export const reduceStock = async (orderItems) => {
    for (let index = 0; index < orderItems.length; index++) {
        const order = orderItems[index];
        const productId = order.productId;
        console.log("getting product ID", productId);
        const product = await Product.findById(productId);
        if (!product) {
            return new Error("Product Not Found...");
        }
        product.stock = product.stock - order.quantity;
        await product.save();
    }
};
export const calculatePercentage = (thisMonth, lastMonth) => {
    if (lastMonth == 0) {
        const percent = thisMonth * 100;
        return Number(percent.toFixed(1));
    }
    const percent = (thisMonth / lastMonth) * 100;
    return Number(percent.toFixed(0));
};
export const getIinventories = async ({ categories, products, }) => {
    const categoriesCountPromise = categories.map((category) => {
        return Product.countDocuments({ category });
    });
    const categoriesCount = await Promise.all(categoriesCountPromise);
    const categoryCount = [];
    categories.forEach((category, i) => {
        categoryCount.push({
            [category]: Math.round((categoriesCount[i] / products) * 100),
        });
    });
    return categoryCount;
};
export const getChatData = ({ length, docArr, today, property }) => {
    const data = new Array(length).fill(0);
    docArr.forEach((i) => {
        const creationDate = i.createdAt;
        const monthdiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
        if (monthdiff < length) {
            if (property) {
                data[length - monthdiff - 1] += i[property];
            }
            else {
                data[length - monthdiff - 1] += 1;
            }
        }
    });
    return data;
};
export const invalidateCache = ({ product, order, admin, userId, orderId, productId, }) => {
    if (product) {
        let productKeys = [
            "all-products",
            "latest-products",
            "categories",
        ];
        if (typeof productId === "string") {
            productKeys.push(`product-${productId}`);
        }
        if (typeof productId === "object") {
            productId.forEach((i) => {
                productKeys.push(`product-${i}`);
            });
        }
        myNode.del(productKeys);
    }
    if (admin) {
        let data = [
            "dashboard-stats",
            "pie-chart",
            "line-chart",
            "bar-chart",
        ];
        myNode.del(data);
    }
    if (order) {
        let orderArr = [
            "all-orders",
            `order-${orderId}`,
            `myorders-${userId}`,
        ];
        myNode.del(orderArr);
    }
};
