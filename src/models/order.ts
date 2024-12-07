import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      address: {
        type: String,
        required: ["true", "please Enter the Address"],
      },
      city: {
        type: String,
        required: ["true", "please Enter the City"],
      },
      state: {
        type: String,
        required: ["true", "please Enter the state"],
      },
      country: {
        type: String,
        required: ["true", "please Enter the country"],
      },
      pinCode: {
        type: Number,
        required: ["true", "please Enter the pinCode"],
      },
    },
    user: {
      type: String,
      ref: "User",
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    shippingCharges: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["processing", "shipped", "delivered"],
      default: "processing",
    },
    orderItems: [
      {
        name: String,
        photo: String,
        price: Number,
        quantity: Number,
        product: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderSchema);
