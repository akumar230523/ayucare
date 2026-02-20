'use client';

import Image from 'next/image';
import Link from 'next/link';
import { User } from '@/data/users';
import { FaStar, FaBriefcase } from 'react-icons/fa';

interface DoctorCardProps {
    doctor: User;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
    const renderRating = (rating: number = 0) => {
        return (
            <div className="flex items-center space-x-1">
                <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
                <FaStar className="text-yellow-400 text-sm" />
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="p-6">
                <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
                        <Image
                            src={doctor.iconUrl}
                            alt={doctor.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-sm" style={{ color: '#46C2DE' }}>{doctor.specialty}</p>
                        {doctor.expression && (
                            <p className="text-sm text-gray-500 italic">
                                &ldquo;{doctor.expression}&rdquo;
                            </p>
                        )}
                    </div>
                </div>

                {/* About with 2-line truncation */}
                {doctor.about && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{doctor.about}</p>
                )}

                {/* Rating and Experience */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {doctor.rating && renderRating(doctor.rating)}
                        {doctor.experienceYears && (
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <FaBriefcase className="text-gray-400" />
                                <span>{doctor.experienceYears} years</span>
                            </div>
                        )}
                    </div>
                    <Link href={`/appointment/${doctor.id}`}>
                        <button
                            className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition cursor-pointer"
                            style={{ backgroundColor: '#46C2DE' }}
                        >
                            Book Appointment
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}