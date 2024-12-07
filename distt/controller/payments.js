import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/error-class.js";
import { Coupon } from "../models/coupen.js";
import { stripe } from "../app.js";
// route ====> /api/v1/payment/coupon/new createCoupon
export const createCoupon = TryCatch(async (req, res, next) => {
    const { coupon: code, discount: amount } = req.body;
    if (!code || !amount) {
        return next(new ErrorHandler("All fields are required", 400));
    }
    const newCoupon = await Coupon.create({
        code,
        amount,
    });
    if (!newCoupon) {
        return next(new ErrorHandler("Error while creating new Coupon", 400));
    }
    res.status(200).json({
        success: "true",
        message: `Coupon-->${newCoupon.code} created Successfully`,
    });
});
// route ====> /api/v1/payment/coupon/all allCoupons
export const allCoupon = TryCatch(async (req, res, next) => {
    const coupons = await Coupon.find();
    if (!coupons) {
        return next(new ErrorHandler("No Coupon found", 400));
    }
    res.status(200).json({
        success: "true",
        coupons,
    });
});
// route ====> /api/v1/payment/coupon/:id deleteCoupon
export const deleteCoupon = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
        return next(new ErrorHandler("No Coupon found", 400));
    }
    res.status(200).json({
        success: "true",
        message: "coupon deleted successfully",
    });
});
// route ====> /api/v1/payment/discount/:id
export const applyDiscount = TryCatch(async (req, res, next) => {
    const { coupon: code } = req.query;
    const discount = await Coupon.findOne({ code });
    if (!discount) {
        return next(new ErrorHandler("Invalid Coupon", 404));
    }
    res.status(200).json({
        success: "true",
        message: `discount:${discount.amount} applied successfully `,
    });
});
// route ====> /api/v1/payment/pay
export const paymentIntent = TryCatch(async (req, res, next) => {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(amount) * 100,
        currency: "pkr",
    });
    if (!paymentIntent) {
        return next(new ErrorHandler("Error while Payment", 400));
    }
    res.status(200).json({
        success: "true",
        clientSecret: paymentIntent.client_secret,
    });
});
