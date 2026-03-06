'use client';

import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    FaArrowRight, FaBriefcase, FaCalendarAlt, FaCalendarCheck, FaClock, FaComment, FaEdit, FaEnvelope,
    FaGraduationCap, FaHourglassHalf, FaListAlt,
    FaPauseCircle, FaPhone, FaQuoteLeft, FaRupeeSign, FaStar, FaStethoscope,
    FaUser, FaUserMd, FaVenusMars
} from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';


interface DoctorData {
    _id: string;
    name: string; about?: string; iconUrl?: string; gender?: string;
    degree?: string; service?: string[]; specialty?: string; expression?: string;
    experienceYears?: number; patientsCount?: string; rating?: number; reviewsCount?: number; fee?: number;
    availableDays?: string[]; startTime?: string; endTime?: string; duration?: number; breakDuration?: number;
    appointmentTypes?: string[]; consultationTypes?: string[]; available: boolean;
    bookedSlots?: { date: string; startTime: string }[];
}

// Helper to convert 24h time to 12h format
const to12Hour = (t?: string) => {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

// Helper to check if profile is complete for activation
const isProfileComplete = (doctor: DoctorData) => {
    const required: (keyof DoctorData)[] = [
        'degree', 'specialty', 'service',
        'experienceYears', 'patientsCount', 'fee',
        'availableDays', 'startTime', 'endTime', 'duration', 'breakDuration'
    ];
    for (const field of required) {
        const value = doctor[field];
        if (value == null) return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === 'number' && value <= 0) return false;
    }
    return true;
};

