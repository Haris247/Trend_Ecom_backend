import { NextFunction, Request, Response } from "express";

export interface RequestBody {
  _id: string;
  name: string;
  email: string;
  photo: string;
  gender: string;
  dob: Date;
}
export interface RequestBodyProduct {
  name: string;
  price: number;
  photo: string;
  category: string;
  stock: number;
}

export type funController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export type invalidateCacheProps = {
  product?: boolean;
  order?: boolean;
  admin?: boolean;
  userId?: string;
  orderId?: string;
  productId?: string | string[];
};

export type shippingInfo = {
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: number;
};

export type orderItems = {
  name: string;
  price: number;
  photo: string;
  quantity: number;
  productId: string;
};

export interface NewOrderRequest {
  shippingInfo: shippingInfo;
  user: string;
  total: number;
  subTotal: number;
  discount: number;
  tax: number;
  shippingCharges: number;
  orderItems: orderItems[];
}
