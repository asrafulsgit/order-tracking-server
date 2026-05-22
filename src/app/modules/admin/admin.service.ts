// src/app/modules/admin/admin.service.ts
import { OrderStatus } from "@prisma/client";
import { prisma } from "../../utils/prisma";

// ─── Admin Dashboard Analytics ────────────────────────────────────────────────
export async function getAdminDashboard() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    // Totals
    totalUsers,
    totalFoods,
    totalOrders,

    // Today
    todayOrders,
    todayRevenue,

    // This Month
    monthOrders,
    monthRevenue,

    // Last Month (for growth calc)
    lastMonthOrders,
    lastMonthRevenue,

    // Status breakdown
    statusBreakdown,

    // Category revenue
    categoryRevenue,

    // Top selling foods
    topFoods,

    // Recent orders
    recentOrders,

    // Active users (placed order in last 30 days)
    // activeUsers,
  ] = await prisma.$transaction([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.food.count(),
    prisma.order.count(),

    prisma.order.count({ where: { created_at: { gte: startOfToday } } }),
    prisma.order.aggregate({
      where: { created_at: { gte: startOfToday }, status: { not: OrderStatus.CANCELLED } },
      _sum: { total: true },
    }),

    prisma.order.count({ where: { created_at: { gte: startOfMonth } } }),
    prisma.order.aggregate({
      where: { created_at: { gte: startOfMonth }, status: { not: OrderStatus.CANCELLED } },
      _sum: { total: true },
    }),

    prisma.order.count({
      where: { created_at: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.order.aggregate({
      where: {
        created_at: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: { total: true },
    }),

    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),

    prisma.order.groupBy({
      by: ["food_id"],
      where: { status: { not: OrderStatus.CANCELLED } },
      _sum: { total: true, quantity: true },
      orderBy: { _sum: { total: "desc" } },
      take: 8,
    }),

    prisma.food.findMany({
      take: 5,
      orderBy: { orders: { _count: "desc" } },
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        image_url: true,
        _count: { select: { orders: true } },
      },
    }),

    prisma.order.findMany({
      take: 10,
      orderBy: { created_at: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        food: { select: { id: true, name: true, category: true } },
      },
    }),

    prisma.user.count({
      where: {
        role: "USER",
        orders: { some: { created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      },
    }),
  ]);

  // ─── Growth rates ────────────────────────────────────────────────────────────
  const orderGrowth =
    lastMonthOrders === 0
      ? 100
      : (((monthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1);

  const lastMonthRev = Number(lastMonthRevenue._sum.total ?? 0);
  const thisMonthRev = Number(monthRevenue._sum.total ?? 0);
  const revenueGrowth =
    lastMonthRev === 0 ? 100 : (((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1);

  return {
    overview: {
      totalUsers,
      // activeUsers,
      totalFoods,
      totalOrders,
      todayOrders,
      todayRevenue: Number(todayRevenue._sum.total ?? 0),
      monthOrders,
      monthRevenue: thisMonthRev,
      orderGrowth: Number(orderGrowth),
      revenueGrowth: Number(revenueGrowth),
    },
    orderStatusBreakdown: Object.fromEntries(
      statusBreakdown.map((s) => [s.status, s._count.id])
    ),
    topFoods,
    recentOrders,
  };
}

// ─── Revenue Analytics by Date Range ─────────────────────────────────────────
export async function getRevenueAnalytics(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const orders = await prisma.order.findMany({
    where: {
      created_at: { gte: startDate },
      status: { not: OrderStatus.CANCELLED },
    },
    select: { created_at: true, total: true, status: true },
    orderBy: { created_at: "asc" },
  });

  // Group by date
  const dailyMap = new Map<string, { revenue: number; orders: number }>();

  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    dailyMap.set(key, { revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    const key = order.created_at.toISOString().split("T")[0];
    const existing = dailyMap.get(key);
    if (existing) {
      existing.revenue += Number(order.total);
      existing.orders += 1;
    }
  }

  const daily = Array.from(dailyMap.entries()).map(([date, data]) => ({ date, ...data }));
  const totalRevenue = daily.reduce((acc, d) => acc + d.revenue, 0);
  const totalOrders = daily.reduce((acc, d) => acc + d.orders, 0);

  return { daily, totalRevenue, totalOrders, period: `${days} days` };
}
