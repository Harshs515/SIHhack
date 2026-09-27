import { supabase } from "../api/supabaseClient";
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { getSession, saveSession as persistSession, clearSession as removeSession } from "../utils/session";

export const AuthContext = createContext({
    user: null,
    role: null,
    loading: true,
    login: () => {},
    logout: () => {},
    refreshSession: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshSession = useCallback(() => {
        const localSession = getSession();
        if (localSession?.profile) {
            setUser(localSession.profile);
            setRole(localSession.role || 'investigator');
            return true;
        }
        return false;
    }, []);

    useEffect(() => {
        // 1. Check local session (badge-based login)
        if (refreshSession()) {
            setLoading(false);
            return;
        }

        // 2. Fall back to Supabase session if available
        if (supabase?.auth) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session?.user) {
                    setUser(session.user);
                    setRole('investigator');
                } else {
                    setUser(null);
                    setRole(null);
                }
                setLoading(false);
            }).catch(() => {
                setLoading(false);
            });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                const currentLocal = getSession();
                if (!currentLocal?.profile) {
                    if (session?.user) {
                        setUser(session.user);
                        setRole('investigator');
                    } else {
                        setUser(null);
                        setRole(null);
                    }
                }
                setLoading(false);
            });

            return () => subscription?.unsubscribe?.();
        } else {
            setLoading(false);
        }
    }, [refreshSession]);

    const login = useCallback((sessionData) => {
        persistSession(sessionData);
        const profile = sessionData?.profile || sessionData?.user || sessionData;
        const userRole = sessionData?.role || 'investigator';
        setUser(profile);
        setRole(userRole);
    }, []);

    const logout = useCallback(async () => {
        removeSession();
        setUser(null);
        setRole(null);
        if (supabase?.auth) {
            try {
                await supabase.auth.signOut();
            } catch (err) {
                console.warn("Supabase signOut error:", err);
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, role, loading, login, logout, refreshSession }}>
            {children}
        </AuthContext.Provider>
    );
};
