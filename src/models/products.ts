import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: ["true", "Please Enter the name"],
    },
    price: {
      type: Number,
      required: ["true", "Please Enter the price"],
    },
    category: {
      type: String,
      required: ["true", "Please Enter the category"],
    },
    photo: {
      type: String,
      required: ["true", "Please Enter the photo"],
    },
    stock: {
      type: Number,
      required: ["true", "Please Enter the stock"],
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("product", productSchema);
