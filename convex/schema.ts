import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        email: v.string(),
        passwordHash: v.string(),
        name: v.string(),
        role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
        status: v.optional(v.union(v.literal("active"), v.literal("banned"), v.literal("suspended"))),
        suspendedUntil: v.optional(v.number()),
        phone: v.optional(v.string()),
        address: v.optional(v.string()),
        city: v.optional(v.string()),
        province: v.optional(v.string()),
        zipCode: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_email", ["email"]),

    products: defineTable({
        name: v.string(),
        description: v.string(),
        shortDescription: v.optional(v.string()),
        price: v.number(),
        originalPrice: v.optional(v.number()),
        images: v.array(v.string()),
        category: v.union(
            v.literal("action-figures"),
            v.literal("statues"),
            v.literal("model-kits"),
            v.literal("diecast"),
            v.literal("plush-collectibles")
        ),
        brand: v.string(),
        series: v.optional(v.string()),
        condition: v.union(
            v.literal("mint-in-box"),
            v.literal("new"),
            v.literal("like-new"),
            v.literal("used")
        ),
        stock: v.number(),
        sold: v.number(),
        rating: v.number(),
        ratingCount: v.number(),
        tags: v.array(v.string()),
        isFeatured: v.boolean(),
        isFlashSale: v.boolean(),
        flashSaleEnd: v.optional(v.number()),
        createdAt: v.number(),
    })
        .index("by_category", ["category"])
        .index("by_brand", ["brand"])
        .index("by_featured", ["isFeatured"])
        .index("by_flash_sale", ["isFlashSale"])
        .searchIndex("search_name", { searchField: "name", filterFields: ["category", "brand"] }),

    cartItems: defineTable({
        userId: v.id("users"),
        productId: v.id("products"),
        quantity: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_product", ["userId", "productId"]),

    orders: defineTable({
        userId: v.id("users"),
        items: v.array(
            v.object({
                productId: v.id("products"),
                name: v.string(),
                price: v.number(),
                quantity: v.number(),
                image: v.string(),
            })
        ),
        totalAmount: v.number(),
        status: v.union(
            v.literal("awaiting_approval"),
            v.literal("pending"),
            v.literal("processing"),
            v.literal("shipped"),
            v.literal("delivered"),
            v.literal("completed"),
            v.literal("cancelled")
        ),
        shippingAddress: v.object({
            fullName: v.string(),
            phone: v.string(),
            address: v.string(),
            city: v.string(),
            province: v.string(),
            zipCode: v.string(),
        }),
        createdAt: v.number(),
    }).index("by_user", ["userId"]),
});
