'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { FaEnvelope, FaPhone, FaStethoscope, FaVenusMars, FaUserMd, FaUser, FaBriefcase, FaStar, FaComment, FaCalendarAlt } from 'react-icons/fa';

export default function DoctorProfile() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else if (user.role !== 'doctor') {
            router.push('/patient/profile');
        }
    }, [user, router]);

    if (!user || user.role !== 'doctor') return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
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
                        <p className="text-center text-gray-600 mb-1 flex items-center justify-center gap-1">
                            <FaUserMd className="text-gray-400" /> {user.specialty}
                        </p>
                        <p className="text-center text-sm text-gray-500 mb-4">{user.degree}</p>

                        {/* Stats Cards - Light blue circles */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 mb-6">
                            {/* Patients */}
                            <div className="flex flex-col items-center p-3 rounded-full bg-blue-50 w-24 h-24 mx-auto justify-center">
                                <FaUser className="text-xl" style={{ color: '#46C2DE' }} />
                                <span className="text-lg font-bold text-gray-900">{user.patientsCount || '5,000+'}</span>
                                <span className="text-xs text-gray-500">patients</span>
                            </div>

                            {/* Experience */}
                            <div className="flex flex-col items-center p-3 rounded-full bg-blue-50 w-24 h-24 mx-auto justify-center">
                                <FaBriefcase className="text-xl" style={{ color: '#46C2DE' }} />
                                <span className="text-lg font-bold text-gray-900">{user.experienceYears}+</span>
                                <span className="text-xs text-gray-500">years</span>
                            </div>

                            {/* Rating */}
                            <div className="flex flex-col items-center p-3 rounded-full bg-blue-50 w-24 h-24 mx-auto justify-center">
                                <FaStar className="text-xl" style={{ color: '#46C2DE' }} />
                                <span className="text-lg font-bold text-gray-900">{user.rating}</span>
                                <span className="text-xs text-gray-500">rating</span>
                            </div>

                            {/* Reviews */}
                            <div className="flex flex-col items-center p-3 rounded-full bg-blue-50 w-24 h-24 mx-auto justify-center">
                                <FaComment className="text-xl" style={{ color: '#46C2DE' }} />
                                <span className="text-lg font-bold text-gray-900">{user.reviewsCount?.toLocaleString() || '4,942'}</span>
                                <span className="text-xs text-gray-500">reviews</span>
                            </div>
                        </div>

                        {/* About Doctor */}
                        {user.about && (
                            <div className="mt-6">
                                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <FaUserMd className="text-gray-500" style={{ color: '#46C2DE' }} /> About Me
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">{user.about}</p>
                            </div>
                        )}

                        {/* Service & Specialization */}
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-1">
                                    <FaBriefcase className="text-gray-400" style={{ color: '#46C2DE' }} /> Service
                                </h3>
                                <p className="text-sm text-gray-600">{user.service?.join(', ') || 'Medicine'}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-1">
                                    <FaStethoscope className="text-gray-400" style={{ color: '#46C2DE' }} /> Specialization
                                </h3>
                                <p className="text-sm text-gray-600">{user.specialty}</p>
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="mt-4">
                            <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-1">
                                <FaCalendarAlt className="text-gray-400" style={{ color: '#46C2DE' }} /> Availability
                            </h3>
                            <p className="text-sm text-gray-600">Monday to Friday, 10 AM to 5 PM</p>
                        </div>

                        {/* Contact Details (original) */}
                        <div className="border-t border-gray-200 mt-6 pt-6">
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
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3 capitalize">{user.gender}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Edit button */}
                        <div className="mt-6 text-center">
                            <button
                                className="px-6 py-2 rounded-md text-white font-medium hover:opacity-90 transition flex items-center gap-2 mx-auto cursor-pointer"
                                style={{ backgroundColor: '#46C2DE' }}
                            >
                                <FaUserMd /> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}