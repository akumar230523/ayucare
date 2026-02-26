'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaBriefcase } from 'react-icons/fa';

interface Doctor {
    _id: string;
    name: string;
    specialty?: string;
    expression?: string;
    rating?: number;
    experienceYears?: number;
    iconUrl?: string;
    about?: string;
}

interface DoctorCardProps {
    doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {

    const handleBookClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="p-6">
                <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
                        <Image
                            src={doctor.iconUrl || '/default-avatar.png'}
                            alt={doctor.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-sm" style={{ color: '#46C2DE' }}>{doctor.specialty || '-'}</p>
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
                <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <span className="text-sm text-gray-600">{doctor.rating ?? 'null'}</span>
                            <FaStar className="text-yellow-400" />
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <FaBriefcase className="text-gray-400" />
                            <span>{doctor.experienceYears ?? 'null'} years</span>
                        </div>
                    </div>
                    <Link href={`/appointment/${doctor._id}`} onClick={handleBookClick}>
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