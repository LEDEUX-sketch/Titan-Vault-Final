"use client";

import { useAuth } from "../../AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

function formatPrice(price: number) {
    return `₱${price.toLocaleString("en-PH")}`;
}

export default function AdminProductsPage() {
    const { user } = useAuth();

    const products = useQuery(api.products.list, {});
    const deleteProduct = useMutation(api.products.deleteProduct);
    const updateStock = useMutation(api.products.updateStock);
    const updatePrice = useMutation(api.products.updatePrice);

    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isUpdatingStock, setIsUpdatingStock] = useState<string | null>(null);
    const [isUpdatingPrice, setIsUpdatingPrice] = useState<string | null>(null);
    const [stockModal, setStockModal] = useState<{ isOpen: boolean; productId: string | null; currentStock: number }>({
        isOpen: false,
        productId: null,
        currentStock: 0
    });
    const [priceModal, setPriceModal] = useState<{ isOpen: boolean; productId: string | null; currentPrice: number; productName: string }>({
        isOpen: false,
        productId: null,
        currentPrice: 0,
        productName: ""
    });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string | null; productName: string }>({
        isOpen: false,
        productId: null,
        productName: ""
    });
    const [newStockValue, setNewStockValue] = useState("");
    const [newPriceValue, setNewPriceValue] = useState("");

    if (!user || products === undefined) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <div className="spinner"></div>
            </div>
        );
    }

    const openDeleteModal = (productId: string, productName: string) => {
        setDeleteModal({ isOpen: true, productId, productName });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.productId) return;

        setIsDeleting(deleteModal.productId);
        try {
            await deleteProduct({ productId: deleteModal.productId as any });
            setDeleteModal({ isOpen: false, productId: null, productName: "" });
        } catch (error) {
            console.error("Failed to delete product:", error);
            // Optionally set an error state here instead of alert
        } finally {
            setIsDeleting(null);
        }
    };

    const openStockModal = (productId: string, currentStock: number) => {
        setStockModal({ isOpen: true, productId, currentStock });
        setNewStockValue(currentStock.toString());
    };

    const openPriceModal = (productId: string, currentPrice: number, productName: string) => {
        setPriceModal({ isOpen: true, productId, currentPrice, productName });
        setNewPriceValue(currentPrice.toString());
    };

    const handleUpdateStockSubmit = async () => {
        if (!stockModal.productId) return;

        const newStock = parseInt(newStockValue, 10);
        if (isNaN(newStock) || newStock < 0) {
            alert("Invalid stock amount. Please enter a valid number (0 or greater).");
            return;
        }

        setIsUpdatingStock(stockModal.productId);
        try {
            await updateStock({ productId: stockModal.productId as any, newStock });
            setStockModal({ isOpen: false, productId: null, currentStock: 0 });
        } catch (error) {
            console.error("Failed to update stock:", error);
            alert("Error updating stock.");
        } finally {
            setIsUpdatingStock(null);
        }
    };

    const handleUpdatePriceSubmit = async () => {
        if (!priceModal.productId) return;

        const newPrice = parseFloat(newPriceValue);
        if (isNaN(newPrice) || newPrice < 0) {
            alert("Invalid price. Please enter a valid number (0 or greater).");
            return;
        }

        setIsUpdatingPrice(priceModal.productId);
        try {
            await updatePrice({ productId: priceModal.productId as any, newPrice });
            setPriceModal({ isOpen: false, productId: null, currentPrice: 0, productName: "" });
        } catch (error) {
            console.error("Failed to update price:", error);
            alert("Error updating price.");
        } finally {
            setIsUpdatingPrice(null);
        }
    };

    // Shared styles
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
        btnPrimary: {
            background: "#ff6b6b",
            color: "white",
            padding: "12px 24px",
            border: "none",
            borderRadius: "10px",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 12px rgba(255,107,107,0.2)"
        },
        actionBtn: {
            padding: "6px 12px",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
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
            maxWidth: "400px",
        },
        modalTitle: {
            margin: "0 0 20px 0",
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "#1a1a2e",
        },
        modalInput: {
            width: "100%",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontSize: "1rem",
            marginBottom: "20px",
            outline: "none",
            transition: "border-color 0.2s ease",
        },
        modalActions: {
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
        },
        btnSecondary: {
            background: "#f1f5f9",
            color: "#64748b",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
        }
    };

    return (
        <>
            <div style={S.header}>
                <h1 style={S.title}>Products</h1>

                <Link href="/admin/products/new" style={S.btnPrimary}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Product
                </Link>
            </div>

            <div style={S.tableContainer}>
                <table style={S.table}>
                    <thead>
                        <tr>
                            <th style={S.th}>Product</th>
                            <th style={S.th}>Category/Brand</th>
                            <th style={S.th}>Price</th>
                            <th style={S.th}>Stock</th>
                            <th style={S.th}>Status</th>
                            <th style={{ ...S.th, textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ ...S.td, textAlign: "center", padding: "40px", color: "#a0aabf" }}>
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            products.map((product: any) => (
                                <tr key={product._id}>
                                    <td style={S.td}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <div style={{ width: "45px", height: "45px", borderRadius: "8px", background: "#f1f3f5", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {product.images && product.images.length > 0 ? (
                                                    <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                ) : (
                                                    <span style={{ fontSize: "1.2rem" }}>📦</span>
                                                )}
                                            </div>
                                            <div style={{ fontWeight: 600, maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {product.name}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={S.td}>
                                        <div style={{ fontSize: "0.85rem", color: "#2d3436" }}>{product.category}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#a0aabf" }}>{product.brand}</div>
                                    </td>
                                    <td style={S.td}>
                                        <strong style={{ color: "#2d3436" }}>
                                            {formatPrice(product.price)}
                                        </strong>
                                    </td>
                                    <td style={S.td}>
                                        <span style={{
                                            fontWeight: 700,
                                            color: product.stock <= 0 ? "#e74c3c" : product.stock < 5 ? "#e67e22" : "#2d3436"
                                        }}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td style={S.td}>
                                        <span style={{
                                            display: "inline-block",
                                            padding: "4px 10px",
                                            borderRadius: 12,
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            textTransform: "uppercase",
                                            background: product.stock <= 0 ? "#fef2f2" : "#f0fdf4",
                                            color: product.stock <= 0 ? "#ef4444" : "#22c55e",
                                            border: `1px solid ${product.stock <= 0 ? "#fecaca" : "#bbf7d0"}`
                                        }}>
                                            {product.stock <= 0 ? "Sold Out" : "In Stock"}
                                        </span>
                                    </td>
                                    <td style={{ ...S.td, textAlign: "right" }}>
                                        <button
                                            onClick={() => openPriceModal(product._id, product.price, product.name)}
                                            disabled={isUpdatingPrice === product._id}
                                            style={{
                                                ...S.actionBtn,
                                                background: "#fef3c7",
                                                color: "#b45309",
                                                opacity: isUpdatingPrice === product._id ? 0.5 : 1
                                            }}
                                        >
                                            {isUpdatingPrice === product._id ? "..." : "Price"}
                                        </button>
                                        <button
                                            onClick={() => openStockModal(product._id, product.stock)}
                                            disabled={isUpdatingStock === product._id}
                                            style={{
                                                ...S.actionBtn,
                                                background: "#e0f2fe",
                                                color: "#0369a1",
                                                opacity: isUpdatingStock === product._id ? 0.5 : 1
                                            }}
                                        >
                                            {isUpdatingStock === product._id ? "..." : "Stock"}
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(product._id, product.name)}
                                            disabled={isDeleting === product._id}
                                            style={{
                                                ...S.actionBtn,
                                                background: "#fee2e2",
                                                color: "#b91c1c",
                                                marginRight: 0,
                                                opacity: isDeleting === product._id ? 0.5 : 1
                                            }}
                                        >
                                            {isDeleting === product._id ? "..." : "Delete"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Stock Update Modal */}
            {stockModal.isOpen && (
                <div style={S.modalOverlay} onClick={() => setStockModal({ isOpen: false, productId: null, currentStock: 0 })}>
                    <div style={S.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3 style={S.modalTitle}>Update Product Stock</h3>
                        <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "16px" }}>
                            Current stock: <strong>{stockModal.currentStock}</strong>
                        </p>
                        <input
                            type="number"
                            min="0"
                            style={S.modalInput}
                            value={newStockValue}
                            onChange={(e) => setNewStockValue(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleUpdateStockSubmit();
                                if (e.key === "Escape") setStockModal({ isOpen: false, productId: null, currentStock: 0 });
                            }}
                        />
                        <div style={S.modalActions}>
                            <button style={S.btnSecondary} onClick={() => setStockModal({ isOpen: false, productId: null, currentStock: 0 })}>
                                Cancel
                            </button>
                            <button
                                style={S.btnPrimary}
                                onClick={handleUpdateStockSubmit}
                                disabled={isUpdatingStock === stockModal.productId}
                            >
                                {isUpdatingStock === stockModal.productId ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Price Update Modal */}
            {priceModal.isOpen && (
                <div style={S.modalOverlay} onClick={() => setPriceModal({ isOpen: false, productId: null, currentPrice: 0, productName: "" })}>
                    <div style={S.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3 style={S.modalTitle}>Update Product Price</h3>
                        <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "8px" }}>
                            <strong>{priceModal.productName}</strong>
                        </p>
                        <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "16px" }}>
                            Current price: <strong>₱{priceModal.currentPrice.toLocaleString("en-PH")}</strong>
                        </p>
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontWeight: 600, fontSize: "1rem" }}>₱</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                style={{ ...S.modalInput, paddingLeft: "32px" }}
                                value={newPriceValue}
                                onChange={(e) => setNewPriceValue(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleUpdatePriceSubmit();
                                    if (e.key === "Escape") setPriceModal({ isOpen: false, productId: null, currentPrice: 0, productName: "" });
                                }}
                            />
                        </div>
                        <div style={S.modalActions}>
                            <button style={S.btnSecondary} onClick={() => setPriceModal({ isOpen: false, productId: null, currentPrice: 0, productName: "" })}>
                                Cancel
                            </button>
                            <button
                                style={S.btnPrimary}
                                onClick={handleUpdatePriceSubmit}
                                disabled={isUpdatingPrice === priceModal.productId}
                            >
                                {isUpdatingPrice === priceModal.productId ? "Saving..." : "Update Price"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div style={S.modalOverlay} onClick={() => setDeleteModal({ isOpen: false, productId: null, productName: "" })}>
                    <div style={S.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={{ textAlign: "center", marginBottom: "20px" }}>
                            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                    <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </div>
                            <h3 style={S.modalTitle}>Delete Product?</h3>
                            <p style={{ fontSize: "0.95rem", color: "#64748b", lineHeight: 1.5 }}>
                                Are you sure you want to delete <strong style={{ color: "#1a1a2e" }}>{deleteModal.productName}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div style={{ ...S.modalActions, justifyContent: "stretch", flexDirection: "column" as const, gap: "10px" }}>
                            <button
                                style={{ ...S.btnPrimary, background: "#ef4444", justifyContent: "center", boxShadow: "0 4px 12px rgba(239,68,68,0.2)" }}
                                onClick={handleConfirmDelete}
                                disabled={isDeleting !== null}
                            >
                                {isDeleting ? "Deleting..." : "Delete Permanently"}
                            </button>
                            <button
                                style={{ ...S.btnSecondary, padding: "12px", textAlign: "center" }}
                                onClick={() => setDeleteModal({ isOpen: false, productId: null, productName: "" })}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
