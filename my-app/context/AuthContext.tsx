'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, users } from '@/data/users';

interface AuthContextType {
    user: User | null;
    login: (identifier: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    // Load user from localStorage only on the client after mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (identifier: string, password: string): boolean => {
        const foundUser = users.find(
            (u) => (u.email === identifier || u.mobile === identifier) && u.password === password
        );
        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('user', JSON.stringify(foundUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};