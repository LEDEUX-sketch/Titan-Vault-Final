import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple hash function for demo purposes (NOT production-grade)
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return hash.toString(36);
}

// Predefined admin credentials
const ADMIN_EMAIL = "admin@toybox.com";
const ADMIN_PASSWORD = "admin123";

export const register = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if user already exists
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existing) {
            throw new Error("An account with this email already exists.");
        }

        const userId = await ctx.db.insert("users", {
            email: args.email,
            passwordHash: simpleHash(args.password),
            name: args.name,
            role: "user",
            status: "active",
            createdAt: Date.now(),
        });

        return { userId, name: args.name, email: args.email, role: "user" as const, status: "active" as const };
    },
});

export const signIn = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) {
            throw new Error("Invalid email or password.");
        }

        if (user.passwordHash !== simpleHash(args.password)) {
            throw new Error("Invalid email or password.");
        }

        const role = user.role ?? "user";
        const status = user.status ?? "active";

        if (status === "banned") {
            throw new ConvexError("Your account has been banned. Please contact support.");
        }

        if (status === "suspended") {
            // Auto-reactivate if suspension has expired
            if (user.suspendedUntil && Date.now() >= user.suspendedUntil) {
                await ctx.db.patch(user._id, { status: "active", suspendedUntil: undefined });
            } else {
                let remaining = "";
                if (user.suspendedUntil) {
                    const diff = user.suspendedUntil - Date.now();
                    const hours = Math.floor(diff / 3600000);
                    const mins = Math.floor((diff % 3600000) / 60000);
                    if (hours > 0) {
                        remaining = ` Suspension expires in ${hours}h ${mins}m.`;
                    } else {
                        remaining = ` Suspension expires in ${mins} minutes.`;
                    }
                }
                throw new ConvexError(`Your account has been suspended.${remaining} Please contact support.`);
            }
        }

        // Re-read status after possible auto-reactivation
        const currentStatus = user.suspendedUntil && Date.now() >= user.suspendedUntil ? "active" : status;

        return { userId: user._id, name: user.name, email: user.email, role, status: currentStatus };
    },
});

export const adminLogin = mutation({
    handler: async (ctx) => {
        // Check if admin user already exists
        let admin = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", ADMIN_EMAIL))
            .first();

        if (!admin) {
            // Create admin user on first admin login
            const adminId = await ctx.db.insert("users", {
                email: ADMIN_EMAIL,
                passwordHash: simpleHash(ADMIN_PASSWORD),
                name: "Admin",
                role: "admin",
                status: "active",
                createdAt: Date.now(),
            });
            admin = await ctx.db.get(adminId);
        }

        if (!admin) {
            throw new Error("Failed to create admin account.");
        }

        return { userId: admin._id, name: admin.name, email: admin.email, role: admin.role, status: admin.status };
    },
});

export const getUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});
