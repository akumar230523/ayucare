'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import toast from 'react-hot-toast';

// Inner component that uses useSearchParams
function LoginForm() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = login(identifier, password);
        if (success) {
            toast.success('Login successful! Redirecting...', { duration: 2000 });
            setTimeout(() => router.push(redirect), 1000);
        } else {
            setError('Invalid credentials');
            toast.error('Invalid email/mobile or password.');
        }
    };

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                        Mobile / Email
                    </label>
                    <input
                        id="identifier"
                        name="identifier"
                        type="text"
                        required
                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Mobile or Email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="remember"
                        name="remember"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                        Remember Me
                    </label>
                </div>
                <div className="text-sm">
                    <Link href="/forgot-password" className="font-medium" style={{ color: '#46C2DE' }}>
                        Forgot Password?
                    </Link>
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    style={{ backgroundColor: '#46C2DE' }}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                >
                    Sign In
                </button>
            </div>
        </form>
    );
}

// Main page component with Suspense boundary
export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">Ayucare</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">Sign in to your account</p>
                </div>

                <Suspense fallback={<div className="text-center py-4">Loading login form...</div>}>
                    <LoginForm />
                </Suspense>

                <div className="text-center text-sm text-gray-600">Or login With</div>
                <div>
                    <button
                        type="button"
                        className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                        <Image
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google logo"
                            width={20}
                            height={20}
                            className="mr-2"
                        />
                        Continue with Google
                    </button>
                </div>

                <div className="text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-medium" style={{ color: '#46C2DE' }}>
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
}