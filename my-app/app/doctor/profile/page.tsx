'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import {
    FaEnvelope, FaPhone, FaStethoscope, FaVenusMars, FaUserMd,
    FaUser, FaBriefcase, FaStar, FaComment, FaCalendarAlt, FaCircle,
    FaBell, FaCalendarCheck, FaEdit, FaQuoteLeft, FaGraduationCap
} from 'react-icons/fa';
import Link from 'next/link';

export default function DoctorProfile() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } 
        else if (user.role !== 'doctor') {
            router.push('/patient/profile');
        }
    }, [user, router]);

    if (!user || user.role !== 'doctor') return null;

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
                            <Link href="/doctor/profile/edit">
                                <button className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer">
                                    <FaEdit className="text-gray-500 hover:text-gray-700" size={20} />
                                </button>
                            </Link>
                        </div>
                        {/* Specialty */}
                        <p className="text-center text-gray-600 mb-1 flex items-center justify-center gap-1">
                            <FaUserMd className="text-gray-400" /> {user.specialty || '-'}
                        </p>
                        {/* Expression */}
                        {user.expression && (
                            <p className="text-center text-sm text-gray-500 italic mb-4 flex items-center justify-center gap-1">
                                <FaQuoteLeft className="text-gray-400" size={12} />
                                {user.expression}
                            </p>
                        )}
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 mb-4 border-t border-b border-gray-200 pt-4 pb-4">
                            <div className="flex flex-col items-center p-3 rounded-full bg-blue-50 w-24 h-24 mx-auto justify-center">
                                <FaUser className="text-xl" style={{ color: '#46C2DE' }} />
                                <span className="text-lg font-bold text-gray-900">{user.patientsCount || '-'}</span>
                                <span className="text-xs text-gray-500">patients</span>
                            </div>
                            <div className="flex flex-col items-center p-3 rounded-full bg-blue-50 w-24 h-24 mx-auto justify-center">
                                <FaBriefcase className="text-xl" style={{ color: '#46C2DE' }} />
                                <span className="text-lg font-bold text-gray-900">{user.experienceYears ?? '-'}</span>
                                <span className="text-xs text-gray-500">years</span>
                            </div>
                            <div className="flex flex-col items-center p-3 rounded-full bg-blue-50 w-24 h-24 mx-auto justify-center">
                                <FaStar className="text-xl" style={{ color: '#46C2DE' }} />
                                <span className="text-lg font-bold text-gray-900">{user.rating ?? '-'}</span>
                                <span className="text-xs text-gray-500">rating</span>
                            </div>
                            <div className="flex flex-col items-center p-3 rounded-full bg-blue-50 w-24 h-24 mx-auto justify-center">
                                <FaComment className="text-xl" style={{ color: '#46C2DE' }} />
                                <span className="text-lg font-bold text-gray-900">{user.reviewsCount?.toLocaleString() || '-'}</span>
                                <span className="text-xs text-gray-500">reviews</span>
                            </div>
                        </div>
                        {/* About Doctor */}
                        <div className="mt-4">
                            <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-1">
                                <FaUserMd className="text-gray-400" style={{ color: '#46C2DE' }} /> About Me
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{user.about || '-'}</p>
                        </div>
                        {/* Degree */}
                        <div className="mt-4">
                            <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-1">
                                <FaGraduationCap className="text-gray-400" style={{ color: '#46C2DE' }} /> Degree
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{user.degree || '-'}</p>
                        </div>
                        {/* Service & Specialization */}
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-1">
                                    <FaBriefcase className="text-gray-400" style={{ color: '#46C2DE' }} /> Service
                                </h3>
                                <p className="text-sm text-gray-600">{user.service?.join(', ') || '-'}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-1">
                                    <FaStethoscope className="text-gray-400" style={{ color: '#46C2DE' }} /> Specialization
                                </h3>
                                <p className="text-sm text-gray-600">{user.specialty || '-'}</p>
                            </div>
                        </div>
                        {/* Consulting Hours and Availability Status */}
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-1">
                                    <FaCalendarAlt className="text-gray-400" style={{ color: '#46C2DE' }} /> Consulting Hours
                                </h3>
                                <p className="text-sm text-gray-600">Monday to Friday, 10 AM to 5 PM</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-1">
                                    <FaCircle className="text-gray-400" style={{ color: '#46C2DE' }} /> Status
                                </h3>
                                <p className="text-sm text-gray-600">{user.available ? 'Available' : 'Not Available'}</p>
                            </div>
                        </div>
                        {/* Contact Details */}
                        <div className="border-t border-gray-200 mt-4 pt-1">
                            <dl className="divide-y divide-gray-200">
                                <div className="py-4 flex flex-col sm:flex-row sm:items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-1/3 flex items-center gap-2">
                                        <FaEnvelope className="text-gray-400" style={{ color: '#46C2DE' }} /> Email
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">{user.email}</dd>
                                </div>
                                <div className="py-4 flex flex-col sm:flex-row sm:items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-1/3 flex items-center gap-2">
                                        <FaPhone className="text-gray-400" style={{ color: '#46C2DE' }} /> Mobile
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">{user.mobile}</dd>
                                </div>
                                <div className="py-4 flex flex-col sm:flex-row sm:items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-1/3 flex items-center gap-2">
                                        <FaVenusMars className="text-gray-400" style={{ color: '#46C2DE' }} /> Gender
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3 capitalize">{user.gender || '-'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );

}