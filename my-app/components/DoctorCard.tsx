'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaBriefcase } from 'react-icons/fa';

interface Doctor { _id: string; iconUrl?: string; name: string; specialty?: string; about?: string; expression?: string; rating?: number; experienceYears?: number; fee?: number; }

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
    return (
        <Link
            href={`/appointment/${doctor._id}`}
            className="group card block"
        >
            <div className="p-5">

                <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                        <Image
                            src={doctor.iconUrl || '/default-avatar.png'}
                            alt={doctor.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                            {doctor.name}
                        </h3>
                        <p className="text-sm text-primary font-medium">{doctor.specialty || '—'}</p>
                        {doctor.expression && (
                            <p className="text-xs text-gray-400 italic truncate mt-0.5">
                                &ldquo;{doctor.expression}&rdquo;
                            </p>
                        )}
                    </div>
                </div>

                {doctor.about && (
                    <p className="mt-3 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {doctor.about}
                    </p>
                )}

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" />
                        <span className="font-medium">{doctor.rating?.toFixed(1) ?? '0.0'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <FaBriefcase className="text-gray-400" />
                        <span>{doctor.experienceYears ?? 0} yrs</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                        {/* <FaDollarSign className="text-gray-400" /> */}
                        <span>₹{doctor.fee ?? 0}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}