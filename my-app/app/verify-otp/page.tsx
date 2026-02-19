'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifyOtpPage() {
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [timer, setTimer] = useState(55)
    const router = useRouter()

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000)
            return () => clearInterval(interval)
        }
    }, [timer])

    const handleChange = (index: number, value: string) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newOtp = [...otp]
            newOtp[index] = value
            setOtp(newOtp)
            if (value && index < 5) {
                document.getElementById(`otp-${index + 1}`)?.focus()
            }
        }
    }

    const handleVerify = () => {
        alert(`Verifying OTP: ${otp.join('')}`)
        router.push('/')
    }

    const handleResend = () => {
        setTimer(55)
        // Resend OTP logic
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">Ayucare</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        OTP Code Verification
                    </p>
                    <p className="text-center text-sm text-gray-500">
                        Code has been sent to +91 111 ******99
                    </p>
                </div>

                <div className="flex justify-center space-x-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ))}
                </div>

                <div className="text-center text-sm text-gray-600">
                    {timer > 0 ? (
                        <p>Resend code in {timer} s</p>
                    ) : (
                        <button
                            onClick={handleResend}
                            className="font-medium"
                            style={{ color: '#46C2DE' }}
                        >
                            Resend code
                        </button>
                    )}
                </div>

                <div>
                    <button
                        onClick={handleVerify}
                        style={{ backgroundColor: '#46C2DE' }}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Verify
                    </button>
                </div>

                {/* Optional numeric keypad (kept for consistency) */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '⌫'].map((key) => (
                        <button
                            key={key}
                            onClick={() => {
                                if (key === '⌫') {
                                    const lastFilled = otp.findIndex(d => d === '')
                                    const index = lastFilled === -1 ? 5 : lastFilled - 1
                                    if (index >= 0) {
                                        handleChange(index, '')
                                        document.getElementById(`otp-${index}`)?.focus()
                                    }
                                } else if (typeof key === 'number' || key === '*') {
                                    const firstEmpty = otp.findIndex(d => d === '')
                                    if (firstEmpty !== -1) {
                                        handleChange(firstEmpty, key.toString())
                                    }
                                }
                            }}
                            className="py-3 text-lg font-medium bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            {key}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}