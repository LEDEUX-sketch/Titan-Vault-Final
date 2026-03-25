import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listAll = query({
    handler: async (ctx) => {
        const users = await ctx.db.query("users").order("desc").collect();
        const now = Date.now();
        // Return users without password hashes; show expired suspensions as "active" in the UI
        return users.map((u) => {
            const isExpired = u.status === "suspended" && u.suspendedUntil && now >= u.suspendedUntil;
            return {
                _id: u._id,
                name: u.name,
                email: u.email,
                role: u.role ?? "user",
                status: isExpired ? "active" : (u.status ?? "active"),
                suspendedUntil: isExpired ? undefined : u.suspendedUntil,
                createdAt: u.createdAt,
            };
        });
    },
});

export const banUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found.");
        if (user.role === "admin") throw new Error("Cannot ban an admin user.");
        await ctx.db.patch(args.userId, { status: "banned", suspendedUntil: undefined });
        return { success: true };
    },
});

export const unbanUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found.");
        await ctx.db.patch(args.userId, { status: "active", suspendedUntil: undefined });
        return { success: true };
    },
});

export const suspendUser = mutation({
    args: {
        userId: v.id("users"),
        durationHours: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found.");
        if (user.role === "admin") throw new Error("Cannot suspend an admin user.");

        const suspendedUntil = args.durationHours
            ? Date.now() + args.durationHours * 3600000
            : undefined; // undefined = indefinite

        await ctx.db.patch(args.userId, { status: "suspended", suspendedUntil });
        return { success: true };
    },
});

export const reactivateUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found.");
        await ctx.db.patch(args.userId, { status: "active", suspendedUntil: undefined });
        return { success: true };
    },
});
