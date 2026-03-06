'use client';

import Image from 'next/image';
import toast from 'react-hot-toast';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    FaUser, FaBriefcase, FaStar, FaComment, FaCheckCircle, FaTimesCircle,
    FaStethoscope, FaGraduationCap, FaCalendarAlt, FaAward, FaQuoteLeft
} from 'react-icons/fa';

interface Doctor {
    _id: string;
    name: string; about?: string; iconUrl?: string; gender?: string;
    degree?: string; service?: string[]; specialty?: string; expression?: string; 
    experienceYears?: number; patientsCount?: string; rating?: number; reviewsCount?: number; fee?: number;
    availableDays?: string[]; startTime?: string; endTime?: string; available?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// StatCard component
function StatCard({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
    return (
        <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm py-5 px-3 gap-1">
            <span className="text-lg text-primary">{icon}</span>
            <span className="text-xl font-bold text-gray-900 leading-tight">{value ?? '—'}</span>
            <span className="text-xs text-gray-400 font-medium">{label}</span>
        </div>
    );
}

export default function DoctorProfilePage() {
    const router = useRouter();
    const { doctorId } = useParams();
    const { user } = useAuth();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const toastShownRef = useRef(false);

    // Guard: check role + profile completeness before going to booking page
    const handleBookClick = async () => {
        // Not logged in
        if (!user) {
            toast.error('Sign in to book appointment.');
            router.push(`/signin?redirect=/appointment/${doctorId}/book`);
            return;
        }
        // Doctor trying to book
        if (user.role !== 'patient') {
            if (!toastShownRef.current) {
                toastShownRef.current = true;
                toast.error('Only patients can book appointments.');
            }
            return;
        }
        // Patient: check profile completeness
        if (user.profileId) {
            try {
                const res = await fetch(`${API_URL}/patients/${user.profileId}`);
                if (res.ok) {
                    const data = await res.json();
                    const incomplete =
                        !data.age ||
                        !data.gender ||
                        !data.allergies || data.allergies.length === 0 ||
                        !data.problems  || data.problems.length  === 0;
                    if (incomplete) {
                        toast.error('Complete your profile to secure your appointment.', { id: 'profile-incomplete' });
                        router.push('/patient/profile/update');
                        return;
                    }
                }
            } catch {
                // If fetch fails, let them proceed
            }
        }
        router.push(`/appointment/${doctorId}/book`);
    };

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await fetch(`${API_URL}/doctors/${doctorId}`);
                if (!res.ok) {
                    router.push('/404');
                    return;
                }
                const data = await res.json();
                setDoctor(data);
            } catch (error) {
                console.error(error);
                router.push('/404');
            } finally {
                setLoading(false);
            }
        };
        if (doctorId) fetchDoctor();
    }, [doctorId, router]);

    if (loading) return <div className="text-center py-20">Loading doctor information...</div>;
    if (!doctor) return <div className="text-center py-20">Doctor not found</div>;

    const availabilityText = (doctor.availableDays && doctor.startTime && doctor.endTime) ? (
        <>
            {doctor.availableDays.join(', ')} <br />
            {doctor.startTime} - {doctor.endTime}
        </>
    ) : 'Mon - Fri, 10 AM - 5 PM';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header ------------------------------------------------------------------------ */}
            <div className="bg-primary relative overflow-hidden pb-6 sm:pb-16 pt-6 sm:pt-10">
                <div className="absolute -top-8 -right-8 w-52 h-52 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute top-10 right-40 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -bottom-8 left-1/4 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
                <div className="container-custom">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5">
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl rounded-full border-2 border-white overflow-hidden shadow-xl flex-shrink-0">
                            <Image
                                src={doctor.iconUrl || '/default-avatar.png'}
                                alt={doctor.name}
                                fill
                                className="object-cover"
                                sizes="112px"
                            />
                        </div>
                        {/* Doctor name & expression */}
                        <div className="text-center sm:text-left sm:pb-4">
                            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">{doctor.name || '—'}</h1>
                            {doctor.expression && (
                                <p className="text-white text-xs italic mt-1 flex items-center gap-1 justify-center sm:justify-start">
                                    <FaQuoteLeft size={9} /> {doctor.expression}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section ----------------------------------------------------------------- */}
            <div className="container-custom py-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard icon={<FaUser />} value={doctor.patientsCount} label="Patients" />
                    <StatCard icon={<FaBriefcase />} value={doctor.experienceYears ? `${doctor.experienceYears}+` : '—'} label="Yrs Exp." />
                    <StatCard icon={<FaStar />} value={doctor.rating?.toFixed(1) ?? '—'} label="Rating" />
                    <StatCard icon={<FaComment />} value={doctor.reviewsCount?.toLocaleString() ?? '—'} label="Reviews" />
                </div>
            </div>

            {/* Main content ------------------------------------------------------------------ */}
            <div className="container-custom pb-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left column */}
                    <div className="card p-6 md:col-span-2 flex flex-col sm:justify-between gap-6">
                        {doctor.about && (
                            <div>
                                <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-1">
                                    <FaAward className="text-primary" />
                                    About
                                </h2>
                                <p className="text-sm text-gray-600 leading-relaxed">{doctor.about}</p>
                            </div>
                        )}


                        {doctor.gender && (
                            <div>
                                <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-1">
                                    <FaUser className="text-primary" />
                                    Gender
                                </h2>
                                <p className="text-sm text-gray-600 capitalize">{doctor.gender}</p>
                            </div>
                        )}

                        {doctor.degree && (
                            <div>
                                <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-1">
                                    <FaGraduationCap className="text-primary" />
                                    Qualifications
                                </h2>
                                <p className="text-sm text-gray-600">{doctor.degree}</p>
                            </div>
                        )}

                        <div>
                            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-1">
                                <FaStethoscope className="text-primary" />
                                Services & Specialization
                            </h2>
                            <div className="space-y-3">
                                {doctor.service && doctor.service.length > 0 && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700 sm:min-w-[110px]">Services:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {doctor.service.map((s, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {doctor.specialty && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700 sm:min-w-[110px]">Specialization:</span>
                                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm">
                                            {doctor.specialty}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Right column */}
                    <div className="space-y-6">
                        {/*  */}
                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                                <FaCalendarAlt className="text-primary" />
                                Availability
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{availabilityText}</p>
                            <div className="flex items-center gap-2">
                                {doctor.available ? (
                                    <>
                                        <FaCheckCircle className="text-green-500" />
                                        <span className="text-green-600 font-medium">Available</span>
                                    </>
                                ) : (
                                    <>
                                        <FaTimesCircle className="text-red-500" />
                                        <span className="text-red-600 font-medium">Unavailable</span>
                                    </>
                                )}
                            </div>
                            {doctor.fee && (
                                <div className="mt-3 text-sm text-gray-600">
                                    <span className="font-medium">Consultation Fee:</span> ₹{doctor.fee}
                                </div>
                            )}
                        </div>
                        {/*  */}
                        <div className="bg-primary rounded-2xl p-6">
                            <h3 className="font-semibold text-white mb-2">Ready to book?</h3>
                            <p className="text-sm text-white mb-4">
                                Choose a convenient time for your consultation.
                            </p>
                            <button
                                onClick={handleBookClick}
                                className="block w-full text-center px-4 py-3 bg-white text-black font-medium rounded-lg transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
                            >
                                Book Appointment
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );

}