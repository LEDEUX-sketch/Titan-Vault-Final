"use client";

import Link from "next/link";
import { Doc } from "../convex/_generated/dataModel";

const CATEGORY_EMOJI: Record<string, string> = {
    "action-figures": "🦸",
    statues: "🗿",
    "model-kits": "🔧",
    diecast: "🚗",
    "plush-collectibles": "🧸",
};

function formatPrice(price: number) {
    return `₱${price.toLocaleString("en-PH")}`;
}

export default function ProductCard({
    product,
}: {
    product: Doc<"products">;
}) {
    const discount =
        product.originalPrice
            ? Math.round(
                ((product.originalPrice - product.price) / product.originalPrice) *
                100
            )
            : null;

    return (
        <Link href={`/product/${product._id}`} className="product-card" style={{ position: "relative" }}>
            <div className="product-card-img" style={{ position: "relative" }}>
                {product.images[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        style={product.stock <= 0 ? { filter: "blur(4px)", pointerEvents: "none" } : {}}
                    />
                ) : (
                    <span className="product-placeholder" style={product.stock <= 0 ? { filter: "blur(4px)", pointerEvents: "none" } : {}}>
                        {CATEGORY_EMOJI[product.category] || "🎮"}
                    </span>
                )}

                {product.stock <= 0 && (
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "rgba(0,0,0,0.7)",
                        color: "white",
                        padding: "8px 16px",
                        fontWeight: "bold",
                        borderRadius: "4px",
                        zIndex: 10,
                        textTransform: "uppercase",
                        letterSpacing: "1px"
                    }}>
                        Sold Out
                    </div>
                )}

                {discount && product.stock > 0 && (
                    <span className="product-badge">{discount}% OFF</span>
                )}
                <span className="product-condition-badge">
                    {product.condition.replace("-", " ")}
                </span>
            </div>

            <div className="product-card-info">
                <p className="product-card-name">{product.name}</p>

                <div className="product-card-prices">
                    <span className="product-card-price">
                        {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                        <span className="product-card-original-price">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                    {discount && (
                        <span className="product-card-discount">-{discount}%</span>
                    )}
                </div>

                <div className="product-card-meta">
                    <span className="product-card-rating">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {product.rating.toFixed(1)}
                    </span>
                    <span>{product.sold.toLocaleString()} sold</span>
                </div>
            </div>
        </Link>
    );
}
