import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const items = await ctx.db
            .query("cartItems")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        // Enrich with product details
        const enriched = await Promise.all(
            items.map(async (item) => {
                const product = await ctx.db.get(item.productId);
                return {
                    ...item,
                    product,
                };
            })
        );

        return enriched.filter((item) => item.product !== null);
    },
});

export const add = mutation({
    args: {
        userId: v.id("users"),
        productId: v.id("products"),
        quantity: v.number(),
    },
    handler: async (ctx, args) => {
        // Check if product exists and has stock
        const product = await ctx.db.get(args.productId);
        if (!product) throw new Error("Product not found.");
        if (product.stock < args.quantity) throw new Error("Not enough stock.");

        // Check if item already in cart
        const existing = await ctx.db
            .query("cartItems")
            .withIndex("by_user_product", (q) =>
                q.eq("userId", args.userId).eq("productId", args.productId)
            )
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                quantity: existing.quantity + args.quantity,
            });
        } else {
            await ctx.db.insert("cartItems", {
                userId: args.userId,
                productId: args.productId,
                quantity: args.quantity,
            });
        }
    },
});

export const updateQuantity = mutation({
    args: {
        cartItemId: v.id("cartItems"),
        quantity: v.number(),
    },
    handler: async (ctx, args) => {
        if (args.quantity <= 0) {
            await ctx.db.delete(args.cartItemId);
        } else {
            await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
        }
    },
});

export const remove = mutation({
    args: { cartItemId: v.id("cartItems") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.cartItemId);
    },
});

export const getCount = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const items = await ctx.db
            .query("cartItems")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
        return items.reduce((sum, item) => sum + item.quantity, 0);
    },
});
