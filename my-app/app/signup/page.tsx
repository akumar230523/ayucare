'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserMd, FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaUserPlus } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type Role = 'patient' | 'doctor';

interface FormData { name: string; role: Role; email: string; mobile: string; password: string; }

// Define proper interface for InputField props
interface InputFieldProps {
    id: string; label: string; icon: React.ReactNode; type?: string; placeholder: string; value: string; onChange: (value: string) => void; autoComplete?: string; error?: string;
}

function InputField({ id, label, icon, type = 'text', placeholder, value, onChange, autoComplete, error } : InputFieldProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{icon}</span>
                <input
                    id={id}
                    type={inputType}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    required
                    className={`w-full pl-10 pr-${isPassword ? '10' : '4'} py-2.5 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                )}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState<FormData>({ name: '', role: 'patient', email: '', mobile: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!form.name.trim()) newErrors.name = 'Name is required';
        if (!form.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email format';
        if (!form.mobile.trim()) newErrors.mobile = 'Mobile is required';
        else if (!/^\d{10}$/.test(form.mobile)) newErrors.mobile = 'Mobile must be 10 digits';
        if (!form.password) newErrors.password = 'Password is required';
        else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || 'Account created! Please verify your OTP.');
                router.push('/verify-otp');
            } else {
                toast.error(data.message || 'Signup failed. Please try again.');
            }
        } catch {
            toast.error('Network error! Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    {/*  */}
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
                            <FaUserMd className="text-white text-xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Ayu<span className="text-primary">care</span></h1>
                        <p className="text-sm text-gray-500 mt-1">Sign Up to your Ayucare account</p>
                    </div>
                    {/*  */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">I am a</p>
                            <div className="grid grid-cols-2 gap-3">
                                {(['patient', 'doctor'] as Role[]).map((r) => (
                                    <button
                                        key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                                        className={`py-2.5 rounded-lg text-sm font-medium border transition-all capitalize ${form.role === r
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
                                            }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <InputField
                            id="name"
                            label="Full Name"
                            icon={<FaUser />}
                            placeholder="Enter your full name"
                            value={form.name}
                            onChange={(val: string) => setForm(f => ({ ...f, name: val }))}
                            autoComplete="name"
                            error={errors.name}
                        />
                        <InputField
                            id="email"
                            label="Email Address"
                            icon={<FaEnvelope />}
                            type="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={(val: string) => setForm(f => ({ ...f, email: val }))}
                            autoComplete="email"
                            error={errors.email}
                        />
                        <InputField
                            id="mobile"
                            label="Mobile Number"
                            icon={<FaPhone />}
                            type="tel"
                            placeholder="Enter mobile number"
                            value={form.mobile}
                            onChange={(val: string) => setForm(f => ({ ...f, mobile: val }))}
                            autoComplete="tel"
                            error={errors.mobile}
                        />
                        <InputField
                            id="password"
                            label="Password"
                            icon={<FaLock />}
                            type="password"
                            placeholder="Create a password"
                            value={form.password}
                            onChange={(val: string) => setForm(f => ({ ...f, password: val }))}
                            autoComplete="new-password"
                            error={errors.password}
                        />

                        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                            <FaUserPlus size={14} /> {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                    {/*  */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link href="/signin" className="text-primary font-semibold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );

}