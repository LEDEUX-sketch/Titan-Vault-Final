"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { usePathname } from "next/navigation";

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
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith("/admin");

    const [normalUser, setNormalUser] = useState<User | null>(null);
    const [adminUser, setAdminUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("titanvault_user");
        if (storedUser) {
            try { 
                const parsed = JSON.parse(storedUser);
                if (parsed?.role === "admin") {
                    localStorage.removeItem("titanvault_user");
                } else {
                    setNormalUser(parsed); 
                }
            } catch { localStorage.removeItem("titanvault_user"); }
        }
        
        const storedAdmin = localStorage.getItem("titanvault_admin");
        if (storedAdmin) {
            try { 
                const parsed = JSON.parse(storedAdmin);
                if (parsed?.role !== "admin") {
                    localStorage.removeItem("titanvault_admin");
                } else {
                    setAdminUser(parsed); 
                }
            } catch { localStorage.removeItem("titanvault_admin"); }
        }
    }, []);

    const handleSetUser = (user: User | null) => {
        if (isAdminRoute) {
            setAdminUser(user);
            if (user) {
                localStorage.setItem("titanvault_admin", JSON.stringify(user));
            } else {
                localStorage.removeItem("titanvault_admin");
            }
        } else {
            setNormalUser(user);
            if (user) {
                localStorage.setItem("titanvault_user", JSON.stringify(user));
            } else {
                localStorage.removeItem("titanvault_user");
            }
        }
    };

    const logout = () => {
        if (isAdminRoute) {
            setAdminUser(null);
            localStorage.removeItem("titanvault_admin");
        } else {
            setNormalUser(null);
            localStorage.removeItem("titanvault_user");
        }
    };

    const activeUser = isAdminRoute ? adminUser : normalUser;
    const isAdmin = activeUser?.role === "admin";

    return (
        <AuthContext.Provider value={{ user: activeUser, setUser: handleSetUser, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
