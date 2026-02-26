'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import {
    FaEnvelope, FaPhone, FaCalendarAlt, FaVenusMars,
    FaBell, FaCalendarCheck, FaEdit,
    FaRulerVertical, FaWeightHanging, FaNotesMedical
} from 'react-icons/fa';
import Link from 'next/link';

export default function PatientProfile() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/signin');
        } 
        else if (user.role !== 'patient') {
            router.push('/doctor/profile');
        }
    }, [user, router]);

    if (!user || user.role !== 'patient') return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">

                    {/* Header with notifications & appointments icons */}
                    <div className="h-32 relative" style={{ backgroundColor: '#46C2DE' }}>
                        <div className="absolute top-4 right-4 flex space-x-4">
                            <Link href="/notifications">
                                <FaBell className="text-white text-2xl cursor-pointer hover:opacity-80" />
                            </Link>
                            <Link href="/appointments">
                                <FaCalendarCheck className="text-white text-2xl cursor-pointer hover:opacity-80" />
                            </Link>
                        </div>
                    </div>

                    {/* Profile content */}
                    <div className="px-6 py-8 relative">
                        {/* User image */}
                        <div className="flex justify-center -mt-20 mb-4">
                            <div className="relative w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                                <Image
                                    src={user.iconUrl || '/default-avatar.png'}
                                    alt={user.name}
                                    fill
                                    className="object-cover"
                                    sizes="128px"
                                />
                            </div>
                        </div>
                        {/* Name and Edit button */}
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {user.name || '-'}
                            </h1>
                            <Link href="/patient/profile/edit">
                                <button className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer">
                                    <FaEdit className="text-gray-500 hover:text-gray-700" size={20} />
                                </button>
                            </Link>
                        </div>
                        {/*  */}
                        <div className="border-t border-gray-200 mt-4 pt-1">
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
                                        <FaCalendarAlt className="text-gray-400" /> Age
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">{user.age ?? ''}</dd>
                                </div>
                                <div className="py-4 flex flex-col sm:flex-row sm:items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-1/3 flex items-center gap-2">
                                        <FaVenusMars className="text-gray-400" /> Gender
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3 capitalize">{user.gender || ''}</dd>
                                </div>
                                <div className="py-4 flex flex-col sm:flex-row sm:items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-1/3 flex items-center gap-2">
                                        <FaRulerVertical className="text-gray-400" /> Height
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">{user.height ?? ''}</dd>
                                </div>
                                <div className="py-4 flex flex-col sm:flex-row sm:items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-1/3 flex items-center gap-2">
                                        <FaWeightHanging className="text-gray-400" /> Weight
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">{user.weight ?? ''}</dd>
                                </div>
                                <div className="py-4 flex flex-col sm:flex-row sm:items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-1/3 flex items-center gap-2">
                                        <FaNotesMedical className="text-gray-400" /> Problem
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">{user.problem || ''}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
    
}