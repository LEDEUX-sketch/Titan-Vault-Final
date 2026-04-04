"use client";

import { ConvexError } from "convex/values";
import { useState, useEffect, FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../AuthContext";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { user, setUser } = useAuth();
    const signIn = useMutation(api.auth.signIn);
    const router = useRouter();

    // If already logged in as admin, redirect to dashboard
    useEffect(() => {
        if (user && user.role === "admin") {
            router.push("/admin");
        }
    }, [user, router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn({ email, password });

            if ((result.role ?? "user") !== "admin") {
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

            router.push("/admin");
        } catch (err: unknown) {
            let cleanMsg = "Something went wrong.";
            if (err instanceof ConvexError) {
                cleanMsg = typeof err.data === "string" ? err.data : "An error occurred.";
            } else if (err instanceof Error) {
                cleanMsg = err.message
                    .replace(/^\[Request ID:.*?\]\s*/i, "")
                    .replace(/^(Server\s+Error\s+)?Uncaught\s+Error:\s*/i, "")
                    .replace(/^\[.*?\]\s*/, "")
                    .split("\n")[0]
                    .split(" at ")[0]
                    .trim();
            }

            if (cleanMsg.toLowerCase().includes("suspended") || cleanMsg.toLowerCase().includes("banned")) {
                setError(cleanMsg);
            } else {
                setError("Invalid admin credentials. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={S.page}>
            <div style={S.container}>
                <div style={S.formContainer}>
                    <div style={S.lockIcon}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                    </div>
                    <h2 style={S.formTitle}>Admin Login</h2>
                    <p style={S.formSubtitle}>Enter your credentials to access the dashboard</p>

                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div style={S.inputGroup}>
                            <label style={S.label}>Email Address</label>
                            <div style={S.inputWrapper}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a0aabf" strokeWidth="2" style={S.inputIcon}>
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <input
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="off"
                                    required
                                    style={S.input}
                                />
                            </div>
                        </div>

                        <div style={S.inputGroup}>
                            <label style={S.label}>Password</label>
                            <div style={S.inputWrapper}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a0aabf" strokeWidth="2" style={S.inputIcon}>
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    style={S.input}
                                />
                            </div>
                        </div>

                        {error && (
                            <div style={S.errorBox}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <button type="submit" style={{
                            ...S.submitBtn,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1,
                        }} disabled={loading}>
                            {loading ? (
                                <>
                                    <div style={S.btnSpinner} />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                                        <polyline points="10,17 15,12 10,7" />
                                        <line x1="15" y1="12" x2="3" y2="12" />
                                    </svg>
                                    Login to Dashboard
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

const S: { [key: string]: React.CSSProperties } = {
    page: {
        minHeight: "100vh",
        background: "#0f0f1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-primary)",
        padding: "20px",
    },
    container: {
        width: "100%",
        maxWidth: "440px",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
        animation: "fadeIn 0.5s ease-out",
        background: "#ffffff",
        padding: "50px 40px",
    },
    formContainer: {
        maxWidth: "360px",
        margin: "0 auto",
        width: "100%",
    },
    lockIcon: {
        width: "56px",
        height: "56px",
        borderRadius: "16px",
        background: "#fff5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "24px",
    },
    formTitle: {
        fontSize: "1.6rem",
        fontWeight: 800,
        color: "#1a1a2e",
        marginBottom: "8px",
    },
    formSubtitle: {
        fontSize: "0.9rem",
        color: "#a0aabf",
        marginBottom: "32px",
    },
    inputGroup: {
        marginBottom: "20px",
    },
    label: {
        display: "block",
        fontSize: "0.85rem",
        fontWeight: 600,
        color: "#4a5568",
        marginBottom: "8px",
    },
    inputWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    inputIcon: {
        position: "absolute",
        left: "14px",
        pointerEvents: "none",
    },
    input: {
        width: "100%",
        padding: "13px 14px 13px 44px",
        borderRadius: "10px",
        border: "1.5px solid #e2e8f0",
        fontSize: "0.95rem",
        outline: "none",
        transition: "all 0.2s ease",
        background: "#fafbfc",
        color: "#1a1a2e",
        fontFamily: "inherit",
    },
    errorBox: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 14px",
        background: "#fef2f2",
        border: "1px solid #fee2e2",
        borderRadius: "10px",
        fontSize: "0.85rem",
        color: "#ef4444",
        fontWeight: 500,
        marginBottom: "20px",
    },
    submitBtn: {
        width: "100%",
        padding: "14px",
        background: "linear-gradient(135deg, #1a1a2e, #16213e)",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        fontSize: "0.95rem",
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        transition: "all 0.2s ease",
        letterSpacing: "0.3px",
    },
    btnSpinner: {
        width: "18px",
        height: "18px",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
};
