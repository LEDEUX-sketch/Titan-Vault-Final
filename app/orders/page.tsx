"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../AuthContext";
import Header from "../Header";
import Footer from "../Footer";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";
import Link from "next/link";
import ConfirmModal from "../ConfirmModal";


function formatPrice(price: number) {
    return `₱${price.toLocaleString("en-PH")}`;
}

export default function UserOrdersPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"active" | "history">("active");
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: "primary" | "danger";
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        type: "primary",
    });


    const orders = useQuery(
        api.orders.getByUser,
        user ? { userId: user.userId as Id<"users"> } : "skip"
    );

    const confirmReceived = useMutation(api.orders.confirmReceived);
    const cancelOrder = useMutation(api.orders.cancelOrder);

    useEffect(() => {
        if (user === null) {
            router.push("/");
        }
    }, [user, router]);

    const handleConfirmReceipt = (orderId: Id<"orders">) => {
        if (!user) return;

        setModalConfig({
            isOpen: true,
            title: "Confirm Receipt",
            message: "Acknowledge that you have received all items in this order and the quality is satisfactory? This will mark the order as completed.",
            type: "primary",
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, isOpen: false }));
                setConfirmingId(orderId);
                try {
                    await confirmReceived({ orderId, userId: user.userId as Id<"users"> });
                } catch (error) {
                    console.error("Failed to confirm receipt:", error);
                    alert("Failed to confirm receipt. Please try again.");
                } finally {
                    setConfirmingId(null);
                }
            }
        });
    };

    const handleCancelOrder = (orderId: Id<"orders">) => {
        if (!user) return;

        setModalConfig({
            isOpen: true,
            title: "Cancel Order",
            message: "Are you sure you want to cancel this order? This action cannot be undone.",
            type: "danger",
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, isOpen: false }));
                setConfirmingId(orderId);
                try {
                    await cancelOrder({ orderId, userId: user.userId as Id<"users"> });
                } catch (error) {
                    console.error("Failed to cancel order:", error);
                    alert("Failed to cancel order. Please try again.");
                } finally {
                    setConfirmingId(null);
                }
            }
        });
    };


    if (!user || orders === undefined) {
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

    const activeOrders = orders.filter(o => o.status === "awaiting_approval" || o.status === "pending" || o.status === "processing" || o.status === "shipped" || o.status === "delivered");
    const historyOrders = orders.filter(o => o.status === "completed" || o.status === "cancelled");
    const displayedOrders = activeTab === "active" ? activeOrders : historyOrders;

    const TabButton = ({ id, label, count }: { id: "active" | "history", label: string, count: number }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                padding: "12px 24px",
                background: activeTab === id ? "white" : "transparent",
                border: "none",
                borderBottom: activeTab === id ? "3px solid var(--primary)" : "3px solid transparent",
                color: activeTab === id ? "var(--primary)" : "var(--text-muted)",
                fontSize: "0.95rem",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px"
            }}
        >
            {label}
            <span style={{
                background: activeTab === id ? "rgba(255,107,107,0.1)" : "#f0f0f0",
                color: activeTab === id ? "var(--primary)" : "#888",
                padding: "2px 8px",
                borderRadius: "10px",
                fontSize: "0.75rem"
            }}>
                {count}
            </span>
        </button>
    );

    return (
        <>
            <Header
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                activeCategory={null}
                onCategoryChange={() => { }}
            />

            <div className="page-container" style={{ minHeight: "60vh", paddingBottom: "80px" }}>
                <div style={{ marginBottom: 16, fontSize: "0.85rem" }}>
                    <Link href="/" style={{ color: "var(--primary)", textDecoration: "none" }}>
                        ← Back to Shopping
                    </Link>
                </div>

                <h1 className="page-title">📦 My Orders</h1>

                <div style={{
                    display: "flex",
                    borderBottom: "1px solid var(--border-light)",
                    marginBottom: "30px",
                    gap: "10px"
                }}>
                    <TabButton id="active" label="Active Orders" count={activeOrders.length} />
                    <TabButton id="history" label="Order History" count={historyOrders.length} />
                </div>

                {displayedOrders.length === 0 ? (
                    <div className="empty-state" style={{ padding: "60px 0" }}>
                        <div className="empty-state-icon" style={{ fontSize: "4rem", marginBottom: "20px" }}>
                            {activeTab === "active" ? "📦" : "📜"}
                        </div>
                        <h3>{activeTab === "active" ? "No active orders" : "No order history"}</h3>
                        <p>{activeTab === "active" ? "When you checkout items, they will appear here!" : "Once you receive and confirm your orders, they will appear here."}</p>
                        {activeTab === "active" && (
                            <Link href="/" className="btn-secondary" style={{ marginTop: "20px", display: "inline-block" }}>
                                Start Shopping
                            </Link>
                        )}
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {displayedOrders.map((order) => (
                            <div key={order._id} style={{
                                background: "white",
                                border: "1px solid var(--border-light)",
                                borderRadius: "var(--radius-md)",
                                padding: "24px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "16px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f5f5f5", paddingBottom: "16px" }}>
                                    <div>
                                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                                            Order Placed: {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                        <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
                                            Order #{order._id.toString().slice(-8).toUpperCase()}
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <span style={{
                                            display: "inline-block",
                                            padding: "6px 14px",
                                            borderRadius: "20px",
                                            fontSize: "0.75rem",
                                            fontWeight: "700",
                                            textTransform: "uppercase",
                                            background: order.status === "completed" ? "#ecfdf5" : order.status === "shipped" || order.status === "delivered" ? "#eff6ff" : order.status === "awaiting_approval" ? "#fef3c7" : "#fffbeb",
                                            color: order.status === "completed" ? "#22c55e" : order.status === "shipped" || order.status === "delivered" ? "#3b82f6" : order.status === "awaiting_approval" ? "#d97706" : "#f59e0b",
                                            border: `1px solid ${order.status === "completed" ? "#d1fae5" : order.status === "shipped" || order.status === "delivered" ? "#dbeafe" : order.status === "awaiting_approval" ? "#fde68a" : "#fef3c7"}`,
                                            letterSpacing: "0.5px"
                                        }}>
                                            {order.status === "awaiting_approval" ? "Awaiting Approval" : order.status}
                                        </span>
                                    </div>
                                </div>

                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "20px 0",
                                    borderBottom: "1px solid #f5f5f5",
                                    marginBottom: "10px"
                                }}>
                                    {[
                                        { s: "awaiting_approval", l: "Approval" },
                                        { s: "pending", l: "Pending" },
                                        { s: "processing", l: "Processing" },
                                        { s: "shipped", l: "Shipped" },
                                        { s: "completed", l: "Received" }
                                    ].map((step, i, arr) => {
                                        const statuses = ["awaiting_approval", "pending", "processing", "shipped", "delivered", "completed"];
                                        const currentIdx = statuses.indexOf(order.status || "awaiting_approval");
                                        const stepIdx = statuses.indexOf(step.s);
                                        const isActive = currentIdx >= stepIdx;
                                        const isLast = i === arr.length - 1;

                                        return (
                                            <div key={step.s} style={{ display: "flex", alignItems: "center", flex: isLast ? "0 0 auto" : "1" }}>
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                                                    <div style={{
                                                        width: "24px",
                                                        height: "24px",
                                                        borderRadius: "50%",
                                                        background: isActive ? (step.s === "awaiting_approval" && order.status === "awaiting_approval" ? "#d97706" : "var(--primary)") : "#f0f0f0",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: "white",
                                                        fontSize: "12px",
                                                        zIndex: 2,
                                                        transition: "all 0.3s ease",
                                                        boxShadow: isActive ? "0 0 10px rgba(255,107,107,0.3)" : "none"
                                                    }}>
                                                        {isActive ? "✓" : i + 1}
                                                    </div>
                                                    <span style={{
                                                        position: "absolute",
                                                        top: "28px",
                                                        fontSize: "0.7rem",
                                                        fontWeight: isActive ? "700" : "500",
                                                        color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                                                        whiteSpace: "nowrap"
                                                    }}>
                                                        {step.l}
                                                    </span>
                                                </div>
                                                {!isLast && (
                                                    <div style={{
                                                        height: "2px",
                                                        flex: 1,
                                                        background: isActive && currentIdx > stepIdx ? "var(--primary)" : "#f0f0f0",
                                                        margin: "0 10px",
                                                        transition: "all 0.3s ease"
                                                    }} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {order.items.map((item, index) => (
                                        <div key={index} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                            <div style={{ width: "60px", height: "60px", background: "#f8f8f8", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                ) : (
                                                    <span style={{ fontSize: "1.5rem" }}>🎮</span>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>
                                                    {item.name}
                                                </p>
                                                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                                    Qty: {item.quantity} × {formatPrice(item.price)}
                                                </p>
                                            </div>
                                            <div style={{ fontSize: "1rem", fontWeight: "700", color: "var(--primary)" }}>
                                                {formatPrice(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ borderTop: "1px dashed var(--border-light)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                        <strong>Shipping:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
                                        <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                                            Total: <span style={{ color: "var(--primary)" }}>{formatPrice(order.totalAmount)}</span>
                                        </div>
                                        {activeTab === "active" && order.status === "awaiting_approval" ? (
                                            <div style={{
                                                padding: "8px 16px",
                                                fontSize: "0.8rem",
                                                borderRadius: "10px",
                                                background: "#fef3c7",
                                                border: "1px solid #fde68a",
                                                color: "#92400e",
                                                fontWeight: 600,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px"
                                            }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <polyline points="12 6 12 12 16 14" />
                                                </svg>
                                                Waiting for admin approval
                                            </div>
                                        ) : activeTab === "active" && (
                                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                                <button
                                                    onClick={() => handleCancelOrder(order._id)}
                                                    disabled={confirmingId === order._id}
                                                    style={{
                                                        padding: "8px 20px",
                                                        fontSize: "0.85rem",
                                                        borderRadius: "10px",
                                                        background: "#fff1f0",
                                                        border: "1px solid #ffccc7",
                                                        color: "#ff4d4f",
                                                        cursor: "pointer",
                                                        fontWeight: "600",
                                                        transition: "all 0.2s ease"
                                                    }}
                                                    onMouseOver={(e) => (e.currentTarget.style.background = "#ffccc7")}
                                                    onMouseOut={(e) => (e.currentTarget.style.background = "#fff1f0")}
                                                >
                                                    {confirmingId === order._id ? "Cancelling..." : "Cancel Order"}
                                                </button>
                                                <button
                                                    onClick={() => handleConfirmReceipt(order._id)}
                                                    disabled={confirmingId === order._id}
                                                    className="btn-primary"
                                                    style={{
                                                        padding: "8px 20px",
                                                        fontSize: "0.85rem",
                                                        borderRadius: "10px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "8px"
                                                    }}
                                                >
                                                    {confirmingId === order._id ? (
                                                        <>Confirming...</>
                                                    ) : (
                                                        <>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                            </svg>
                                                            Confirm Receipt
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                confirmText={modalConfig.type === "danger" ? "Yes, Cancel Order" : "Yes, Confirm Receipt"}
            />
        </>
    );
}

