'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface User {
    _id: string;
    profileId?: string;      // patient or doctor document id
    name: string;
    email: string;
    mobile: string;
    role: 'patient' | 'doctor';
    age?: number;
    gender?: 'male' | 'female';
    iconUrl?: string;
    height?: number;
    weight?: number;
    problem?: string;
    about?: string;
    specialty?: string;
    expression?: string;
    degree?: string;
    experienceYears?: number;
    patientsCount?: string;
    rating?: number;
    reviewsCount?: number;
    service?: string[];
    available?: boolean;
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};