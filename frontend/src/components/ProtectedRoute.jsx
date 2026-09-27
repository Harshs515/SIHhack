import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSession } from "../utils/session";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading, role } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    background: "var(--bg-primary, #070b14)",
                    color: "var(--text-muted, #94a3b8)",
                    fontFamily: "var(--font-sans, sans-serif)",
                }}
            >
                <div style={{ textAlign: "center" }}>
                    <div
                        className="radar-spinner"
                        style={{
                            width: "36px",
                            height: "36px",
                            border: "3px solid rgba(0, 230, 118, 0.2)",
                            borderTop: "3px solid #00e676",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite",
                            margin: "0 auto 16px",
                        }}
                    />
                    <p style={{ fontSize: "0.85rem", letterSpacing: "0.05em", color: "#94a3b8" }}>
                        VERIFYING ACCESS CREDENTIALS...
                    </p>
                </div>
            </div>
        );
    }

    // Dual check: Context user state or valid local session profile
    const localSession = getSession();
    const activeUser = user || localSession?.profile;

    if (!activeUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const currentRole = role || localSession?.role;
    if (allowedRoles && currentRole && !allowedRoles.includes(currentRole)) {
        return <Navigate to="/auth" replace />;
    }

    return children;
};

export default ProtectedRoute;
