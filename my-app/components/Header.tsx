'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaUserMd, FaCalendarCheck, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaUserCircle } from 'react-icons/fa';

export default function Header() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully.');
        router.push('/');
    };

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="container-custom h-16 flex items-center justify-between">
                {/* Logo ---------------------------------------------------------------------- */}
                <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                        <FaUserMd className="text-white text-sm" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                        Ayu<span className="text-primary">care</span>
                    </span>
                </Link>

                {/* Navigation ---------------------------------------------------------------- */}
                <nav className="flex items-center gap-3 sm:gap-6">
                    <Link href="/doctors"
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                    >
                        <FaUserMd size={15} /><span className="hidden sm:inline">Doctors</span>
                    </Link>
                    {user ? (
                        <>
                            <Link href="/appointments"
                                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                            >
                                <FaCalendarCheck size={15} /><span className="hidden sm:inline">Appointments</span>
                            </Link>
                            <Link href={user.role === 'patient' ? '/patient/profile' : '/doctor/profile'}
                                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                            >
                                <FaUserCircle size={17} /><span className="hidden sm:inline">My Profile</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
                            >
                                <FaSignOutAlt size={15} /><span className="hidden sm:inline cursor-pointer">Sign Out</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/signin"
                                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                            >
                                <FaSignInAlt size={15} /><span className="hidden sm:inline">Sign In</span>
                            </Link>
                            <Link href="/signup"
                                className="flex items-center gap-1.5 text-sm font-medium text-white px-3 sm:px-4 py-2 rounded-lg bg-primary hover:opacity-90 transition"
                            >
                                <FaUserPlus size={15} /><span className="hidden sm:inline">Sign Up</span>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );

}