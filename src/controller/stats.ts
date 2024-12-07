import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/products.js";
import { User } from "../models/user.js";
import {
  getIinventories,
  calculatePercentage,
  getChatData,
} from "../utils/features.js";
import { myNode } from "../app.js";

export const dashboardStats = TryCatch(async (req, res, next) => {
  let chart;

  let key = "admin-dashboard-stats";
  if (myNode.has(key)) {
    chart = JSON.parse(myNode.get(key) as string);
  } else {
    const today = new Date();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const thisMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 2),
      end: today,
    };

    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    };

    const thisMonthProducts = await Product.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthProducts = await Product.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthUsers = await User.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthUsers = await User.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthOrders = await Order.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthOrders = await Order.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthRevenue = thisMonthOrders.reduce(
      (total, order) => total + order.total,
      0
    );
    const lastMonthRevenue = lastMonthOrders.reduce(
      (total, order) => total + order.total,
      0
    );

    const percentage = {
      order: calculatePercentage(
        thisMonthOrders.length,
        lastMonthOrders.length
      ),
      revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
      products: calculatePercentage(
        thisMonthProducts.length,
        lastMonthProducts.length
      ),
      users: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
    };
    // Count products
    const productsCount = await Product.countDocuments();

    // Count users
    const usersCount = await User.countDocuments();

    // count orders
    const ordersCount = await Order.countDocuments();

    // all orders
    const allOrders = await Order.find();

    // calculate Order revenue
    const totalOrderRevenue = allOrders.reduce(
      (total, order) => total + order.total,
      0
    );
    const count = {
      orders: ordersCount,
      revenue: totalOrderRevenue,
      products: productsCount,
      users: usersCount,
    };
    //gender ratio
    const femaleUsers = await User.find({ gender: "female" });
    const femaleCount = femaleUsers.length;

    const genderRatio = {
      male: usersCount - femaleCount,
      female: femaleCount,
    };

    const latestTransaction = await Order.find({})
      .select(["orderItems", "discount", "total", "status"])
      .limit(4);

    const modifiedTransaction = latestTransaction.map((i) => {
      return {
        id: i._id,
        quantity: i.orderItems.length,
        discount: i.discount,
        total: i.total,
        status: i.status,
      };
    });

    //categoryCount
    const categories = await Product.distinct("category");

    const categoryCount = getIinventories({
      categories,
      products: productsCount,
    });

    //chart
    const MonthsOrdersCount = new Array(6).fill(0);
    const MonthsOrdersReveneCount = new Array(6).fill(0);

    const lastSixMonthsOrders = await Order.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    });
    lastSixMonthsOrders.forEach((order) => {
      const creationDate = order.createdAt;
      const monthdiff = today.getMonth() - creationDate.getMonth();
      if (monthdiff < 6) {
        MonthsOrdersCount[6 - monthdiff] += 1;
        MonthsOrdersReveneCount[6 - monthdiff] += order.total;
      }
    });
    chart = {
      percentage,
      count,
      categoryCount,
      genderRatio,
      latestTransaction: modifiedTransaction,
      chart: {
        order: MonthsOrdersCount,
        revenue: MonthsOrdersReveneCount,
      },
    };
    myNode.set(key, JSON.stringify(chart));
  }

  res.status(200).json({
    success: true,
    chart,
  });
});

