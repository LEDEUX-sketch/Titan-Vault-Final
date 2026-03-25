"use client";

import { useAuth } from "../../AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
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
    badge: {
        background: "rgba(255,107,107,0.1)",
        color: "#ff6b6b",
        padding: "6px 16px",
        borderRadius: "20px",
        fontSize: "0.85rem",
        fontWeight: 600,
    },
    tableContainer: {
        background: "white",
        borderRadius: "16px",
        padding: "20px 24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse" as const,
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
    avatarSm: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #ff6b6b, #ff8e8e)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: "0.75rem",
    },
    statusBadge: (status: string) => {
        const colors: Record<string, { bg: string; color: string; border: string }> = {
            active: { bg: "#f0fdf4", color: "#22c55e", border: "#bbf7d0" },
            banned: { bg: "#fef2f2", color: "#ef4444", border: "#fecaca" },
            suspended: { bg: "#fffbeb", color: "#f59e0b", border: "#fef3c7" },
        };
        const c = colors[status] || colors.active;
        return {
            display: "inline-block",
            padding: "4px 10px",
            borderRadius: 12,
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase" as const,
            background: c.bg,
            color: c.color,
            border: `1px solid ${c.border}`
        };
    },
    actionBtn: (type: string) => {
        const colors: Record<string, { bg: string; color: string }> = {
            ban: { bg: "#fef2f2", color: "#ef4444" },
            suspend: { bg: "#fffbeb", color: "#f59e0b" },
            unban: { bg: "#f0fdf4", color: "#22c55e" },
            reactivate: { bg: "#f0fdf4", color: "#22c55e" },
        };
        const c = colors[type] || colors.ban;
        return {
            padding: "6px 12px",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginRight: "8px",
            background: c.bg,
            color: c.color,
        };
    },
    message: (type: "success" | "error") => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderRadius: "12px",
        marginBottom: "24px",
        fontSize: "0.9rem",
        fontWeight: 500,
        background: type === "success" ? "#f0fdf4" : "#fef2f2",
        color: type === "success" ? "#166534" : "#991b1b",
        border: `1px solid ${type === "success" ? "#bbf7d0" : "#fecaca"}`,
    }),
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

