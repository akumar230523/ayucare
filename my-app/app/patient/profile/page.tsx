'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { FaEnvelope, FaPhone, FaIdCard, FaCalendarAlt, FaVenusMars, FaUser } from 'react-icons/fa';

export default function PatientProfile() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else if (user.role !== 'patient') {
            router.push('/doctor/profile');
        }
    }, [user, router]);

    if (!user || user.role !== 'patient') return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Header with theme color */}
                    <div className="h-32" style={{ backgroundColor: '#46C2DE' }}></div>

                    {/* Profile content */}
                    <div className="px-6 py-8 relative">
                        {/* Avatar - positioned over the header */}
                        <div className="flex justify-center -mt-20 mb-4">
                            <div className="relative w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                                <Image
                                    src={user.iconUrl}
                                    alt={user.name}
                                    fill
                                    className="object-cover"
                                    sizes="128px"
                                />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
                            {user.name}
                        </h1>
                        <p className="text-center text-gray-600 mb-6 flex items-center justify-center gap-1">
                            <FaUser className="text-gray-400" /> Patient
                        </p>

                        <div className="border-t border-gray-200 pt-6">
                            <dl className="divide-y divide-gray-200">
                                <div className="py-4 flex flex-col sm:flex-row sm:items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-1/3 flex items-center gap-2">
                                        <FaEnvelope className="text-gray-400" /> Email
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">{user.email}</dd>
                                </div>
                                <div className="py-4 flex flex-col sm:flex-row sm:items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-1/3 flex items-center gap-2">
                                        <FaPhone className="text-gray-400" /> Mobile
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">{user.mobile}</dd>
                                </div>
                                <div className="py-4 flex flex-col sm:flex-row sm:items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-1/3 flex items-center gap-2">
                                        <FaIdCard className="text-gray-400" /> Patient ID
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">{user.patientId}</dd>
                                </div>
                                <div className="py-4 flex flex-col sm:flex-row sm:items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-1/3 flex items-center gap-2">
                                        <FaCalendarAlt className="text-gray-400" /> Age
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">{user.age}</dd>
                                </div>
                                <div className="py-4 flex flex-col sm:flex-row sm:items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-1/3 flex items-center gap-2">
                                        <FaVenusMars className="text-gray-400" /> Gender
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3 capitalize">{user.gender}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Optional button with theme color */}
                        <div className="mt-6 text-center">
                            <button
                                className="px-6 py-2 rounded-md text-white font-medium hover:opacity-90 transition flex items-center gap-2 mx-auto cursor-pointer"
                                style={{ backgroundColor: '#46C2DE' }}
                            >
                                <FaUser /> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}