"use client";

import { useAuth } from "../../AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";

const formatPrice = (price: number) => {
    return `₱${price.toLocaleString("en-PH")}`;
};

const S = {
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "40px",
    },
    title: {
        fontSize: "2.3rem",
        fontWeight: 800,
        color: "#1a1a2e",
        margin: 0,
        letterSpacing: "-1px"
    },
    badge: {
        padding: "6px 14px",
        background: "#eff6ff",
        color: "#3b82f6",
        borderRadius: "20px",
        fontSize: "0.85rem",
        fontWeight: 700,
    },
    tableContainer: {
        background: "white",
        borderRadius: "16px",
        padding: "20px 24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        overflowX: "auto" as const,
    },
    table: {
        width: "100%",
        borderCollapse: "collapse" as const,
        minWidth: "1100px",
    },
    th: {
        textAlign: "left" as const,
        padding: "16px 16px",
        fontSize: "0.85rem",
        fontWeight: 700,
        color: "#a0aabf",
        borderBottom: "2px solid #f1f3f5",
        textTransform: "uppercase" as const,
        letterSpacing: "0.5px",
    },
    td: {
        padding: "16px 16px",
        fontSize: "0.9rem",
        color: "#2d3436",
        borderBottom: "1px solid #f1f3f5",
        verticalAlign: "middle" as const,
    },
    statusBadge: (status: string) => ({
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "0.75rem",
        fontWeight: 700,
        textTransform: "uppercase" as const,
        background: status === "completed" ? "#f0fdf4"
            : status === "shipped" ? "#eff6ff"
                : status === "cancelled" ? "#fef2f2"
                    : status === "awaiting_approval" ? "#fef3c7"
                        : "#fffbeb",
        color: status === "completed" ? "#22c55e"
            : status === "shipped" ? "#3b82f6"
                : status === "cancelled" ? "#ef4444"
                    : status === "awaiting_approval" ? "#d97706"
                        : "#f59e0b",
        border: `1px solid ${status === "completed" ? "#bbf7d0"
            : status === "shipped" ? "#dbeafe"
                : status === "cancelled" ? "#fee2e2"
                    : status === "awaiting_approval" ? "#fde68a"
                        : "#fef3c7"
            }`
    }),
    approveBtn: {
        padding: "6px 14px",
        border: "none",
        borderRadius: "6px",
        fontSize: "0.8rem",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.2s ease",
        background: "#f0fdf4",
        color: "#16a34a",
        border2: "1px solid #bbf7d0",
        marginRight: "8px",
    },
    rejectBtn: {
        padding: "6px 14px",
        border: "none",
        borderRadius: "6px",
        fontSize: "0.8rem",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.2s ease",
        background: "#fef2f2",
        color: "#dc2626",
        marginRight: "8px",
    },
    statusUpdateBtn: {
        padding: "6px 14px",
        border: "none",
        borderRadius: "6px",
        fontSize: "0.8rem",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.2s ease",
        background: "#eff6ff",
        color: "#2563eb",
        marginRight: "8px",
    },
    modalOverlay: {
        position: "fixed" as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
    },
    modalContent: {
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "16px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "420px",
    },
    tabBar: {
        display: "flex",
        gap: "8px",
        marginBottom: "24px",
    },
    tab: (active: boolean) => ({
        padding: "8px 16px",
        borderRadius: "8px",
        border: "none",
        fontSize: "0.85rem",
        fontWeight: 600,
        cursor: "pointer",
        background: active ? "#1a1a2e" : "#f1f5f9",
        color: active ? "white" : "#64748b",
        transition: "all 0.2s ease",
    }),
};

type OrderTab = "awaiting" | "active" | "all";

