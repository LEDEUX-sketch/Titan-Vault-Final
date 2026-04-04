"use client";

import { useAuth } from "../AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";

/* ——— inline style objects ——— */
const S = {
    container: {
        display: "flex",
        minHeight: "100vh",
        background: "#f8f9fa",
        fontFamily: "var(--font-primary)",
    },
    sidebar: {
        width: "260px",
        background: "#1a1a2e",
        color: "white",
        padding: "30px 20px",
        display: "flex",
        flexDirection: "column" as const,
    },
    sidebarTitle: {
        fontSize: "1.5rem",
        fontWeight: 800,
        letterSpacing: "1px",
        marginBottom: "40px",
        background: "linear-gradient(90deg, #ff6b6b, #feca57)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        display: "inline-block",
    },
    navItem: {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        borderRadius: "10px",
        color: "#a0aabf",
        textDecoration: "none",
        fontSize: "0.95rem",
        fontWeight: 600,
        marginBottom: "8px",
        transition: "all 0.2s ease",
        gap: "12px"
    },
    navItemActive: {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        borderRadius: "10px",
        background: "linear-gradient(90deg, rgba(255,107,107,0.1), transparent)",
        color: "white",
        borderLeft: "4px solid #ff6b6b",
        textDecoration: "none",
        fontSize: "0.95rem",
        fontWeight: 600,
        marginBottom: "8px",
        gap: "12px"
    },
    sidebarFooter: {
        paddingTop: "20px",
        marginTop: "auto",
        borderTop: "1px solid rgba(160,170,191,0.1)",
    },
    userInfo: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
    },
    avatar: {
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #ff6b6b, #ff8e8e)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        color: "white",
        fontSize: "0.9rem",
    },
    userName: {
        fontSize: "0.85rem",
        fontWeight: 600,
        color: "white",
    },
    userEmail: {
        fontSize: "0.75rem",
        color: "#a0aabf",
    },
    logoutBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        padding: "10px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        color: "#ff6b6b",
        fontSize: "0.85rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    main: {
        flex: 1,
        padding: "40px 50px",
        overflowY: "auto" as const,
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "40px",
    },
    title: {
        fontSize: "2rem",
        fontWeight: 800,
        color: "#1a1a2e",
        margin: 0,
    },
    subtitle: {
        fontSize: "1rem",
        color: "#a0aabf",
        marginTop: "4px",
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "20px",
        marginBottom: "40px",
    },
    statCard: {
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
    statIcon: (bg: string, color: string) => ({
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        background: bg,
        color: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }),
    statLabel: {
        display: "block",
        fontSize: "0.8rem",
        color: "#a0aabf",
        fontWeight: 600,
        marginBottom: "4px",
    },
    statValue: {
        display: "block",
        fontSize: "1.25rem",
        fontWeight: 800,
        color: "#1a1a2e",
    },
    sectionTitle: {
        fontSize: "1.25rem",
        fontWeight: 700,
        color: "#1a1a2e",
        marginBottom: "20px",
    },
    actionsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
    },
    actionCard: {
        background: "white",
        borderRadius: "16px",
        padding: "30px 24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        textDecoration: "none",
        color: "#1a1a2e",
        transition: "all 0.2s ease",
        display: "block",
    },
    actionCardH3: {
        fontSize: "1.1rem",
        fontWeight: 700,
        margin: "16px 0 8px 0",
    },
    actionCardP: {
        fontSize: "0.85rem",
        color: "#a0aabf",
        margin: 0,
        lineHeight: 1.5,
    },
    loading: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f8f9fa"
    },
    spinner: {
        width: "40px",
        height: "40px",
        border: "3px solid #f1f3f5",
        borderTopColor: "#ff6b6b",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
    }
};

export default function AdminDashboard() {
    const { user } = useAuth();
    const allUsers = useQuery(api.users.listAll);
    const allProducts = useQuery(api.products.list, { limit: 1000 });

    if (!user || !allUsers || !allProducts) {
        return (
            <>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={S.loading}><div style={S.spinner} /></div>
            </>
        );
    }

    const totalUsers = allUsers?.filter((u) => u.role !== "admin").length ?? 0;
    const activeUsers = allUsers?.filter((u) => u.role !== "admin" && u.status === "active").length ?? 0;
    const bannedUsers = allUsers?.filter((u) => u.status === "banned").length ?? 0;
    const suspendedUsers = allUsers?.filter((u) => u.status === "suspended").length ?? 0;
    const totalProducts = allProducts?.length ?? 0;

    const stats = [
        { label: "Total Users", value: totalUsers, bg: "#eff6ff", color: "#3b82f6", icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />, icon2: <circle cx="9" cy="7" r="4" /> },
        { label: "Active", value: activeUsers, bg: "#f0fdf4", color: "#22c55e", icon: <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />, icon2: <polyline points="22 4 12 14.01 9 11.01" /> },
        { label: "Banned", value: bannedUsers, bg: "#fef2f2", color: "#ef4444", icon: <circle cx="12" cy="12" r="10" />, icon2: <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /> },
        { label: "Suspended", value: suspendedUsers, bg: "#fffbeb", color: "#f59e0b", icon: <circle cx="12" cy="12" r="10" />, icon2: <><line x1="10" y1="15" x2="10" y2="9" /><line x1="14" y1="15" x2="14" y2="9" /></> },
        { label: "Products", value: totalProducts, bg: "#f5f3ff", color: "#8b5cf6", icon: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />, icon2: <><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></> },
    ];

    return (
        <>
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>Dashboard</h1>
                    <p style={S.subtitle}>Welcome back, {user.name}. Here's an overview of your store.</p>
                </div>
            </div>

            {/* Stats */}
            <div style={S.statsGrid}>
                {stats.map((s) => (
                    <div key={s.label} style={S.statCard}>
                        <div style={S.statIcon(s.bg, s.color)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{s.icon}{s.icon2}</svg>
                        </div>
                        <div>
                            <span style={S.statLabel}>{s.label}</span>
                            <span style={S.statValue}>{s.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <h2 style={S.sectionTitle}>Quick Actions</h2>
            <div style={{ ...S.actionsGrid, gridTemplateColumns: "repeat(3, 1fr)" }}>
                <Link href="/admin/users" style={S.actionCard}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    <h3 style={S.actionCardH3}>Manage Users</h3>
                    <p style={S.actionCardP}>View, ban, suspend, and manage customer accounts.</p>
                </Link>
                <Link href="/admin/products" style={S.actionCard}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                    <h3 style={S.actionCardH3}>Manage Products</h3>
                    <p style={S.actionCardP}>View and manage your store inventory.</p>
                </Link>
                <Link href="/admin/orders" style={S.actionCard}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    <h3 style={S.actionCardH3}>View Orders</h3>
                    <p style={S.actionCardP}>Track and manage all customer order checkouts.</p>
                </Link>
            </div>
        </>
    );
}
