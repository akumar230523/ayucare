'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FaUserMd, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Header() {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully!', {
            duration: 2000,
            position: 'top-center',
        });
    };

    return (
        <header style={{ backgroundColor: '#46C2DE' }} className="py-4 shadow-md">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-white">
                    Ayucare
                </Link>
                <nav className="flex items-center space-x-6">
                    <Link href="/doctors" className="text-white hover:text-gray-200 transition flex items-center gap-1">
                        <FaUserMd />
                        <span className="hidden sm:inline">Doctors</span>
                    </Link>
                    {user ? (
                        <>
                            <Link
                                href={user.role === 'patient' ? '/patient/profile' : '/doctor/profile'}
                                className="text-white hover:text-gray-200 transition flex items-center gap-1"
                            >
                                <FaUser />
                                <span className="hidden sm:inline">Profile</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-white hover:text-gray-200 transition flex items-center gap-1 cursor-pointer"
                            >
                                <FaSignOutAlt />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-white hover:text-gray-200 transition flex items-center gap-1">
                                <FaSignInAlt />
                                <span className="hidden sm:inline">Login</span>
                            </Link>
                            <Link href="/signup" className="text-white hover:text-gray-200 transition flex items-center gap-1">
                                <FaUserPlus />
                                <span className="hidden sm:inline">Sign Up</span>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}