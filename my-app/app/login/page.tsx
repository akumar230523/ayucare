'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('')
    const [remember, setRemember] = useState(false)
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // In a real app, send OTP to the provided mobile/email
        router.push('/verify-otp')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">Ayucare</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Login with Mobile or Email
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                            placeholder="login with Mobile or Email"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember"
                                name="remember"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
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
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Login
                        </button>
                    </div>

                    <div className="text-center text-sm text-gray-600">Or login With</div>

                    <div>
                        <button
                            type="button"
                            className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
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
                </form>
            </div>
        </div>
    )
}