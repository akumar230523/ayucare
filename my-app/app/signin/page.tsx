'use client';

import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaUserMd } from 'react-icons/fa';

import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function SignInForm() {
    const router = useRouter();
    const { setUser } = useAuth();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });
            const data = await res.json();
            if (res.ok && data.user) {
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success(data.message || 'Welcome back!');
                setTimeout(() => router.push(redirect), 800);
            } else {
                toast.error(data.message || 'Invalid credentials. Please try again.');
            }
        } catch {
            toast.error('Network error! Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">Email or Mobile</label>
                <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        id="identifier"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Email or mobile number"
                        autoComplete="username"
                        required
                        className="w-full pl-10 pr-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        autoComplete="current-password"
                        required
                        className="w-full pl-10 pr-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                    <button type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" /> Remember me
                </label>
                <Link href="/forgot-password" className="text-primary font-medium hover:underline">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 cursor-pointer">
                <FaSignInAlt size={15} /> {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button type="button" className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition">
                <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={18} height={18} /> Continue with Google
            </button>
        </form>
    );
}

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
                            <FaUserMd className="text-white text-xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Ayu<span className="text-primary">care</span></h1>
                        <p className="text-sm text-gray-500 mt-1">Sign In to your Ayucare account</p>
                    </div>

                    <Suspense fallback={<div className="text-center py-6 text-sm text-gray-400">Loading...</div>}>
                        <SignInForm />
                    </Suspense>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-primary font-semibold hover:underline">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );

}