export default function AdminUsersPage() {
    const { user } = useAuth();
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [suspendModal, setSuspendModal] = useState<{ open: boolean; userId: string; userName: string }>({ open: false, userId: "", userName: "" });
    const [suspendDuration, setSuspendDuration] = useState<string>("24");
    const [customDuration, setCustomDuration] = useState<string>("");

    const allUsers = useQuery(api.users.listAll);
    const banUser = useMutation(api.users.banUser);
    const unbanUser = useMutation(api.users.unbanUser);
    const suspendUser = useMutation(api.users.suspendUser);
    const reactivateUser = useMutation(api.users.reactivateUser);

    const handleAction = async (action: "ban" | "unban" | "suspend" | "reactivate", userId: string, durationHours?: number) => {
        setActionLoading(userId + action);
        setMessage(null);
        try {
            const id = userId as Id<"users">;
            if (action === "ban") await banUser({ userId: id });
            else if (action === "unban") await unbanUser({ userId: id });
            else if (action === "suspend") await suspendUser({ userId: id, durationHours });
            else if (action === "reactivate") await reactivateUser({ userId: id });
            setMessage({ type: "success", text: `User ${action}${action.endsWith("e") ? "d" : "ned"} successfully.` });
        } catch (err: unknown) {
            setMessage({ type: "error", text: err instanceof Error ? err.message : "Action failed." });
        } finally { setActionLoading(null); }
    };

    const handleSuspendSubmit = () => {
        const hours = suspendDuration === "custom" ? parseFloat(customDuration) : parseFloat(suspendDuration);
        if (isNaN(hours) || hours <= 0) {
            setMessage({ type: "error", text: "Please enter a valid duration." });
            return;
        }
        setSuspendModal({ open: false, userId: "", userName: "" });
        handleAction("suspend", suspendModal.userId, hours);
    };

    const formatRemaining = (until: number) => {
        const diff = until - Date.now();
        if (diff <= 0) return "Expired";
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (d > 0) return `${d}d ${h}h left`;
        if (h > 0) return `${h}h ${m}m left`;
        return `${m}m left`;
    };

    if (!user || allUsers === undefined) {
        return (
            <>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={S.loading}><div style={S.spinner} /></div>
            </>
        );
    }

    const regularUsers = allUsers?.filter((u) => u.role !== "admin") ?? [];

    return (
        <>
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>User Management</h1>
                    <p style={S.subtitle}>View and manage all registered users.</p>
                </div>
                <span style={S.badge}>{regularUsers.length} Users</span>
            </div>

            {message && (
                <div style={S.message(message.type)}>
                    {message.text}
                    <button style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "inherit" }} onClick={() => setMessage(null)}>×</button>
                </div>
            )}

            <div style={S.tableContainer}>
                <table style={S.table}>
                    <thead>
                        <tr>
                            <th style={S.th}>Name</th>
                            <th style={S.th}>Email</th>
                            <th style={S.th}>Status</th>
                            <th style={S.th}>Joined</th>
                            <th style={{ ...S.th, textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {regularUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ ...S.td, textAlign: "center", padding: "40px", color: "#a0aabf" }}>
                                    No registered users yet.
                                </td>
                            </tr>
                        ) : (
                            regularUsers.map((u) => (
                                <tr key={u._id}>
                                    <td style={S.td}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <div style={S.avatarSm}>{u.name.charAt(0).toUpperCase()}</div>
                                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td style={S.td}>{u.email}</td>
                                    <td style={S.td}>
                                        <span style={S.statusBadge(u.status)}>{u.status}</span>
                                        {u.status === "suspended" && u.suspendedUntil && (
                                            <div style={{ fontSize: "0.7rem", color: "#f59e0b", marginTop: 4, fontWeight: 500 }}>
                                                ⏱ {formatRemaining(u.suspendedUntil)}
                                            </div>
                                        )}
                                    </td>
                                    <td style={S.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td style={{ ...S.td, textAlign: "right" }}>
                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                            {u.status === "active" && (
                                                <>
                                                    <button style={S.actionBtn("ban")} onClick={() => handleAction("ban", u._id)} disabled={actionLoading === u._id + "ban"}>
                                                        {actionLoading === u._id + "ban" ? "..." : "Ban"}
                                                    </button>
                                                    <button style={S.actionBtn("suspend")} onClick={() => { setSuspendDuration("24"); setCustomDuration(""); setSuspendModal({ open: true, userId: u._id, userName: u.name }); }} disabled={actionLoading === u._id + "suspend"}>
                                                        {actionLoading === u._id + "suspend" ? "..." : "Suspend"}
                                                    </button>
                                                </>
                                            )}
                                            {u.status === "banned" && (
                                                <button style={S.actionBtn("unban")} onClick={() => handleAction("unban", u._id)} disabled={actionLoading === u._id + "unban"}>
                                                    {actionLoading === u._id + "unban" ? "..." : "Unban"}
                                                </button>
                                            )}
                                            {u.status === "suspended" && (
                                                <button style={S.actionBtn("reactivate")} onClick={() => handleAction("reactivate", u._id)} disabled={actionLoading === u._id + "reactivate"}>
                                                    {actionLoading === u._id + "reactivate" ? "..." : "Reactivate"}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ─── Suspension Duration Modal ─── */}
            {suspendModal.open && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSuspendModal({ open: false, userId: "", userName: "" })}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: "32px", width: "90%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>Suspend User</h3>
                        <p style={{ fontSize: "0.88rem", color: "#a0aabf", marginBottom: 20 }}>Set suspension duration for <strong style={{ color: "#2d3436" }}>{suspendModal.userName}</strong></p>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
                            {[
                                { label: "1 Hour", value: "1" },
                                { label: "6 Hours", value: "6" },
                                { label: "12 Hours", value: "12" },
                                { label: "24 Hours", value: "24" },
                                { label: "3 Days", value: "72" },
                                { label: "7 Days", value: "168" },
                                { label: "30 Days", value: "720" },
                                { label: "Custom", value: "custom" },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setSuspendDuration(opt.value)}
                                    style={{
                                        padding: "10px 8px",
                                        borderRadius: 8,
                                        border: `2px solid ${suspendDuration === opt.value ? "#f59e0b" : "#f1f3f5"}`,
                                        background: suspendDuration === opt.value ? "#fffbeb" : "#fff",
                                        color: suspendDuration === opt.value ? "#f59e0b" : "#555",
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {suspendDuration === "custom" && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Duration in hours:</label>
                                <input
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    value={customDuration}
                                    onChange={(e) => setCustomDuration(e.target.value)}
                                    placeholder="e.g. 48"
                                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #f1f3f5", fontSize: "0.92rem", outline: "none", boxSizing: "border-box" }}
                                    autoFocus
                                />
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                            <button
                                onClick={() => setSuspendModal({ open: false, userId: "", userName: "" })}
                                style={{ flex: 1, padding: "11px", borderRadius: 8, border: "1px solid #f1f3f5", background: "#f8f9fa", color: "#555", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSuspendSubmit}
                                style={{ flex: 1, padding: "11px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#fff", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" }}
                            >
                                ⏱ Suspend
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