export default function AdminOrdersPage() {
    const { user } = useAuth();
    const allOrders = useQuery(api.orders.getAll);
    const approveOrder = useMutation(api.orders.approveOrder);
    const rejectOrder = useMutation(api.orders.rejectOrder);
    const updateStatus = useMutation(api.orders.updateStatus);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<OrderTab>("awaiting");
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: "approve" | "reject" | "status";
        orderId: string | null;
        orderRef: string;
        newStatus?: string;
    }>({
        isOpen: false,
        type: "approve",
        orderId: null,
        orderRef: "",
    });

    const handleApprove = (orderId: Id<"orders">, orderRef: string) => {
        setConfirmModal({ isOpen: true, type: "approve", orderId, orderRef });
    };

    const handleReject = (orderId: Id<"orders">, orderRef: string) => {
        setConfirmModal({ isOpen: true, type: "reject", orderId, orderRef });
    };

    const handleStatusUpdate = (orderId: Id<"orders">, orderRef: string, newStatus: string) => {
        setConfirmModal({ isOpen: true, type: "status", orderId, orderRef, newStatus });
    };

    const confirmAction = async () => {
        if (!confirmModal.orderId) return;
        setProcessingId(confirmModal.orderId);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
            if (confirmModal.type === "approve") {
                await approveOrder({ orderId: confirmModal.orderId as Id<"orders"> });
            } else if (confirmModal.type === "reject") {
                await rejectOrder({ orderId: confirmModal.orderId as Id<"orders"> });
            } else if (confirmModal.type === "status" && confirmModal.newStatus) {
                await updateStatus({ orderId: confirmModal.orderId as Id<"orders">, status: confirmModal.newStatus as any });
            }
        } catch (error: any) {
            alert(error.message || "Action failed.");
        } finally {
            setProcessingId(null);
        }
    };

    if (!user || allOrders === undefined) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <div style={{ width: 40, height: 40, border: "3px solid #f3f3f3", borderTop: "3px solid #ff6b6b", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const awaitingOrders = allOrders.filter(o => o.status === "awaiting_approval");
    const activeOrders = allOrders.filter(o => ["pending", "processing", "shipped", "delivered"].includes(o.status));
    const displayedOrders = activeTab === "awaiting"
        ? awaitingOrders
        : activeTab === "active"
            ? activeOrders
            : allOrders;

    const getNextStatuses = (currentStatus: string) => {
        const flow: Record<string, string[]> = {
            "pending": ["processing"],
            "processing": ["shipped"],
            "shipped": ["delivered"],
            "delivered": ["completed"],
        };
        return flow[currentStatus] || [];
    };

    return (
        <>
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>Orders</h1>
                    <p style={{ color: "#a0aabf", marginTop: "4px", fontSize: "0.95rem" }}>Track and manage customer orders.</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    {awaitingOrders.length > 0 && (
                        <span style={{ ...S.badge, background: "#fef3c7", color: "#d97706" }}>
                            {awaitingOrders.length} Awaiting Approval
                        </span>
                    )}
                    <span style={S.badge}>{allOrders?.length || 0} Total Orders</span>
                </div>
            </div>

            {/* Tab Bar */}
            <div style={S.tabBar}>
                <button style={S.tab(activeTab === "awaiting")} onClick={() => setActiveTab("awaiting")}>
                    Awaiting Approval {awaitingOrders.length > 0 && `(${awaitingOrders.length})`}
                </button>
                <button style={S.tab(activeTab === "active")} onClick={() => setActiveTab("active")}>
                    Active Orders ({activeOrders.length})
                </button>
                <button style={S.tab(activeTab === "all")} onClick={() => setActiveTab("all")}>
                    All Orders ({allOrders.length})
                </button>
            </div>

            <div style={S.tableContainer}>
                <table style={S.table}>
                    <thead>
                        <tr>
                            <th style={S.th}>Order ID</th>
                            <th style={S.th}>Customer</th>
                            <th style={S.th}>Items</th>
                            <th style={S.th}>Total</th>
                            <th style={S.th}>Status</th>
                            <th style={S.th}>Actions</th>
                            <th style={S.th}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ ...S.td, textAlign: "center", padding: "40px", color: "#a0aabf" }}>
                                    {activeTab === "awaiting" ? "No orders awaiting approval." : "No orders found."}
                                </td>
                            </tr>
                        ) : (
                            displayedOrders.map((order) => (
                                <tr key={order._id} style={order.status === "awaiting_approval" ? { background: "#fffdf7" } : {}}>
                                    <td style={{ ...S.td, fontWeight: 700, color: "#ff6b6b" }}>#{order._id.toString().slice(-8).toUpperCase()}</td>
                                    <td style={S.td}>
                                        <div style={{ fontWeight: 700 }}>{order.shippingAddress.fullName}</div>
                                        <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>{order.shippingAddress.phone}</div>
                                        <div style={{ fontSize: "0.8rem", color: "#a0aabf", maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={`${order.shippingAddress.address}, ${order.shippingAddress.city}`}>
                                            {order.shippingAddress.address}, {order.shippingAddress.city}
                                        </div>
                                    </td>
                                    <td style={S.td}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            {order.items.map((item, i) => (
                                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div style={{ width: "32px", height: "32px", background: "#f1f3f5", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                        ) : (
                                                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🎮</div>
                                                        )}
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontSize: "0.8rem", fontWeight: 600, maxWidth: 150, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={item.name}>{item.name}</div>
                                                        <div style={{ fontSize: "0.75rem", color: "#a0aabf" }}>Qty: {item.quantity}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={S.td}>
                                        <strong style={{ color: "#ff6b6b", fontSize: "1rem" }}>{formatPrice(order.totalAmount)}</strong>
                                    </td>
                                    <td style={S.td}>
                                        {processingId === order._id ? (
                                            <span style={{ fontSize: "0.8rem", color: "#a0aabf" }}>Updating...</span>
                                        ) : (
                                            <span style={S.statusBadge(order.status || "pending")}>
                                                {order.status === "awaiting_approval" ? "Awaiting Approval" : order.status || "pending"}
                                            </span>
                                        )}
                                    </td>
                                    <td style={S.td}>
                                        {processingId === order._id ? (
                                            <span style={{ fontSize: "0.8rem", color: "#a0aabf" }}>Processing...</span>
                                        ) : order.status === "awaiting_approval" ? (
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                <button
                                                    onClick={() => handleApprove(order._id, order._id.toString().slice(-8).toUpperCase())}
                                                    style={S.approveBtn}
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(order._id, order._id.toString().slice(-8).toUpperCase())}
                                                    style={S.rejectBtn}
                                                >
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        ) : (order.status === "completed" || order.status === "cancelled") ? (
                                            <span style={{ fontSize: "0.8rem", color: "#a0aabf", fontWeight: 600 }}>—</span>
                                        ) : (
                                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                {getNextStatuses(order.status).map(nextStatus => (
                                                    <button
                                                        key={nextStatus}
                                                        onClick={() => handleStatusUpdate(order._id, order._id.toString().slice(-8).toUpperCase(), nextStatus)}
                                                        style={S.statusUpdateBtn}
                                                    >
                                                        → {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => handleStatusUpdate(order._id, order._id.toString().slice(-8).toUpperCase(), "cancelled")}
                                                    style={S.rejectBtn}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td style={S.td}>{new Date(order._creationTime).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Confirm Action Modal */}
            {confirmModal.isOpen && (
                <div style={S.modalOverlay} onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}>
                    <div style={S.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={{ textAlign: "center", marginBottom: "24px" }}>
                            <div style={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "50%",
                                background: confirmModal.type === "approve" ? "#f0fdf4" : confirmModal.type === "reject" ? "#fef2f2" : "#eff6ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 16px",
                                fontSize: "1.5rem"
                            }}>
                                {confirmModal.type === "approve" ? "✓" : confirmModal.type === "reject" ? "✕" : "→"}
                            </div>
                            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", fontWeight: 700, color: "#1a1a2e" }}>
                                {confirmModal.type === "approve" ? "Approve Order?" :
                                    confirmModal.type === "reject" ? "Reject Order?" :
                                        `Update to ${confirmModal.newStatus?.charAt(0).toUpperCase()}${confirmModal.newStatus?.slice(1)}?`}
                            </h3>
                            <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: 1.6 }}>
                                {confirmModal.type === "approve"
                                    ? `Approve order #${confirmModal.orderRef}? Stock will be deducted and the order will proceed to processing.`
                                    : confirmModal.type === "reject"
                                        ? `Reject order #${confirmModal.orderRef}? This will cancel the order. No stock will be affected.`
                                        : `Update order #${confirmModal.orderRef} status to "${confirmModal.newStatus}"?`
                                }
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    background: "#f1f5f9",
                                    color: "#64748b",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    background: confirmModal.type === "approve" ? "#16a34a" : confirmModal.type === "reject" ? "#dc2626" : "#2563eb",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                {confirmModal.type === "approve" ? "Yes, Approve" :
                                    confirmModal.type === "reject" ? "Yes, Reject" : "Yes, Update"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
