// src/app/modules/order/order.service.ts
import { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { ApiError } from "../../utils/ApiError";
import { buildPaginationMeta } from "../../utils/ApiResponse";
import type {
  CreateOrderDto,
  OrderQueryDto,
  UpdateOrderStatusDto,
} from "./order.validation";
import { getIO } from "../../config/socket.config";

// ─── Order include for rich responses ─────────────────────────────────────────
const orderInclude = {
  food: {
    select: {
      id: true,
      name: true,
      image_url: true,
      category: true,
      price: true,
    },
  },
  user: {
    select: { id: true, name: true, email: true },
  },
} satisfies Prisma.OrderInclude;

// ─── Cancellable statuses ──────────────────────────────────────────────────────
const CANCELLABLE_STATUSES: OrderStatus[] = [OrderStatus.ORDERED];

// ─── Place Order ───────────────────────────────────────────────────────────────
export async function placeOrder(userId: string, dto: CreateOrderDto) {
  const food = await prisma.food.findUnique({ where: { id: dto.food_id } });
  if (!food) throw ApiError.notFound("Food item not found");
  if (!food.available)
    throw ApiError.badRequest(`"${food.name}" is currently unavailable`);

  const total = Number(food.price) * dto.quantity;

  const order = await prisma.order.create({
    data: {
      user_id: userId,
      food_id: dto.food_id,
      quantity: dto.quantity,
      total,
      address: dto.address,
      notes: dto.notes,
    },
    // include: orderInclude,
  });

  const io = getIO();

  // Notify admins only
  io.to("admins").emit("order:created", order);

  return order;
}

// ─── Get My Orders (User) ─────────────────────────────────────────────────────
export async function getMyOrders(userId: string, query: Record<string, any>) {
  // const { page, limit, status, sortBy, sortOrder, from, to } = query;
  // const skip = (page - 1) * limit;

  // const where: Prisma.OrderWhereInput = {
  //   user_id: userId,
  //   ...(status && { status }),
  //   ...((from || to) && {
  //     created_at: {
  //       ...(from && { gte: from }),
  //       ...(to && { lte: to }),
  //     },
  //   }),
  // };

  const [
    orders,
    // total
  ] = await prisma.$transaction([
    prisma.order.findMany({
      where: {
        user_id: userId,
      },
      // skip,
      // take: limit,
      // orderBy: { [sortBy]: sortOrder },
      include: orderInclude,
    }),
    // prisma.order.count({ where }),
  ]);

  return {
    orders,
    // pagination: buildPaginationMeta(total, page, limit)
  };
}

// ─── Get Order by ID ───────────────────────────────────────────────────────────
export async function getOrderById(orderId: string, userId?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  if (!order) throw ApiError.notFound("Order not found");

  // Non-admins can only see their own orders
  if (userId && order.user_id !== userId) {
    throw ApiError.forbidden("You do not have access to this order");
  }

  return order;
}

// ─── Cancel Order (User) ──────────────────────────────────────────────────────
export async function cancelOrder(orderId: string, userId: string) {
  const order = await getOrderById(orderId, userId);

  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    throw ApiError.badRequest(
      `Cannot cancel an order with status "${order.status}". Only orders in [${CANCELLABLE_STATUSES.join(", ")}] can be cancelled.`,
    );
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.CANCELLED },
    include: orderInclude,
  });
}

// ─── Get User Dashboard Metadata ──────────────────────────────────────────────
export async function getUserDashboard(userId: string) {
  const [totalOrders, statusBreakdown, recentOrders, totalSpent] =
    await prisma.$transaction([
      prisma.order.count({ where: { user_id: userId } }),

      prisma.order.groupBy({
        by: ["status"],
        where: { user_id: userId },
        _count: { id: true },
      }),

      prisma.order.findMany({
        where: { user_id: userId },
        take: 5,
        orderBy: { created_at: "desc" },
        include: {
          food: { select: { id: true, name: true, image_url: true } },
        },
      }),

      prisma.order.aggregate({
        where: { user_id: userId, status: { not: OrderStatus.CANCELLED } },
        _sum: { total: true },
      }),
    ]);

  const statusMap = Object.fromEntries(
    statusBreakdown.map((s) => [s.status, s._count.id]),
  );

  return {
    summary: {
      totalOrders,
      totalSpent: Number(totalSpent._sum.total ?? 0),
      activeOrders:
        (statusMap["ORDERED"] ?? 0) +
        (statusMap["IN_PROGRESS"] ?? 0) +
        (statusMap["DELIVERY"] ?? 0),
      completedOrders: statusMap["COMPLETED"] ?? 0,
      cancelledOrders: statusMap["CANCELLED"] ?? 0,
    },
    statusBreakdown: statusMap,
    recentOrders,
  };
}

// ─── Admin: Get All Orders ────────────────────────────────────────────────────
export async function getAllOrders(query: Record<string, any>) {
  // const { page, limit, status, search, sortBy, sortOrder, from, to } = query;
  // const skip = (page - 1) * limit;
  // console.log(query)
  // const where: Prisma.OrderWhereInput = {
  //   ...(status && { status }),
  //   ...(search && {
  //     OR: [
  //       { address: { contains: search, mode: "insensitive" } },
  //       { food: { name: { contains: search, mode: "insensitive" } } },
  //       { user: { name: { contains: search, mode: "insensitive" } } },
  //       { user: { email: { contains: search, mode: "insensitive" } } },
  //     ],
  //   }),
  //   ...((from || to) && {
  //     created_at: {
  //       ...(from && { gte: from }),
  //       ...(to && { lte: to }),
  //     },
  //   }),
  // };

  const [
    orders,
    // total
  ] = await prisma.$transaction([
    prisma.order.findMany({
      // where,
      // skip,
      // take: limit,
      // orderBy: { [sortBy]: sortOrder },
      include: orderInclude,
    }),
    // prisma.order.count({ where }),
  ]);

  return { orders };
}

// ─── Admin: Update Order Status ───────────────────────────────────────────────
export async function updateOrderStatus(
  orderId: string,
  dto: UpdateOrderStatusDto,
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw ApiError.notFound("Order not found");

  if (order.status === OrderStatus.CANCELLED) {
    throw ApiError.badRequest("Cannot update a cancelled order");
  }
  if (order.status === OrderStatus.COMPLETED) {
    throw ApiError.badRequest("Cannot update a completed order");
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: dto.status },
    include: orderInclude,
  });

  const io = getIO();

  // Notify order owner only
  io.to(order.user_id).emit("order:status-updated", updatedOrder);

  return updatedOrder
}
