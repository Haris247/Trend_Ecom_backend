import express, { NextFunction, Response, Request } from "express";
import { Order } from "../models/order.js";
import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/error-class.js";
import { NewOrderRequest } from "../types/types.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import { myNode } from "../app.js";

//route =====> /api/v1/Order/new
export const createOrder = TryCatch(
  async (
    req: Request<{}, {}, NewOrderRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      shippingCharges,
      user,
      total,
      subTotal,
      orderItems,
      discount,
      tax,
      shippingInfo,
    } = req.body;
    const order = await Order.create({
      shippingCharges,
      user,
      total,
      subTotal,
      orderItems,
      discount,
      tax,
      shippingInfo,
    });
    if (!order) {
      return next(new ErrorHandler("Error while Creating Order", 400));
    }
    await reduceStock(orderItems);
    invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId: order.orderItems.map((i) => String(i.product)),
    });

    res.status(200).json({
      success: "true",
      order,
    });
  }
);

//route =====> /api/v1/Order/my
export const myOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let orders;
    const { user } = req.body;
    if (myNode.has(`myorders-${user}`)) {
      orders = JSON.parse(myNode.get(`myorders-${user}`) as string);
    } else {
      orders = await Order.find({ user: user });
      if (!orders) {
        return next(new ErrorHandler("No Orders Found", 400));
      }
      myNode.set(`myorders-${user}`, JSON.stringify(orders));
    }
    res.status(200).json({
      message: "Orders Associated with this User",
      orders,
    });
  }
);

//route =====> /api/v1/Order/all   allOrders --admin
export const allOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let orders;
    if (myNode.has("all-orders")) {
      orders = JSON.parse(myNode.get("all-orders") as string);
    } else {
      const orders = await Order.find();
      if (!orders) {
        return next(new ErrorHandler("No Orders Found", 400));
      }
      myNode.set("all-orders", JSON.stringify(orders));
    }
    res.status(200).json({
      success: "true",
      orders,
    });
  }
);

//route =====> /api/v1/Order/:id  getSingleOrder
export const getSingleOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let order;
    const { id } = req.params;
    if (myNode.has(`order-${id}`)) {
      order = JSON.parse(myNode.get(`order-${id}`) as string);
    } else {
      const order = await Order.findById(id);
      if (!order) {
        return next(new ErrorHandler("No Order Found", 400));
      }
      myNode.set(`order-${order._id}`, JSON.stringify(order));
    }

    res.status(200).json({
      message: "Orders Details",
      order,
    });
  }
);

//route =====> /api/v1/Order/:id  deleteOrder
export const deleteOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return next(new ErrorHandler("No Order Found", 400));
    }
    invalidateCache({
      order: true,
      admin: true,
      userId: order.user,
      orderId: String(id),
    });
    res.status(200).json({
      success: "true",
      message: "Order Deleted Successfully",
    });
  }
);

//route =====> /api/v1/Order/:id  processOrder
export const processOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return next(new ErrorHandler("No Order Found", 400));
    }
    switch (order.status) {
      case "processing":
        order.status = "shipped";
        break;
      case "shipped":
        order.status = "delivered";
        break;
      default:
        order.status = "processing";
    }

    await order.save();
    invalidateCache({
      product: false,
      order: true,
      admin: true,
      userId: order.user,
      orderId: String(order._id),
    });
    res.status(200).json({
      success: "true",
      message: "status updated Successfully",
    });
  }
);
