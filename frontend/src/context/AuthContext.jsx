import { supabase } from "../api/supabaseClient";
import { useState, useEffect, createContext } from "react";
import { getSession } from "../utils/session";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // First, check local personnel session (badge-based login)
        const localSession = getSession();
        if (localSession?.profile) {
            setUser(localSession.profile);
            setLoading(false);
            return;
        }

        // Fall back to Supabase session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null);
            setLoading(false);
        });

        // Listen for Supabase auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // Only update from Supabase if there's no local session active
            if (!getSession()?.profile) {
                setUser(session?.user || null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
