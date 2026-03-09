"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useAuth } from "../AuthContext";
import Header from "../Header";
import Footer from "../Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";

function formatPrice(price: number) {
    return `₱${price.toLocaleString("en-PH")}`;
}

export default function CartPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [toast, setToast] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const cartItems = useQuery(
        api.cart.get,
        user ? { userId: user.userId as Id<"users"> } : "skip"
    );

    const updateQuantity = useMutation(api.cart.updateQuantity);
    const removeItem = useMutation(api.cart.remove);

    const handleQuantityChange = async (
        cartItemId: Id<"cartItems">,
        newQty: number
    ) => {
        try {
            await updateQuantity({ cartItemId, quantity: newQty });
        } catch (err: unknown) {
            setToast(err instanceof Error ? err.message : "Error");
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleRemove = async (cartItemId: Id<"cartItems">) => {
        try {
            await removeItem({ cartItemId });
            setToast("Item removed from cart");
            setTimeout(() => setToast(null), 3000);
        } catch (err: unknown) {
            setToast(err instanceof Error ? err.message : "Error");
            setTimeout(() => setToast(null), 3000);
        }
    };

    const subtotal =
        cartItems?.reduce(
            (sum, item) =>
                sum + (item.product ? item.product.price * item.quantity : 0),
            0
        ) ?? 0;

    const shippingFee = subtotal > 5000 ? 0 : 150;
    const total = subtotal + shippingFee;

    if (!user) {
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
                        <div className="empty-state-icon">🔒</div>
                        <h3>Sign in to view your cart</h3>
                        <p>You need to be logged in to manage your shopping cart.</p>
                        <Link href="/" className="btn-secondary">
                            ← Go to Shop
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                activeCategory={null}
                onCategoryChange={() => { }}
            />

            <div className="page-container">
                <h1 className="page-title">🛒 Shopping Cart</h1>

                {cartItems === undefined ? (
                    <div className="loading-spinner">
                        <div className="spinner" />
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🛒</div>
                        <h3>Your cart is empty</h3>
                        <p>Start adding some awesome collectibles!</p>
                        <Link href="/" className="btn-secondary">
                            ← Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items">
                            {cartItems.map((item) => (
                                <div key={item._id} className="cart-item">
                                    <div className="cart-item-img">
                                        {item.product?.images[0] ? (
                                            <img
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                            />
                                        ) : (
                                            <span>🎮</span>
                                        )}
                                    </div>

                                    <div className="cart-item-details">
                                        <Link
                                            href={`/product/${item.productId}`}
                                            className="cart-item-name"
                                            style={{ textDecoration: "none", color: "inherit" }}
                                        >
                                            {item.product?.name}
                                        </Link>
                                        <p className="cart-item-brand">{item.product?.brand}</p>
                                        <p className="cart-item-price">
                                            {item.product && formatPrice(item.product.price)}
                                        </p>

                                        <div className="quantity-control">
                                            <button
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        item._id,
                                                        item.quantity - 1
                                                    )
                                                }
                                            >
                                                −
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        item._id,
                                                        item.quantity + 1
                                                    )
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        className="cart-item-remove"
                                        onClick={() => handleRemove(item._id)}
                                        title="Remove item"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            <div className="summary-row">
                                <span>Subtotal ({cartItems.length} items)</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping Fee</span>
                                <span>
                                    {shippingFee === 0 ? (
                                        <span style={{ color: "var(--accent-green)" }}>FREE</span>
                                    ) : (
                                        formatPrice(shippingFee)
                                    )}
                                </span>
                            </div>
                            {shippingFee > 0 && (
                                <div
                                    className="summary-row"
                                    style={{ fontSize: "0.78rem", color: "var(--accent-green)" }}
                                >
                                    <span>Free shipping for orders above ₱5,000</span>
                                </div>
                            )}
                            <div className="summary-total">
                                <span>Total</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            <button className="checkout-btn" onClick={() => router.push("/checkout")}>Proceed to Checkout</button>
                        </div>
                    </div>
                )}
            </div>

            <Footer />

            {toast && (
                <div
                    className={`toast ${toast.includes("Error") ? "toast-error" : "toast-success"}`}
                >
                    {toast}
                </div>
            )}
        </>
    );
}