// Helper Components ──────────────────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
    return (
        <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm py-5 px-3 gap-1">
            <span className="text-lg text-primary">{icon}</span>
            <span className="text-xl font-bold text-gray-800 leading-tight">{value ?? '—'}</span>
            <span className="text-xs text-gray font-medium">{label}</span>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer
                ${active ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
            `}
        >
            <span className={active ? 'text-white' : 'text-gray-500'}>{icon}</span>
            {label}
        </button>
    );
}

function FieldRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
            <div className="text-primary">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-500">{label}</p>
                <div className="text-sm text-gray leading-relaxed mt-0.5">{value || 'NA'}</div>
            </div>
        </div>
    );
}
// ────────────────────────────────────────────────────────────────────────────────────────────────


export default function DoctorProfile() {
    const router = useRouter();
    const { user } = useAuth();
    const [doctor, setDoctor] = useState<DoctorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'appointment'>('profile');

    useEffect(() => {
        if (!user) router.push('/');
        else if (user.role !== 'doctor') router.push('/patient/profile');
    }, [user, router]);

    useEffect(() => {
        const uid = user?._id;
        if (!uid) return;
        const fetchDoctor = async () => {
            try {
                const res = await fetch(`${API_URL}/doctors/user/${uid}`);
                if (res.status === 404) {
                    setDoctor({ _id: user.profileId, name: user.name, available: false } as DoctorData);
                    return;
                }
                if (!res.ok) throw new Error('Failed to fetch doctor.');
                const data = await res.json();
                setDoctor(data);
            } catch (error) {
                console.error(error);
                toast.error('Could not load doctor data.');
                setDoctor({ _id: user.profileId, name: user.name, available: false } as DoctorData);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [user]);

    const handleToggleStatus = async () => {
        if (!doctor) return;

        if (!doctor.available && !isProfileComplete(doctor)) {
            toast.error('Complete your profile to activate your account.');
            return;
        }

        setToggling(true);
        try {
            const res = await fetch(`${API_URL}/doctors/${doctor._id}/availability`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ available: !doctor.available }),
            });

            const data = await res.json();

            if (res.ok) {
                setDoctor(data.doctor); // update local state
                toast.success(`Status set to ${data.doctor.available ? 'Active' : 'Inactive'}`);
            } else {
                toast.error(data.message || 'Failed to update status.');
            }
        } catch {
            toast.error('Network error!');
        } finally {
            setToggling(false);
        }
    };

    if (!user || user.role !== 'doctor') return null;
    if (loading) return <div className="text-center py-20">Loading profile...</div>;
    if (!doctor) return <div className="text-center py-20">Doctor not found</div>;

    const d = doctor;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header ------------------------------------------------------------------------ */}
            <div className="bg-primary relative overflow-hidden pb-6 sm:pb-16 pt-6 sm:pt-10">
                <div className="absolute -top-8 -right-8 w-52 h-52 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute top-10 right-40 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -bottom-8 left-1/4 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
                <div className="container-custom">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5">
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-white overflow-hidden shadow-xl flex-shrink-0">
                            <Image
                                src={d.iconUrl || '/default-avatar.png'}
                                alt={d.name}
                                fill
                                className="object-cover"
                                sizes="112px"
                            />
                        </div>
                        <div className="text-center sm:text-left sm:pb-4">
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">{d.name}</h1>
                                <Link href="/doctor/profile/update">
                                    <button className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition flex-shrink-0 cursor-pointer" title='Update'>
                                        <FaEdit className="text-white text-xs" />
                                    </button>
                                </Link>
                            </div>
                            {d.expression && (
                                <p className="text-white text-xs italic mt-1 flex items-center gap-1 justify-center sm:justify-start">
                                    <FaQuoteLeft size={10} /> {d.expression}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section ----------------------------------------------------------------- */}
            <div className="container-custom py-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard icon={<FaUser />} value={d.patientsCount} label="Patients" />
                    <StatCard icon={<FaBriefcase />} value={d.experienceYears ? `${d.experienceYears}+` : '—'} label="Yrs Exp." />
                    <StatCard icon={<FaStar />} value={d.rating} label="Rating" />
                    <StatCard icon={<FaComment />} value={d.reviewsCount?.toLocaleString()} label="Reviews" />
                </div>
            </div>

            {/* Tab Navigation ---------------------------------------------------------------- */}
            <div className="container-custom mb-6 overflow-x-auto">
                <div className="flex gap-2 pb-2">
                    <TabButton
                        active={activeTab === 'profile'}
                        onClick={() => setActiveTab('profile')}
                        icon={<FaUser size={14} />}
                        label="Profile"
                    />
                    <TabButton
                        active={activeTab === 'appointment'}
                        onClick={() => setActiveTab('appointment')}
                        icon={<FaCalendarAlt size={14} />}
                        label="Appointment"
                    />
                </div>
            </div>

            {/* Main Content ------------------------------------------------------------------ */}
            <div className="container-custom pb-8 grid lg:grid-cols-3 gap-8">
                {/* Left Column -------------------------------------- */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-xs font-bold text-gray uppercase tracking-widest mb-2">Professional</h2>
                            <FieldRow icon={<FaUserMd />} label="About Me" value={d.about} />
                            <FieldRow icon={<FaVenusMars />} label="Gender" value={d.gender} />
                            <FieldRow icon={<FaGraduationCap />} label="Qualifications" value={d.degree} />
                            <FieldRow icon={<FaBriefcase />} label="Services" value={d.service?.join(', ')} />
                            <FieldRow icon={<FaStethoscope />} label="Specialization" value={d.specialty} />
                        </div>
                    )}
                    {/* Appointment Tab */}
                    {activeTab === 'appointment' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-xs font-bold text-gray uppercase tracking-widest mb-2">Appointment</h2>
                            <FieldRow icon={<FaCalendarAlt />} label="Available Days" value={d.availableDays?.join(', ')} />
                            <FieldRow icon={<FaClock />} label="Consulting Hours" value={d.startTime && `${to12Hour(d.startTime)} - ${to12Hour(d.endTime)}`} />
                            <FieldRow icon={<FaHourglassHalf />} label="Slot Duration" value={d.duration && `${d.duration} min`} />
                            <FieldRow icon={<FaPauseCircle />} label="Break Duration" value={d.breakDuration && `${d.breakDuration} min`} />
                            <FieldRow icon={<FaRupeeSign />} label="Consultation Fee" value={d.fee} />
                            <FieldRow icon={<FaListAlt />} label="Appointment Types" value={d.appointmentTypes?.join(', ')} />
                            <FieldRow icon={<FaUserMd />} label="Consultation Types" value={d.consultationTypes?.join(', ')} />
                        </div>
                    )}
                </div>

                {/* Right Column ------------------------------------- */}
                <div className="space-y-6">
                    {/* Contact */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-xs font-bold text-gray uppercase tracking-widest mb-2">Contact</h2>
                        <FieldRow icon={<FaEnvelope />} label="Email" value={user.email} />
                        <FieldRow icon={<FaPhone />} label="Mobile" value={user.mobile} />
                    </div>
                    {/* Availability Status */}
                    <div className="p-5 rounded-2xl bg-primary text-white transition-all">
                        <div className="flex items-start justify-between">
                            <p className="font-semibold text-white">Availability Status</p>
                            <button
                                onClick={handleToggleStatus}
                                disabled={toggling}
                                className={`px-2 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 bg-white cursor-pointer 
                                    ${d.available ? 'text-primary' : ' text-red-500'}
                                `}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${d.available ? 'bg-primary ' : 'bg-red-500'}`} />
                                {toggling ? '...' : d.available ? 'Active' : 'Inactive'}
                            </button>
                        </div>
                        <p className="text-sm text-gray leading-relaxed mt-1">
                            {d.available ? 'You are available for new appointments' : 'You are currently not accepting appointments'}
                        </p>
                    </div>
                    {/* Appointments */}
                    <Link href="/appointments"
                        className="flex items-center justify-between bg-white rounded-2xl border border-primary/20 shadow-sm p-5 hover:border-primary/50 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-2">
                            <FaCalendarCheck className="text-primary" />
                            <div>
                                <p className="font-semibold text-gray-500">My Appointments</p>
                                <p className="text-sm text-gray leading-relaxed mt-0.5">View all patient bookings &amp; history</p>
                            </div>
                        </div>
                        <FaArrowRight className="text-gray-300 group-hover:text-primary transition-colors" />
                    </Link>
                </div>

            </div>
        </div>
    );

}