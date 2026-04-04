"use client";

import { useAuth } from "../AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

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
        position: "sticky" as const,
        top: 0,
        height: "100vh",
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
        textDecoration: "none",
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // Allow the login page to render without auth
    const isLoginPage = pathname === "/admin/login";

    useEffect(() => {
        if (mounted && !isLoginPage && (!user || !isAdmin)) {
            router.push("/admin/login");
        }
    }, [mounted, user, isAdmin, router, isLoginPage]);

    // Login page should render without the admin sidebar layout
    if (isLoginPage) {
        return <>{children}</>;
    }

    if (!mounted || !user || !isAdmin) {
        return (
            <>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={S.loading}><div style={S.spinner} /></div>
            </>
        );
    }

    const isActive = (path: string) => pathname === path;

    return (
        <div style={S.container}>
            <aside style={S.sidebar}>
                <div style={{ textDecoration: "none" }}>
                    <h2 style={S.sidebarTitle}>TitanAdmin</h2>
                </div>

                <nav style={{ display: "flex", flexDirection: "column" }}>
                    <Link href="/admin" style={isActive("/admin") ? S.navItemActive : S.navItem}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                        Dashboard
                    </Link>
                    <Link href="/admin/orders" style={isActive("/admin/orders") ? S.navItemActive : S.navItem}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                        Orders
                    </Link>
                    <Link href="/admin/products" style={pathname.startsWith("/admin/products") ? S.navItemActive : S.navItem}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 2L3 6v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        Products
                    </Link>
                    <Link href="/admin/users" style={isActive("/admin/users") ? S.navItemActive : S.navItem}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Users
                    </Link>
                </nav>

                <div style={S.sidebarFooter}>
                    <div style={S.userInfo}>
                        <div style={S.avatar}>{user.name.charAt(0).toUpperCase()}</div>
                        <div style={{ minWidth: 0 }}>
                            <div style={S.userName}>{user.name}</div>
                            <div style={{ ...S.userEmail, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
                        </div>
                    </div>
                    <button style={S.logoutBtn} onClick={() => { logout(); router.push("/admin/login"); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Sign Out
                    </button>
                </div>
            </aside>
            <main style={{ flex: 1, padding: "40px 50px", overflowY: "auto" }}>
                {children}
            </main>
        </div>
    );
}
