import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listAll = query({
    handler: async (ctx) => {
        const users = await ctx.db.query("users").order("desc").collect();
        // Return users without password hashes
        return users.map((u) => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            role: u.role ?? "user",
            status: u.status ?? "active",
            createdAt: u.createdAt,
        }));
    },
});

export const banUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found.");
        if (user.role === "admin") throw new Error("Cannot ban an admin user.");
        await ctx.db.patch(args.userId, { status: "banned" });
        return { success: true };
    },
});

export const unbanUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found.");
        await ctx.db.patch(args.userId, { status: "active" });
        return { success: true };
    },
});

export const suspendUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found.");
        if (user.role === "admin") throw new Error("Cannot suspend an admin user.");
        await ctx.db.patch(args.userId, { status: "suspended" });
        return { success: true };
    },
});

export const reactivateUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found.");
        await ctx.db.patch(args.userId, { status: "active" });
        return { success: true };
    },
});
