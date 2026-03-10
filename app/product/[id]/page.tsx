"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "../../AuthContext";
import AuthModal from "../../AuthModal";
import Header from "../../Header";
import Footer from "../../Footer";
import { useRouter } from "next/navigation";
import Link from "next/link";


function formatPrice(price: number) {
    return `₱${price.toLocaleString("en-PH")}`;
}

export default function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { user } = useAuth();
    const [showAuth, setShowAuth] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();


    const product = useQuery(api.products.getById, {
        productId: id as Id<"products">,
    });
    const addToCart = useMutation(api.cart.add);

    const handleAddToCart = async (redirectToCheckout = false) => {
        if (!user) {
            setShowAuth(true);
            return;
        }
        try {
            await addToCart({
                userId: user.userId as Id<"users">,
                productId: id as Id<"products">,
                quantity: 1,
            });

            if (redirectToCheckout) {
                router.push("/checkout");
                return;
            }

            setToast("Added to cart!");
            setTimeout(() => setToast(null), 3000);
        } catch (err: unknown) {
            setToast(err instanceof Error ? err.message : "Error adding to cart");
            setTimeout(() => setToast(null), 3000);
        }
    };


    if (product === undefined) {
        return (
            <>
                <Header
                    searchTerm={searchTerm}
                    onSearch={setSearchTerm}
                    activeCategory={null}
                    onCategoryChange={() => { }}
                />
                <div className="loading-spinner">
                    <div className="spinner" />
                </div>
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Header
                    searchTerm={searchTerm}
                    onSearch={setSearchTerm}
                    activeCategory={null}
                    onCategoryChange={() => { }}
                />
                <div className="page-container">
                    <div className="empty-state">
                        <div className="empty-state-icon">😕</div>
                        <h3>Product not found</h3>
                        <p>This product may have been removed or doesn&apos;t exist.</p>
                        <Link href="/" className="btn-secondary">
                            ← Back to Shop
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const discount = product.originalPrice
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
        : null;

    return (
        <>
            <Header
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                activeCategory={null}
                onCategoryChange={() => { }}
            />

            <div className="page-container">
                <div style={{ marginBottom: 16, fontSize: "0.85rem" }}>
                    <Link href="/" style={{ color: "var(--primary)", textDecoration: "none" }}>
                        ← Back to Shop
                    </Link>
                </div>

                <div className="product-detail">
                    <div className="product-detail-img">
                        {product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} />
                        ) : (
                            <span>🎮</span>
                        )}
                    </div>

                    <div className="product-detail-info">
                        <h1>{product.name}</h1>

                        <div className="product-detail-rating">
                            ⭐ <strong>{product.rating.toFixed(1)}</strong> ({product.ratingCount}{" "}
                            ratings) &nbsp;|&nbsp; {product.sold.toLocaleString()} sold
                        </div>

                        <div className="product-detail-price-box">
                            <span className="product-detail-price">
                                {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                                <span className="product-detail-original">
                                    {formatPrice(product.originalPrice)}
                                </span>
                            )}
                            {discount && (
                                <span
                                    className="product-card-discount"
                                    style={{ marginLeft: 8, fontSize: "0.85rem" }}
                                >
                                    -{discount}% OFF
                                </span>
                            )}
                        </div>

                        <dl className="product-detail-spec">
                            <dt>Brand</dt>
                            <dd>{product.brand}</dd>
                            <dt>Category</dt>
                            <dd>{product.category.replace(/-/g, " ")}</dd>
                            <dt>Condition</dt>
                            <dd>{product.condition.replace(/-/g, " ")}</dd>
                            {product.series && (
                                <>
                                    <dt>Series</dt>
                                    <dd>{product.series}</dd>
                                </>
                            )}
                            <dt>Stock</dt>
                            <dd>
                                {product.stock > 0 ? (
                                    <span style={{ color: "var(--accent-green)" }}>
                                        {product.stock} left
                                    </span>
                                ) : (
                                    <span style={{ color: "var(--accent-red)" }}>Out of stock</span>
                                )}
                            </dd>
                        </dl>

                        <div className="product-detail-tags">
                            {product.tags.map((tag) => (
                                <span key={tag}>{tag}</span>
                            ))}
                        </div>

                        <p className="product-detail-desc">{product.description}</p>

                        <div className="product-detail-actions">
                            <button
                                className="btn-add-cart"
                                onClick={() => handleAddToCart(false)}
                                disabled={product.stock === 0}
                            >
                                🛒 Add to Cart
                            </button>
                            <button
                                className="btn-buy-now"
                                onClick={() => handleAddToCart(true)}
                                disabled={product.stock === 0}
                            >
                                Buy Now
                            </button>

                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {toast && (
                <div className={`toast ${toast.includes("Error") ? "toast-error" : "toast-success"}`}>
                    {toast}
                </div>
            )}

            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </>
    );
}
