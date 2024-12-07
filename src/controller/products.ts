import { TryCatch } from "../middlewares/error.js";
import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "../utils/error-class.js";
import { Product } from "../models/products.js";
import { rm } from "fs";
import { RequestBodyProduct } from "../types/types.js";
import { myNode } from "../app.js";
import { invalidateCache } from "../utils/features.js";

// router----> /api/v1/product/create createProduct
export const newProduct = TryCatch(
  async (
    req: Request<{}, {}, RequestBodyProduct>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, price, category, stock } = req.body;
    const photo = req.file;
    if (!photo) {
      return next(new ErrorHandler("Photo is required", 400));
    }

    if (!name || !price || !category || !stock) {
      rm(photo.path, () => {
        console.log("photo deleted successfully");
      });
      return next(new ErrorHandler("All fields are required", 400));
    }
    const product = await Product.create({
      name,
      price,
      photo: photo.path,
      category: category.toLowerCase(),
      stock,
    });
    invalidateCache({ product: true, admin: true });
    res.status(200).json({
      success: "true",
      product,
    });
  }
);

// router----> /api/v1/product/admin-products getAdminProducts --admin
export const allAdminProducts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let products;
    let key = "all-products";
    if (myNode.has(key)) {
      products = JSON.parse(myNode.get(key) as string);
    } else {
      const products = await Product.find();
      if (!products) {
        return next(new ErrorHandler("Error While Fetching Data", 400));
      }
      myNode.set(key, JSON.stringify(products));
    }
    res.status(200).json({
      success: "true",
      products,
    });
  }
);

// router----> /api/v1/product/:id getSingleProduct

export const getSingleProduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    let product;
    if (myNode.has(`product-${id}`)) {
      product = JSON.parse(myNode.get(`product-${id}`) as string);
    } else {
      const product = await Product.findById(id);
      if (!product) {
        return next(new ErrorHandler("Product Not Found", 400));
      }
      myNode.set(`product-${id}`, JSON.stringify(product));
    }
    res.status(200).json({
      success: "true",
      product,
    });
  }
);

// router----> /api/v1/product/:id udpateProduct

export const updateProduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    type updateP = {
      name?: string;
      price?: number;
      stock?: number;
      category?: string;
      photo?: string;
    };
    const update: updateP = {};
    if (req.body.name) {
      update["name"] = req.body.name;
    }
    if (req.body.price) {
      update["price"] = req.body.price;
    }
    if (req.body.stock) {
      update["stock"] = req.body.stock;
    }
    if (req.body.name) {
      update["category"] = req.body.category;
    }
    const product = await Product.findById(id);
    if (!product) {
      return next(new ErrorHandler("Product Not Found", 400));
    }

    if (req.file) {
      rm(product?.photo!, () => {
        console.log("old photo deleted");
      });
      update["photo"] = req.file.path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, update, {
      new: true,
    });
    invalidateCache({
      product: true,
      admin: true,
      productId: String(id),
    });
    res.status(200).json({
      success: "true",
      message: "product updated successfully",
      updatedProduct,
    });
  }
);

// router----> /api/v1/product/:id deleteProduct

export const deleteProduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return next(new ErrorHandler("Product Not Found", 400));
    }
    await product.delete();
    invalidateCache({
      product: true,
      admin: true,
      productId: String(id),
    });
    res.status(200).json({
      success: "true",
      message: "product deleted successfully",
    });
  }
);
// router----> /api/v1/product/latest getLatestProduct

export const getLatestProduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let products;
    if (myNode.has("latest-products")) {
      products = JSON.parse(myNode.get("all-products") as string);
    } else {
      const products = await Product.find().sort({ createdAt: -1 }).limit(5);
      if (!products) {
        return next(new ErrorHandler("Problem While Fetching Data", 400));
      }
      myNode.set("all-products", JSON.stringify(products));
    }

    res.status(200).json({
      success: "true",
      products,
    });
  }
);

// router----> /api/v1/product/categories getAllCategories

export const getAllCategories = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let categories;
    if (myNode.has("categories")) {
      categories = JSON.parse(myNode.get("categories") as string);
    } else {
      const categories = await Product.distinct("category");
      if (!categories) {
        return next(new ErrorHandler("Error while fetching data", 400));
      }
      myNode.set("categories", JSON.stringify("categories"));
    }
    res.status(200).json({
      success: "true",
      categories,
    });
  }
);

// router----> /api/v1/product/all getAllProducts(with filters)

//filters ---> 1)name 2)price 3)category (+ pagination)

export const getAllProducts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.query).length == 1 && req.query.page) {
      let page = Number(req.query.page || 1);
      let limit = 3;
      let skip = (page - 1) * limit;
      const products = await Product.find().limit(limit).skip(skip);
      const countProduct = await Product.countDocuments();
      let totalPages = Math.ceil(countProduct / limit);
      if (!products) {
        return next(new ErrorHandler("Error While Fetching Data", 400));
      }
      res.status(200).json({
        success: "true",
        products,
        page,
        totalPages,
      });
    } else {
      const { name, price, category } = req.query;
      type filterTemp = {
        name?: {
          $regex: string;
          $options: string;
        };
        price?: {
          $lte: number;
        };
        category?: string;
      };
      let page = Number(req.query.page || 1);
      let limit = 3;
      let skip = (page - 1) * limit;
      let filter: filterTemp = {};
      if (name) {
        filter.name = {
          $regex: String(name),
          $options: "i",
        };
      }
      if (price) {
        filter.price = {
          $lte: Number(price),
        };
      }
      if (category) {
        filter.category = String(category);
      }
      const countProduct = await Product.find(filter).countDocuments();
      const filteredProducts = await Product.find(filter)
        .sort({ price: -1 })
        .limit(limit)
        .skip(skip);
      let totalPages = Math.ceil(countProduct / limit);
      if (!filteredProducts) {
        return next(new ErrorHandler("No Products Found", 400));
      }
      res.status(200).json({
        success: "true",
        filteredProducts,
        page,
        totalPages,
      });
    }
  }
);
