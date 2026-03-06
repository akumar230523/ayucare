'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { FaShieldAlt, FaRedo, FaArrowLeft } from 'react-icons/fa';

const OTP_LENGTH = 5;
const CORRECT_OTP = '12345';
const RESEND_SECS = 55;

export default function VerifyOtpPage() {
    const router = useRouter();
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [timer, setTimer] = useState(RESEND_SECS);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleVerify = useCallback(async () => {
        const otp = digits.join('');
        if (otp.length < OTP_LENGTH) {
            toast.error('Please enter all 5 digits.');
            return;
        }
        setLoading(true);
        await new Promise(r => setTimeout(r, 600));
        if (otp === CORRECT_OTP) {
            toast.success('OTP verified! Please sign in.');
            router.push('/signin');
        } else {
            toast.error('Incorrect OTP. Please try again.');
            setDigits(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        }
        setLoading(false);
    }, [digits, router]);

    // Debounced auto-submit when all digits are filled
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (digits.every(d => d !== '')) {
                handleVerify();
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [digits, handleVerify]);

    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const updated = [...digits];
        updated[index] = value.slice(-1);
        setDigits(updated);
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        const updated = pasted.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH);
        setDigits(updated);
        inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    const handleResend = () => {
        setDigits(Array(OTP_LENGTH).fill(''));
        setTimer(RESEND_SECS);
        inputRefs.current[0]?.focus();
        toast.success('OTP resent successfully.');
    };

    const otpComplete = digits.every(d => d !== '');

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                {/*  */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
                            <FaShieldAlt className="text-white text-xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Verify your account</h1>
                        <p className="text-sm text-gray-500 mt-1">Enter the 5-digit code sent to your mobile</p>
                        <p className="text-xs text-gray-400 mt-1">+91 ••• ••• 99</p>
                    </div>

                    <div className="flex justify-center gap-3 mb-6">
                        {digits.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => { inputRefs.current[i] = el; }}
                                id={`otp-${i}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                onPaste={i === 0 ? handlePaste : undefined}
                                className={`w-12 h-14 border border-gray-300 rounded-xl font-bold text-center text-2xl text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transitio `}
                            />
                        ))}
                    </div>

                    <p className="text-center text-sm text-gray-500 mb-6">
                        {timer > 0 ? (
                            <>Resend code in <span className="font-semibold text-gray-700">{timer}s</span></>
                        ) : (
                            <button onClick={handleResend} className="inline-flex items-center gap-1 text-primary font-semibold hover:underline">
                                <FaRedo size={12} /> Resend code
                            </button>
                        )}
                    </p>

                    <button onClick={handleVerify} disabled={!otpComplete || loading} className="btn-primary w-full py-2.5">
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                    </button>

                    <div className="text-center mt-5">
                        <Link href="/signup" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition">
                            <FaArrowLeft size={12} /> Back to Sign Up
                        </Link>
                    </div>
                </div>
                {/*  */}
                <p className="text-center text-xs text-gray-400 mt-4">
                    Demo: enter <span className="font-mono font-bold text-gray-500">12345</span> to verify
                </p>
            </div>
        </div>
    );

}