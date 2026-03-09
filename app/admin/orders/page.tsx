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
        minWidth: "1000px",
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
        background: status === "completed" ? "#f0fdf4" : status === "shipped" ? "#eff6ff" : status === "cancelled" ? "#fef2f2" : "#fffbeb",
        color: status === "completed" ? "#22c55e" : status === "shipped" ? "#3b82f6" : status === "cancelled" ? "#ef4444" : "#f59e0b",
        border: `1px solid ${status === "completed" ? "#bbf7d0" : status === "shipped" ? "#dbeafe" : status === "cancelled" ? "#fee2e2" : "#fef3c7"}`
    }),
    select: {
        padding: "6px 10px",
        borderRadius: "6px",
        border: "1px solid #e2e8f0",
        fontSize: "0.85rem",
        background: "white",
        cursor: "pointer",
        outline: "none",
    }
};

export default function AdminOrdersPage() {
    const { user } = useAuth();
    const allOrders = useQuery(api.orders.getAll);
    const updateStatus = useMutation(api.orders.updateStatus);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleStatusChange = async (orderId: Id<"orders">, newStatus: any) => {
        setUpdatingId(orderId);
        try {
            await updateStatus({ orderId, status: newStatus });
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status.");
        } finally {
            setUpdatingId(null);
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

    return (
        <>
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>Orders</h1>
                    <p style={{ color: "#a0aabf", marginTop: "4px", fontSize: "0.95rem" }}>Track and manage customer orders.</p>
                </div>
                <span style={S.badge}>{allOrders?.length || 0} Total Orders</span>
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
                        {allOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ ...S.td, textAlign: "center", padding: "40px", color: "#a0aabf" }}>No orders found.</td>
                            </tr>
                        ) : (
                            allOrders.map((order) => (
                                <tr key={order._id}>
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
                                        {updatingId === order._id ? (
                                            <span style={{ fontSize: "0.8rem", color: "#a0aabf" }}>Updating...</span>
                                        ) : (
                                            <span style={S.statusBadge(order.status || "pending")}>{order.status || "pending"}</span>
                                        )}
                                    </td>
                                    <td style={S.td}>
                                        <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>Customer Managed</div>
                                    </td>
                                    <td style={S.td}>{new Date(order._creationTime).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
