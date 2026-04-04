"use client";

import { ConvexError } from "convex/values";

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
    const [mode, setMode] = useState<"signin" | "register">("signin");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [province, setProvince] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { setUser } = useAuth();
    const signIn = useMutation(api.auth.signIn);
    const register = useMutation(api.auth.register);
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
                if (!phone.trim() || !address.trim() || !city.trim() || !province.trim() || !zipCode.trim()) {
                    setError("All fields are required.");
                    setLoading(false);
                    return;
                }
                const result = await register({ email, password, name, phone, address, city, province, zipCode });
                setUser({
                    userId: result.userId,
                    name: result.name,
                    email: result.email,
                    role: result.role ?? "user",
                    status: result.status ?? "active",
                });
            } else {
                const result = await signIn({ email, password });

                setUser({
                    userId: result.userId,
                    name: result.name,
                    email: result.email,
                    role: result.role ?? "user",
                    status: result.status ?? "active",
                });

                // If admin signs in via regular modal, redirect to dashboard
                if ((result.role ?? "user") === "admin") {
                    onClose();
                    router.push("/admin");
                    return;
                }
            }
            onClose();
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

            if (mode === "signin") {
                if (cleanMsg.toLowerCase().includes("suspended") || cleanMsg.toLowerCase().includes("banned")) {
                    setError(cleanMsg);
                } else {
                    setError("Invalid email or password. Please try again.");
                }
            } else {
                setError(cleanMsg);
            }
        } finally {
            setLoading(false);
        }
    };


    const switchMode = (newMode: "signin" | "register") => {
        setMode(newMode);
        setError("");
        setEmail("");
        setPassword("");
        setName("");
        setPhone("");
        setAddress("");
        setCity("");
        setProvince("");
        setZipCode("");
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ position: "relative", maxHeight: "90vh", overflowY: "auto" }}
            >
                <button className="modal-close" onClick={onClose}>
                    ×
                </button>

                <h2>
                    {mode === "signin"
                        ? "Welcome Back!"
                        : "Create Account"}
                </h2>
                <p className="subtitle">
                    {mode === "signin"
                        ? "Sign in to access your TitanVault account"
                        : "Join TitanVault to start collecting"}
                </p>

                {/* ===== Tab Bar ===== */}
                <div style={tabBarStyle}>
                    <button style={tabStyle(mode === "signin")} onClick={() => switchMode("signin")}>
                        Sign In
                    </button>
                    <button style={tabStyle(mode === "register")} onClick={() => switchMode("register")}>
                        Register
                    </button>
                </div>

                {/* ===== Sign In / Register Forms ===== */}
                <form onSubmit={handleSubmit}>
                    {mode === "register" && (
                        <>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Juan Dela Cruz"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="09123456789"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Exact Address</label>
                                <input
                                    type="text"
                                    placeholder="House No., Street Name, Barangay"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>City</label>
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Province</label>
                                    <input
                                        type="text"
                                        placeholder="Province"
                                        value={province}
                                        onChange={(e) => setProvince(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Zip Code</label>
                                <input
                                    type="text"
                                    placeholder="Zip Code"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                />
                            </div>
                        </>
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
            </div>
        </div>
    );
}
