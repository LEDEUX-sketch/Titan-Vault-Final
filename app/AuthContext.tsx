"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

type User = {
    userId: string;
    name: string;
    email: string;
    role: "admin" | "user";
    status: "active" | "banned" | "suspended";
};

type AuthContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => { },
    logout: () => { },
    isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("titanvault_user");
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                localStorage.removeItem("titanvault_user");
            }
        }
    }, []);

    const handleSetUser = (user: User | null) => {
        setUser(user);
        if (user) {
            localStorage.setItem("titanvault_user", JSON.stringify(user));
        } else {
            localStorage.removeItem("titanvault_user");
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("titanvault_user");
    };

    const isAdmin = user?.role === "admin";

    return (
        <AuthContext.Provider value={{ user, setUser: handleSetUser, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
