"use client";

import { useAuth } from "../../../AuthContext";
import { useState, FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";

type Category = "action-figures" | "statues" | "model-kits" | "diecast" | "plush-collectibles";
type Condition = "mint-in-box" | "new" | "like-new" | "used";

/* ——— inline styles ——— */
const S = {
    h1: { fontSize: "1.65rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 4 } as React.CSSProperties,
    subtitle: { color: "#757575", fontSize: "0.92rem", marginBottom: 28 } as React.CSSProperties,
    spinner: { width: 40, height: 40, border: "3px solid #f3f3f3", borderTopColor: "#ff6b6b", borderRadius: "50%", animation: "adminspin 0.8s linear infinite" } as React.CSSProperties,

    /* form */
    formCard: { background: "#fff", borderRadius: 14, padding: 32, border: "1px solid #e8e8e8", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" } as React.CSSProperties,
    formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 } as React.CSSProperties,
    formGroup: { display: "flex", flexDirection: "column", gap: 6 } as React.CSSProperties,
    formGroupFull: { display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" } as React.CSSProperties,
    label: { fontSize: "0.85rem", fontWeight: 600, color: "#2d3436" } as React.CSSProperties,
    input: { width: "100%", padding: "10px 14px", border: "1.5px solid #e8e8e8", borderRadius: 8, fontSize: "0.9rem", outline: "none", background: "#f8f9fa", color: "#2d3436", boxSizing: "border-box" } as React.CSSProperties,
    select: { width: "100%", padding: "10px 14px", border: "1.5px solid #e8e8e8", borderRadius: 8, fontSize: "0.9rem", outline: "none", background: "#f8f9fa", color: "#2d3436", cursor: "pointer", boxSizing: "border-box" } as React.CSSProperties,
    textarea: { width: "100%", padding: "10px 14px", border: "1.5px solid #e8e8e8", borderRadius: 8, fontSize: "0.9rem", outline: "none", background: "#f8f9fa", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" } as React.CSSProperties,
    fieldError: { color: "#ef4444", fontSize: "0.75rem" } as React.CSSProperties,
    imgPreview: { marginTop: 8, width: 120, height: 120, borderRadius: 8, border: "1px solid #e8e8e8", overflow: "hidden", background: "#f8f8f8" } as React.CSSProperties,
    imgPreviewImg: { width: "100%", height: "100%", objectFit: "contain" } as React.CSSProperties,
    formActions: { marginTop: 28, display: "flex", justifyContent: "flex-end" } as React.CSSProperties,
    submitBtn: { padding: "12px 36px", background: "#ff6b6b", color: "#fff", border: "none", borderRadius: 8, fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease" } as React.CSSProperties,
    submitBtnDisabled: { padding: "12px 36px", background: "#ff6b6b", color: "#fff", border: "none", borderRadius: 8, fontSize: "0.95rem", fontWeight: 600, cursor: "not-allowed", opacity: 0.6 } as React.CSSProperties,
    message: (type: "success" | "error") => ({
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderRadius: 10, marginBottom: 20, fontSize: "0.88rem", fontWeight: 500,
        background: type === "success" ? "#ecfdf5" : "#fef2f2",
        color: type === "success" ? "#065f46" : "#991b1b",
        border: `1px solid ${type === "success" ? "#a7f3d0" : "#fecaca"}`,
    }) as React.CSSProperties,
    msgClose: { background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "inherit", opacity: 0.7, padding: "0 4px" } as React.CSSProperties,
};

export default function AddProductPage() {
    const { user } = useAuth();
    const createProduct = useMutation(api.products.createProduct);
    const generateUploadUrl = useMutation(api.products.generateUploadUrl);
    const getStorageUrl = useMutation(api.products.getStorageUrl);

    const [formData, setFormData] = useState({
        name: "", price: "", category: "" as Category | "", stock: "", brand: "",
        condition: "" as Condition | "", imageUrl: "", shortDescription: "", description: "",
    });
    const [imageSelectionMethod, setImageSelectionMethod] = useState<"url" | "upload">("url");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!formData.name.trim()) e.name = "Product name is required.";
        if (!formData.price || Number(formData.price) <= 0) e.price = "Enter a valid price.";
        if (!formData.category) e.category = "Select a category.";
        if (!formData.stock || Number(formData.stock) < 0) e.stock = "Enter a valid stock quantity.";
        if (!formData.brand.trim()) e.brand = "Brand is required.";
        if (!formData.condition) e.condition = "Select a condition.";
        if (!formData.shortDescription.trim()) e.shortDescription = "Short description is required.";
        if (!formData.description.trim()) e.description = "Description is required.";

        if (imageSelectionMethod === "url" && !formData.imageUrl.trim()) {
            e.imageUrl = "Image URL is required.";
        } else if (imageSelectionMethod === "upload" && !selectedFile) {
            e.imageUrl = "Please select an image file to upload.";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev: FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;
        setLoading(true); setSuccessMsg("");
        try {
            let finalImageUrl = formData.imageUrl.trim();

            if (imageSelectionMethod === "upload" && selectedFile) {
                // 1. Get upload URL
                const postUrl = await generateUploadUrl();
                // 2. POST the file
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": selectedFile.type },
                    body: selectedFile,
                });
                const { storageId } = await result.json();
                // 3. Resolve to public URL
                const publicUrl = await getStorageUrl({ storageId });
                if (!publicUrl) throw new Error("Failed to get public URL for uploaded image.");
                finalImageUrl = publicUrl;
            }

            await createProduct({
                name: formData.name, price: Number(formData.price), category: formData.category as Category,
                stock: Number(formData.stock), brand: formData.brand, condition: formData.condition as Condition,
                images: [finalImageUrl],
                description: formData.description, shortDescription: formData.shortDescription,
            });
            setSuccessMsg("Product created successfully!");
            setFormData({ name: "", price: "", category: "", stock: "", brand: "", condition: "", imageUrl: "", shortDescription: "", description: "" });
            setSelectedFile(null);
            setErrors({});
        } catch (err: unknown) {
            setErrors({ submit: err instanceof Error ? err.message : "Failed to create product." });
        } finally { setLoading(false); }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((p) => ({ ...p, [field]: value }));
        if (errors[field]) setErrors((p) => { const c = { ...p }; delete c[field]; return c; });
    };

    if (!user) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <div style={S.spinner} />
                <style>{`@keyframes adminspin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <>
            <div style={{ marginBottom: "30px" }}>
                <Link href="/admin/products" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600, marginBottom: "15px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    Back to Products
                </Link>
                <h1 style={S.h1}>Add New Product</h1>
                <p style={S.subtitle}>Fill in the details to add a new product to the store inventory.</p>
            </div>

            {successMsg && (
                <div style={S.message("success")}>{successMsg}<button style={S.msgClose} onClick={() => setSuccessMsg("")}>×</button></div>
            )}
            {errors.submit && (
                <div style={S.message("error")}>{errors.submit}<button style={S.msgClose} onClick={() => setErrors((p) => { const c = { ...p }; delete c.submit; return c; })}>×</button></div>
            )}

            <form onSubmit={handleSubmit} style={S.formCard}>
                <div style={S.formGrid}>
                    <div style={S.formGroup}>
                        <label style={S.label}>Product Name *</label>
                        <input style={S.input} type="text" placeholder="e.g. Hot Toys Iron Man Mark LXXXV" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
                        {errors.name && <span style={S.fieldError}>{errors.name}</span>}
                    </div>
                    <div style={S.formGroup}>
                        <label style={S.label}>Price (₱) *</label>
                        <input style={S.input} type="number" step="0.01" placeholder="0.00" value={formData.price} onChange={(e) => handleChange("price", e.target.value)} />
                        {errors.price && <span style={S.fieldError}>{errors.price}</span>}
                    </div>
                    <div style={S.formGroup}>
                        <label style={S.label}>Category *</label>
                        <select style={S.select} value={formData.category} onChange={(e) => handleChange("category", e.target.value)}>
                            <option value="">Select category</option>
                            <option value="action-figures">Action Figures</option>
                            <option value="statues">Statues</option>
                            <option value="model-kits">Model Kits</option>
                            <option value="diecast">Die-Cast</option>
                            <option value="plush-collectibles">Plush &amp; Collectibles</option>
                        </select>
                        {errors.category && <span style={S.fieldError}>{errors.category}</span>}
                    </div>
                    <div style={S.formGroup}>
                        <label style={S.label}>Stock Quantity *</label>
                        <input style={S.input} type="number" placeholder="0" value={formData.stock} onChange={(e) => handleChange("stock", e.target.value)} />
                        {errors.stock && <span style={S.fieldError}>{errors.stock}</span>}
                    </div>
                    <div style={S.formGroup}>
                        <label style={S.label}>Brand *</label>
                        <input style={S.input} type="text" placeholder="e.g. Hot Toys, Bandai, NECA" value={formData.brand} onChange={(e) => handleChange("brand", e.target.value)} />
                        {errors.brand && <span style={S.fieldError}>{errors.brand}</span>}
                    </div>
                    <div style={S.formGroup}>
                        <label style={S.label}>Condition *</label>
                        <select style={S.select} value={formData.condition} onChange={(e) => handleChange("condition", e.target.value)}>
                            <option value="">Select condition</option>
                            <option value="new">New</option>
                            <option value="mint-in-box">Mint in Box</option>
                            <option value="like-new">Like New</option>
                            <option value="used">Used</option>
                        </select>
                        {errors.condition && <span style={S.fieldError}>{errors.condition}</span>}
                    </div>

                    <div style={S.formGroupFull}>
                        <label style={S.label}>Product Image *</label>
                        <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                                <input type="radio" checked={imageSelectionMethod === "url"} onChange={() => setImageSelectionMethod("url")} />
                                Image URL
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                                <input type="radio" checked={imageSelectionMethod === "upload"} onChange={() => setImageSelectionMethod("upload")} />
                                Upload Image
                            </label>
                        </div>

                        {imageSelectionMethod === "url" ? (
                            <input style={S.input} type="url" placeholder="https://example.com/image.jpg" value={formData.imageUrl} onChange={(e) => handleChange("imageUrl", e.target.value)} />
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <input
                                    style={S.input}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setSelectedFile(file);
                                            // Optional: Local preview
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Max size: 10MB (Convex default)</span>
                            </div>
                        )}
                        {errors.imageUrl && <span style={S.fieldError}>{errors.imageUrl}</span>}

                        {formData.imageUrl && (
                            <div style={S.imgPreview}>
                                <img style={S.imgPreviewImg as React.CSSProperties} src={formData.imageUrl} alt="Preview" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            </div>
                        )}
                    </div>

                    <div style={S.formGroupFull}>
                        <label style={S.label}>Short Description *</label>
                        <input style={S.input} type="text" placeholder="Brief product summary (shown in product lists)" value={formData.shortDescription} onChange={(e) => handleChange("shortDescription", e.target.value)} />
                        {errors.shortDescription && <span style={S.fieldError}>{errors.shortDescription}</span>}
                    </div>
                    <div style={S.formGroupFull}>
                        <label style={S.label}>Full Description *</label>
                        <textarea style={S.textarea as React.CSSProperties} placeholder="Detailed product description..." rows={4} value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
                        {errors.description && <span style={S.fieldError}>{errors.description}</span>}
                    </div>
                </div>
                <div style={S.formActions}>
                    <button type="submit" style={loading ? S.submitBtnDisabled : S.submitBtn} disabled={loading}>
                        {loading ? "Processing..." : "Create Product"}
                    </button>
                </div>
            </form>
        </>
    );
}
