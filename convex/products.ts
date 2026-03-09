import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    args: {
        category: v.optional(
            v.union(
                v.literal("action-figures"),
                v.literal("statues"),
                v.literal("model-kits"),
                v.literal("diecast"),
                v.literal("plush-collectibles")
            )
        ),
        brand: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let q;

        if (args.category) {
            q = ctx.db
                .query("products")
                .withIndex("by_category", (idx) => idx.eq("category", args.category!));
        } else if (args.brand) {
            q = ctx.db
                .query("products")
                .withIndex("by_brand", (idx) => idx.eq("brand", args.brand!));
        } else {
            q = ctx.db.query("products");
        }

        const products = await q.order("desc").take(args.limit ?? 50);
        return products;
    },
});

export const getFeatured = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("products")
            .withIndex("by_featured", (q) => q.eq("isFeatured", true))
            .take(10);
    },
});

export const getFlashSale = query({
    handler: async (ctx) => {
        const now = Date.now();
        const items = await ctx.db
            .query("products")
            .withIndex("by_flash_sale", (q) => q.eq("isFlashSale", true))
            .take(20);

        // Only return items whose flash sale hasn't expired
        return items.filter((item) => !item.flashSaleEnd || item.flashSaleEnd > now);
    },
});

export const getById = query({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.productId);
    },
});

export const search = query({
    args: { searchTerm: v.string() },
    handler: async (ctx, args) => {
        if (!args.searchTerm.trim()) return [];
        return await ctx.db
            .query("products")
            .withSearchIndex("search_name", (q) => q.search("name", args.searchTerm))
            .take(20);
    },
});

export const createProduct = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        shortDescription: v.optional(v.string()),
        price: v.number(),
        category: v.union(
            v.literal("action-figures"),
            v.literal("statues"),
            v.literal("model-kits"),
            v.literal("diecast"),
            v.literal("plush-collectibles")
        ),
        brand: v.string(),
        condition: v.union(
            v.literal("mint-in-box"),
            v.literal("new"),
            v.literal("like-new"),
            v.literal("used")
        ),
        stock: v.number(),
        images: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const productId = await ctx.db.insert("products", {
            name: args.name,
            description: args.description,
            shortDescription: args.shortDescription,
            price: args.price,
            category: args.category,
            brand: args.brand,
            condition: args.condition,
            stock: args.stock,
            images: args.images,
            sold: 0,
            rating: 0,
            ratingCount: 0,
            tags: [],
            isFeatured: false,
            isFlashSale: false,
            createdAt: Date.now(),
        });
        return productId;
    },
});

export const deleteProduct = mutation({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        // Only allow admins to delete products (optional validation if auth is added here)
        await ctx.db.delete(args.productId);
        return { success: true };
    },
});

export const updateStock = mutation({
    args: {
        productId: v.id("products"),
        newStock: v.number()
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.productId, {
            stock: args.newStock
        });
        return { success: true };
    },
});

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const getStorageUrl = mutation({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});
