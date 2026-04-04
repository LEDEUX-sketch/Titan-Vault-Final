"use client";

import { use, useState, useEffect } from "react";
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

export default function CheckoutPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [toast, setToast] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const [hasHydrated, setHasHydrated] = useState(false);
    const [address, setAddress] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        province: "",
        zipCode: "",
    });

    const userData = useQuery(api.auth.getUser, user ? { userId: user.userId as Id<"users"> } : "skip");

    useEffect(() => {
        if (userData && !hasHydrated) {
            setAddress({
                fullName: userData.name || "",
                phone: userData.phone || "",
                address: userData.address || "",
                city: userData.city || "",
                province: userData.province || "",
                zipCode: userData.zipCode || "",
            });
            setHasHydrated(true);
        }
    }, [userData, hasHydrated]);

    const cartItems = useQuery(
        api.cart.get,
        user ? { userId: user.userId as Id<"users"> } : "skip"
    );

    const placeOrder = useMutation(api.orders.place);

    useEffect(() => {
        if (user === null) {
            router.push("/");
        }
    }, [user, router]);

    useEffect(() => {
        if (cartItems && cartItems.length === 0) {
            router.push("/cart");
        }
    }, [cartItems, router]);

    if (!user || cartItems === undefined || cartItems.length === 0) {
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

    const subtotal =
        cartItems.reduce(
            (sum, item) =>
                sum + (item.product ? item.product.price * item.quantity : 0),
            0
        ) ?? 0;

    const shippingFee = subtotal > 5000 ? 0 : 150;
    const total = subtotal + shippingFee;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!address.fullName || !address.phone || !address.address || !address.city || !address.province || !address.zipCode) {
            setToast("Please fill in all shipping details");
            setTimeout(() => setToast(null), 3000);
            return;
        }

        setIsProcessing(true);
        try {
            await placeOrder({
                userId: user.userId as Id<"users">,
                shippingAddress: address,
            });

            setToast("Order submitted! Awaiting admin approval.");
            setTimeout(() => {
                router.push("/orders");
            }, 2000);
        } catch (err: unknown) {
            setIsProcessing(false);
            setToast(err instanceof Error ? err.message : "Error placing order");
            setTimeout(() => setToast(null), 3000);
        }
    };

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
                    <Link href="/cart" style={{ color: "var(--primary)", textDecoration: "none" }}>
                        ← Back to Cart
                    </Link>
                </div>

                <h1 className="page-title">📝 Checkout</h1>

                <div className="cart-layout">
                    <div className="checkout-form-container">
                        <div className="checkout-section">
                            <h3>Shipping Address</h3>
                            <form id="checkout-form" onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={address.fullName}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={address.phone}
                                            onChange={handleInputChange}
                                            placeholder="Enter your phone number"
                                            required
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Exact Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={address.address}
                                            onChange={handleInputChange}
                                            placeholder="House No., Street Name, Barangay"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={address.city}
                                            onChange={handleInputChange}
                                            placeholder="City"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Province</label>
                                        <input
                                            type="text"
                                            name="province"
                                            value={address.province}
                                            onChange={handleInputChange}
                                            placeholder="Province"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Zip Code</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={address.zipCode}
                                            onChange={handleInputChange}
                                            placeholder="Zip Code"
                                            required
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="checkout-section">
                            <h3>Order Items</h3>
                            <div className="checkout-items-list">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="checkout-item-mini">
                                        <div className="checkout-item-mini-img">
                                            {item.product?.images[0] ? (
                                                <img src={item.product.images[0]} alt={item.product.name} />
                                            ) : (
                                                <span>🎮</span>
                                            )}
                                        </div>
                                        <div className="checkout-item-mini-info">
                                            <p className="mini-name">{item.product?.name}</p>
                                            <p className="mini-meta">
                                                {item.quantity} x {item.product && formatPrice(item.product.price)}
                                            </p>
                                        </div>
                                        <div className="mini-total">
                                            {item.product && formatPrice(item.product.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="order-summary">
                        <h3>Payment Summary</h3>
                        <div className="summary-row">
                            <span>Merchandise Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping Fee</span>
                            <span>{shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}</span>
                        </div>
                        <div className="summary-total">
                            <span>Total Payment</span>
                            <span>{formatPrice(total)}</span>
                        </div>

                        <div className="payment-method-box">
                            <p>Payment Method</p>
                            <div className="payment-option">
                                <span className="icon">💵</span>
                                <div>
                                    <strong>Cash on Delivery</strong>
                                    <p>Pay when you receive the package</p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            form="checkout-form"
                            className="checkout-btn"
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Placing Order..." : "Place Order"}
                        </button>
                    </div>
                </div>
            </div>

            <Footer />

            {toast && (
                <div className={`toast ${toast.includes("Error") ? "toast-error" : "toast-success"}`}>
                    {toast}
                </div>
            )}

            <style jsx>{`
                .checkout-form-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .checkout-section {
                    background: white;
                    border-radius: var(--radius-md);
                    padding: 24px;
                    border: 1px solid var(--border-light);
                }
                .checkout-section h3 {
                    font-size: 1rem;
                    font-weight: 700;
                    margin-bottom: 20px;
                    color: var(--text-primary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .full-width {
                    grid-column: span 2;
                }
                .checkout-items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .checkout-item-mini {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #f5f5f5;
                }
                .checkout-item-mini:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }
                .checkout-item-mini-img {
                    width: 50px;
                    height: 50px;
                    background: #f8f8f8;
                    border-radius: var(--radius-sm);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    overflow: hidden;
                }
                .checkout-item-mini-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .checkout-item-mini-info {
                    flex: 1;
                }
                .mini-name {
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: var(--text-primary);
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .mini-meta {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                .mini-total {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--primary);
                }
                .payment-method-box {
                    margin-top: 24px;
                    padding-top: 20px;
                    border-top: 1px dashed var(--border-light);
                }
                .payment-method-box p {
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: var(--text-secondary);
                }
                .payment-option {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: #fef0ed;
                    border: 1px solid var(--primary);
                    border-radius: var(--radius-md);
                }
                .payment-option .icon {
                    font-size: 1.5rem;
                }
                .payment-option strong {
                    display: block;
                    font-size: 0.85rem;
                    color: var(--primary);
                }
                .payment-option p {
                    margin: 0;
                    font-size: 0.75rem;
                    color: var(--primary-light);
                    font-weight: 400;
                }
                @media (max-width: 768px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .full-width {
                        grid-column: span 1;
                    }
                }
            `}</style>
        </>
    );
}
