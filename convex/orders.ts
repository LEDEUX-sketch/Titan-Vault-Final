import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const place = mutation({
    args: {
        userId: v.id("users"),
        shippingAddress: v.object({
            fullName: v.string(),
            phone: v.string(),
            address: v.string(),
            city: v.string(),
            province: v.string(),
            zipCode: v.string(),
        }),
    },
    handler: async (ctx, args) => {
        // Get all cart items
        const cartItems = await ctx.db
            .query("cartItems")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        if (cartItems.length === 0) {
            throw new Error("Cart is empty.");
        }

        // Build order items and calculate total (don't deduct stock yet — wait for approval)
        let totalAmount = 0;
        const orderItems = [];

        for (const cartItem of cartItems) {
            const product = await ctx.db.get(cartItem.productId);
            if (!product) continue;
            if (product.stock < cartItem.quantity) {
                throw new Error(`Not enough stock for ${product.name}.`);
            }

            orderItems.push({
                productId: cartItem.productId,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.images[0] || "",
            });

            totalAmount += product.price * cartItem.quantity;
        }

        // Create the order with awaiting_approval status
        const orderId = await ctx.db.insert("orders", {
            userId: args.userId,
            items: orderItems,
            totalAmount,
            status: "awaiting_approval",
            shippingAddress: args.shippingAddress,
            createdAt: Date.now(),
        });

        // Clear the cart
        for (const cartItem of cartItems) {
            await ctx.db.delete(cartItem._id);
        }

        return orderId;
    },
});

export const getByUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("orders")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(50);
    },
});

export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("orders")
            .order("desc")
            .take(100);
    },
});

export const approveOrder = mutation({
    args: {
        orderId: v.id("orders"),
    },
    handler: async (ctx, args) => {
        const order = await ctx.db.get(args.orderId);
        if (!order) throw new Error("Order not found.");
        if (order.status !== "awaiting_approval") {
            throw new Error("Order is not awaiting approval.");
        }

        // Validate and deduct stock
        for (const item of order.items) {
            const product = await ctx.db.get(item.productId);
            if (!product) {
                throw new Error(`Product "${item.name}" no longer exists.`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Not enough stock for "${item.name}". Available: ${product.stock}, Requested: ${item.quantity}.`);
            }
        }

        // Deduct stock now that order is approved
        for (const item of order.items) {
            const product = await ctx.db.get(item.productId);
            if (product) {
                await ctx.db.patch(product._id, {
                    stock: product.stock - item.quantity,
                    sold: product.sold + item.quantity,
                });
            }
        }

        await ctx.db.patch(args.orderId, {
            status: "pending",
        });
        return args.orderId;
    },
});

export const rejectOrder = mutation({
    args: {
        orderId: v.id("orders"),
    },
    handler: async (ctx, args) => {
        const order = await ctx.db.get(args.orderId);
        if (!order) throw new Error("Order not found.");
        if (order.status !== "awaiting_approval") {
            throw new Error("Order is not awaiting approval.");
        }

        // Reject — no stock to restore since it wasn't deducted
        await ctx.db.patch(args.orderId, {
            status: "cancelled",
        });
        return args.orderId;
    },
});

export const confirmReceived = mutation({
    args: {
        orderId: v.id("orders"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const order = await ctx.db.get(args.orderId);
        if (!order) throw new Error("Order not found.");
        if (order.userId !== args.userId) throw new Error("Unauthorized.");

        // Users can confirm receipt when status is shipped
        await ctx.db.patch(args.orderId, {
            status: "completed",
        });
        return args.orderId;
    },
});

export const cancelOrder = mutation({
    args: {
        orderId: v.id("orders"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const order = await ctx.db.get(args.orderId);
        if (!order) throw new Error("Order not found.");
        if (order.userId !== args.userId) throw new Error("Unauthorized.");

        if (order.status === "completed" || order.status === "cancelled") {
            throw new Error("Cannot cancel a completed or already cancelled order.");
        }

        // If order was already approved (stock was deducted), restore stock
        if (order.status !== "awaiting_approval") {
            for (const item of order.items) {
                const product = await ctx.db.get(item.productId);
                if (product) {
                    await ctx.db.patch(item.productId, {
                        stock: product.stock + item.quantity,
                        sold: Math.max(0, product.sold - item.quantity),
                    });
                }
            }
        }

        await ctx.db.patch(args.orderId, {
            status: "cancelled",
        });
        return args.orderId;
    },
});

export const updateStatus = mutation({
    args: {
        orderId: v.id("orders"),
        status: v.union(
            v.literal("awaiting_approval"),
            v.literal("pending"),
            v.literal("processing"),
            v.literal("shipped"),
            v.literal("delivered"),
            v.literal("completed"),
            v.literal("cancelled")
        ),
    },
    handler: async (ctx, args) => {
        const order = await ctx.db.get(args.orderId);
        if (!order) throw new Error("Order not found.");

        // If status is changing to cancelled and order was approved, restore stock
        if (args.status === "cancelled" && order.status !== "cancelled" && order.status !== "awaiting_approval") {
            for (const item of order.items) {
                const product = await ctx.db.get(item.productId);
                if (product) {
                    await ctx.db.patch(item.productId, {
                        stock: product.stock + item.quantity,
                        sold: Math.max(0, product.sold - item.quantity),
                    });
                }
            }
        }

        await ctx.db.patch(args.orderId, {
            status: args.status,
        });
        return args.orderId;
    },
});
