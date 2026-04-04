"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import AuthModal from "./AuthModal";
import Link from "next/link";

const CATEGORIES = [
    { key: null, label: "All" },
    { key: "action-figures", label: "Action Figures" },
    { key: "statues", label: "Statues" },
    { key: "model-kits", label: "Model Kits" },
    { key: "diecast", label: "Die-Cast" },
    { key: "plush-collectibles", label: "Plush & Collectibles" },
];

export default function Header({
    searchTerm,
    onSearch,
    activeCategory,
    onCategoryChange,
}: {
    searchTerm: string;
    onSearch: (term: string) => void;
    activeCategory: string | null;
    onCategoryChange: (cat: string | null) => void;
}) {
    const { user, logout } = useAuth();
    const [showAuth, setShowAuth] = useState(false);

    const cartCount = useQuery(
        api.cart.getCount,
        user ? { userId: user.userId as Id<"users"> } : "skip"
    );

    return (
        <>
            <header className="header">
                <div className="header-top">
                    <Link href="/" className="header-logo">
                        <svg viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.2)" />
                            <path
                                d="M8 22V10l8-4 8 4v12l-8 4-8-4z"
                                stroke="white"
                                strokeWidth="1.5"
                                fill="none"
                            />
                            <path
                                d="M16 6v20M8 10l8 4 8-4"
                                stroke="white"
                                strokeWidth="1.5"
                            />
                        </svg>
                        TitanVault
                    </Link>

                    <div className="header-search">
                        <input
                            type="text"
                            placeholder="Search action figures, statues, model kits..."
                            value={searchTerm}
                            onChange={(e) => onSearch(e.target.value)}
                        />
                        <button type="button">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                        </button>
                    </div>

                    <div className="header-actions">
                        {user ? (
                            <>
                                <Link href="/cart" className="header-btn cart-badge">
                                    <svg
                                        width="22"
                                        height="22"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle cx="9" cy="21" r="1" />
                                        <circle cx="20" cy="21" r="1" />
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                    </svg>
                                    {cartCount !== undefined && cartCount > 0 && (
                                        <span>{cartCount}</span>
                                    )}
                                </Link>

                                <Link href="/orders" className="header-btn" style={{ textDecoration: "none", color: "inherit", fontWeight: 600 }}>
                                    Hi, {user.name.split(" ")[0]}
                                </Link>

                                <button className="header-btn" onClick={logout}>
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="header-btn"
                                    onClick={() => setShowAuth(true)}
                                >
                                    Sign In / Register
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Categories Bar */}
            <nav className="categories-bar">
                <div className="categories-inner">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.key ?? "all"}
                            className={`category-link ${activeCategory === cat.key ? "active" : ""}`}
                            onClick={() => onCategoryChange(cat.key)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </nav>

            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </>
    );
}
