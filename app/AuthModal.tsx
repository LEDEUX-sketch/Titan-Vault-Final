"use client";

import { useState, FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";

export default function AuthModal({
    onClose,
}: {
    onClose: () => void;
}) {
    const [mode, setMode] = useState<"signin" | "register" | "admin">("signin");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { setUser } = useAuth();
    const signIn = useMutation(api.auth.signIn);
    const register = useMutation(api.auth.register);
    const adminLogin = useMutation(api.auth.adminLogin);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (mode === "register") {
                if (!name.trim()) {
                    setError("Name is required.");
                    setLoading(false);
                    return;
                }
                const result = await register({ email, password, name });
                setUser({
                    userId: result.userId,
                    name: result.name,
                    email: result.email,
                    role: result.role ?? "user",
                    status: result.status ?? "active",
                });
            } else {
                const result = await signIn({ email, password });

                // If on Admin tab, verify user is actually an admin
                if (mode === "admin" && (result.role ?? "user") !== "admin") {
                    setError("This account does not have administrator privileges.");
                    setLoading(false);
                    return;
                }

                setUser({
                    userId: result.userId,
                    name: result.name,
                    email: result.email,
                    role: result.role ?? "user",
                    status: result.status ?? "active",
                });

                if ((result.role ?? "user") === "admin") {
                    onClose();
                    router.push("/admin");
                    return;
                }
            }
            onClose();
        } catch (err: unknown) {
            if (mode === "signin" || mode === "admin") {
                setError("Invalid email or password. Please try again.");
            } else {
                const msg = err instanceof Error ? err.message : "Something went wrong.";
                // Clean up prefixes like [ConvexError] or [Server Error]
                setError(msg.replace(/^\[.*?\]\s*/, ""));
            }
        } finally {
            setLoading(false);
        }
    };


    const switchMode = (newMode: "signin" | "register" | "admin") => {
        setMode(newMode);
        setError("");
        setEmail("");
        setPassword("");
        setName("");
    };

    /* ——— Inline styles for the mode tabs ——— */
    const tabBarStyle: React.CSSProperties = {
        display: "flex",
        gap: 0,
        marginBottom: 24,
        background: "#f3f4f6",
        borderRadius: 10,
        padding: 4,
    };

    const tabStyle = (active: boolean): React.CSSProperties => ({
        flex: 1,
        padding: "10px 0",
        border: "none",
        borderRadius: 8,
        fontSize: "0.85rem",
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        background: active ? "#fff" : "transparent",
        color: active ? "#222" : "#757575",
        boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
        transition: "all 0.15s ease",
        textAlign: "center" as const,
    });

    const adminInfoStyle: React.CSSProperties = {
        background: "linear-gradient(135deg, #f8f9fa, #eef1f5)",
        borderRadius: 10,
        padding: "20px",
        marginBottom: 20,
        border: "1px solid #e2e5ea",
    };

    const adminInfoTitle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: "0.9rem",
        fontWeight: 600,
        color: "#1a1a2e",
        marginBottom: 14,
    };

    const credentialRow: React.CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 12px",
        background: "#fff",
        borderRadius: 6,
        marginBottom: 6,
        fontSize: "0.85rem",
        border: "1px solid #e8e8e8",
    };

    const credentialLabel: React.CSSProperties = {
        color: "#757575",
        fontWeight: 500,
    };

    const credentialValue: React.CSSProperties = {
        color: "#222",
        fontWeight: 600,
        fontFamily: "monospace",
    };

    const adminBtnStyle: React.CSSProperties = {
        width: "100%",
        padding: "13px",
        background: "linear-gradient(135deg, #1a1a2e, #16213e)",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        fontSize: "0.92rem",
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "all 0.15s ease",
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ position: "relative" }}
            >
                <button className="modal-close" onClick={onClose}>
                    ×
                </button>

                <h2>
                    {mode === "signin"
                        ? "Welcome Back!"
                        : mode === "register"
                            ? "Create Account"
                            : "Admin Login"}
                </h2>
                <p className="subtitle">
                    {mode === "signin"
                        ? "Sign in to access your TitanVault account"
                        : mode === "register"
                            ? "Join TitanVault to start collecting"
                            : "Sign in with administrator credentials"}
                </p>

                {/* ===== Tab Bar ===== */}
                <div style={tabBarStyle}>
                    <button style={tabStyle(mode === "signin")} onClick={() => switchMode("signin")}>
                        Sign In
                    </button>
                    <button style={tabStyle(mode === "register")} onClick={() => switchMode("register")}>
                        Register
                    </button>
                    <button style={tabStyle(mode === "admin")} onClick={() => switchMode("admin")}>
                        Admin
                    </button>
                </div>

                {/* ===== Sign In / Register Forms ===== */}
                {(mode === "signin" || mode === "register") && (
                    <form onSubmit={handleSubmit}>
                        {mode === "register" && (
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Juan Dela Cruz"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="you@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="form-error">{error}</p>}

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading
                                ? "Please wait..."
                                : mode === "signin"
                                    ? "Sign In"
                                    : "Create Account"}
                        </button>
                    </form>
                )}

                {/* ===== Admin Login Form ===== */}
                {mode === "admin" && (
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="form-group">
                            <label>Admin Email</label>
                            <input
                                type="email"
                                placeholder="Enter admin email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="off"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Admin Password</label>
                            <input
                                type="password"
                                placeholder="Enter admin password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        {error && <p className="form-error">{error}</p>}

                        <button type="submit" style={adminBtnStyle} disabled={loading}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                                <polyline points="10,17 15,12 10,7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                            {loading ? "Logging in..." : "Login as Admin"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
