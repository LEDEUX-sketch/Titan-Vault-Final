"use client";

import React from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "primary";
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "primary",
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const overlayStyle: React.CSSProperties = {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.2s ease-out",
    };

    const modalStyle: React.CSSProperties = {
        background: "white",
        borderRadius: "16px",
        padding: "32px",
        width: "90%",
        maxWidth: "400px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        animation: "slideUp 0.3s ease-out",
    };

    const titleStyle: React.CSSProperties = {
        fontSize: "1.25rem",
        fontWeight: "700",
        color: "#111827",
        margin: 0,
    };

    const messageStyle: React.CSSProperties = {
        fontSize: "0.95rem",
        color: "#4b5563",
        lineHeight: "1.5",
        margin: 0,
    };

    const footerStyle: React.CSSProperties = {
        display: "flex",
        gap: "12px",
        marginTop: "8px",
    };

    const btnBase: React.CSSProperties = {
        flex: 1,
        padding: "12px",
        borderRadius: "10px",
        fontSize: "0.95rem",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
        border: "none",
    };

    const btnCancel: React.CSSProperties = {
        ...btnBase,
        background: "#f3f4f6",
        color: "#374151",
    };

    const btnConfirm: React.CSSProperties = {
        ...btnBase,
        background: type === "danger" ? "#ef4444" : "var(--primary, #000)",
        color: "white",
    };

    return (
        <div style={overlayStyle} onClick={onCancel}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <h3 style={titleStyle}>{title}</h3>
                <p style={messageStyle}>{message}</p>
                <div style={footerStyle}>
                    <button style={btnCancel} onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button style={btnConfirm} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