export const pieCharts = TryCatch(async (req, res, next) => {
  let chart;
  const key = "admin-pie-chart";
  if (myNode.has(key)) {
    chart = JSON.parse(myNode.get(key) as string);
  } else {
    //order fullfillment ratio
    const processed = await Product.countDocuments({ status: "processing" });
    const shipped = await Product.countDocuments({ status: "shipped" });
    const delivered = await Product.countDocuments({ status: "delivered" });
    const orderFullfillment = {
      processed,
      shipped,
      delivered,
    };
    //product categoreis ratio
    const categories = await Product.distinct("category");
    const products = await Product.countDocuments();
    const categoryRatio = getIinventories({ categories, products });
    const categoriesRatio = {
      categoryRatio,
    };
    //Stock Availability
    const outOfStock = await Product.countDocuments({ outOfStock: 0 });
    const stockAvailability = {
      outOfStock,
      inStock: products - outOfStock,
    };
    //Revenue Distribution (grossIncome,discount,burnt,marketingCost,productionCost,netMargin)

    const allOrders = await Order.find({}).select([
      "total",
      "discount",
      "tax",
      "shippingCharges",
    ]);

    const discount = allOrders.reduce(
      (discount, order) => discount + order.discount,
      0
    );

    const grossIncome = allOrders.reduce(
      (grossIncome, order) => grossIncome + order.total,
      0
    );

    const burnt = allOrders.reduce((burnt, order) => burnt + order.tax, 0);

    const productionCost = allOrders.reduce(
      (cost, order) => cost + order.shippingCharges,
      0
    );

    const marketingCost = allOrders.reduce(
      (cost, order) => cost + (order.total * 30) / 100,
      0
    );

    const netMargin =
      grossIncome - discount - marketingCost - productionCost - burnt;

    const revenueDistribution = {
      grossIncome,
      discount,
      marketingCost,
      productionCost,
      burnt,
      netMargin,
    };

    //Users Age Group
    const allUsers = await User.find({}).select(["dob"]);

    const teen = allUsers.filter((i) => i.age <= 18);
    const adult = allUsers.filter((i) => i.age > 18 && i.age < 40);
    const old = allUsers.filter((i) => i.age > 40);

    const userAgeGroup = {
      teen,
      adult,
      old,
    };

    //admin and customers
    const adminCount = await User.countDocuments({ role: "admin" });
    const userCount = await User.countDocuments({ role: "user" });

    const adminAndUserCount = {
      adminCount,
      userCount,
    };

    chart = {
      adminAndUserCount,
      userAgeGroup,
      revenueDistribution,
      stockAvailability,
      categoriesRatio,
      orderFullfillment,
    };
    myNode.set(key, JSON.stringify(chart));
  }
  res.status(200).json({
    success: "true",
    chart,
  });
});

export const barCharts = TryCatch(async (req, res, next) => {
  let chart;
  let key = "admin-bar-chart";
  if (myNode.has(key)) {
    chart = JSON.parse(myNode.get(key) as string);
  } else {
    // Top Selling Products & Top Customers (Products and users)
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const sixMonthsProducts = await Product.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    }).select("createdAt");
    const sixMonthsUsers = await User.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    }).select("createdAt");
    //Orders throughout the year (orders)
    const twelveMonthsOrders = await Order.find({
      createdAt: {
        $gte: twelveMonthsAgo,
        $lte: today,
      },
    }).select("createdAt");
    const productsCount = getChatData({
      length: 6,
      docArr: sixMonthsProducts,
      today,
    });
    const OrderCount = getChatData({
      length: 6,
      docArr: twelveMonthsOrders,
      today,
    });
    const UsrerCount = getChatData({
      length: 6,
      docArr: sixMonthsUsers,
      today,
    });
    chart = {
      productsCount,
      OrderCount,
      UsrerCount,
    };
    myNode.set(key, JSON.stringify(chart));
  }
  res.status(200).json({
    success: "true",
    chart,
  });
});

export const lineCharts = TryCatch(async (req, res, next) => {
  let chart;
  let key = "admin-line-chart";
  if (myNode.has(key)) {
    chart = JSON.parse(myNode.get(key) as string);
  } else {
    //active users 12 months
    const today = new Date();

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const baseQuery = {
      createdAt: {
        $gte: twelveMonthsAgo,
        $lte: today,
      },
    };
    const users = await User.find(baseQuery).select("createdAt");
    const userData = getChatData({
      length: 12,
      docArr: users,
      today,
    });
    //products 12 months
    const products = await Product.find(baseQuery).select("createdAt");
    const productsData = getChatData({
      length: 12,
      docArr: products,
      today,
    });
    //revenue 12 months

    const revneue = await Order.find(baseQuery).select(["createdAt", "total"]);
    const revenueData = getChatData({
      length: 6,
      docArr: revneue,
      today,
      property: "total",
    });
    //discount alloted 12 months
    const discount = await Order.find(baseQuery).select([
      "createdAt",
      "discount",
    ]);
    const discountData = getChatData({
      length: 6,
      docArr: discount,
      today,
      property: "discount",
    });
    chart = {
      productsData,
      userData,
      discountData,
      revenueData,
    };
    myNode.set(key, JSON.stringify(chart));
  }

  res.status(200).json({
    success: "true",
    chart,
  });
});
