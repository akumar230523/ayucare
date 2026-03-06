'use client';

import Image from 'next/image';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import {
    FaBan, FaCalendarAlt, FaCheckCircle, FaClock, FaHourglassHalf,
    FaMapMarkerAlt, FaPhone, FaUserMd, FaUsers, FaVideo,
} from 'react-icons/fa';

interface Appointment {
    _id: string;
    doctorId: { _id: string; name: string; specialty?: string; iconUrl?: string };
    patientId: { _id: string; name: string; age?: number; gender?: string; iconUrl?: string };
    doctorName: string;
    patientName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    appointmentType: 'Individual' | 'Group';
    visitType: 'New' | 'Repeat';
    consultationType: 'Video' | 'Audio' | 'In-person';
    createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const to12Hour = (t: string): string => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${period}`;
};

const formatDate = (d: string): string => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
};

function ConsultIcon({ type }: { type: string }) {
    if (type === 'Video') return <FaVideo className="text-[10px]" />;
    if (type === 'Audio') return <FaPhone className="text-[10px]" />;
    if (type === 'In-person') return <FaMapMarkerAlt className="text-[10px]" />;
    return null;
}

const STATUS = {
    Scheduled: {
        label: 'Upcoming',
        badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        bar: 'bg-emerald-400',
    },
    Completed: {
        label: 'Completed',
        badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
        bar: 'bg-primary',
    },
    Cancelled: {
        label: 'Cancelled',
        badge: 'bg-red-50 text-red-700 ring-1 ring-red-200',
        bar: 'bg-red-400',
    },
} as const;

function TabPill({ count }: { count: number }) {
    if (count === 0) return null;
    return (
        <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold">
            {count > 9 ? '9+' : count}
        </span>
    );
}

const TABS = [
    { key: 'Scheduled' as const, label: 'Upcoming',  icon: <FaHourglassHalf /> },
    { key: 'Completed' as const, label: 'Completed', icon: <FaCheckCircle /> },
    { key: 'Cancelled' as const, label: 'Cancelled', icon: <FaBan /> },
];

export default function AppointmentsPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Scheduled' | 'Completed' | 'Cancelled'>('Scheduled');

    const fetchAppointments = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/appointments?userId=${user._id}&role=${user.role}`);
            const data = await res.json();
            if (res.ok) {
                setAppointments(data);
            } else {
                toast.error(data.message || 'Failed to load appointments.');
            }
        } catch {
            toast.error('Network error!');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) { router.push('/'); return; }
        fetchAppointments();
    }, [user, router, fetchAppointments]);

    const counts = {
        Scheduled: appointments.filter(a => a.status === 'Scheduled').length,
        Completed: appointments.filter(a => a.status === 'Completed').length,
        Cancelled: appointments.filter(a => a.status === 'Cancelled').length,
    };

    const filtered = appointments.filter(a => a.status === activeTab);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header + Tabs --------------------------------------------------------------- -*/}
            <div className="bg-white border-b border-gray-100 shadow-sm">
                <div className="container-custom">
                    <div className="pt-8 pb-0">
                        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">
                            {user.role === 'patient' ? 'Patient Portal' : 'Doctor Portal'}
                        </p>
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h1>
                    </div>

                    <div className="flex gap-1 overflow-x-auto">
                        {TABS.map(tab => {
                            const active = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer
                                        ${ active ? 'border-primary text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200' }
                                    `}
                                >
                                    <span className={active ? 'text-primary' : ''}>{tab.icon}</span>
                                    {tab.label}
                                    {tab.key === 'Scheduled' && <TabPill count={counts.Scheduled} />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content ----------------------------------------------------------------------- */}
            <div className="container-custom py-8">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card p-5 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                                    </div>
                                    <div className="h-8 bg-gray-200 rounded-xl w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                            {activeTab === 'Scheduled'  && <FaHourglassHalf className="text-2xl text-gray-300" />}
                            {activeTab === 'Completed' && <FaCheckCircle className="text-2xl text-gray-300" />}
                            {activeTab === 'Cancelled' && <FaBan className="text-2xl text-gray-300" />}
                        </div>
                        <p className="text-gray-400 font-medium">
                            No {activeTab.toLowerCase()} appointments yet
                        </p>
                        {activeTab === 'Scheduled' && user.role === 'patient' && (
                            <button
                                onClick={() => router.push('/doctors')}
                                className="btn-primary mt-4 px-5 py-2 cursor-pointer"
                            >
                                Book an Appointment
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((app, idx) => {
                            const isPatient = user.role === 'patient';
                            const name = isPatient ? app.doctorName : app.patientName;
                            const subtitle = isPatient
                                ? (app.doctorId?.specialty || '')
                                : [app.patientId?.gender, app.patientId?.age ? `${app.patientId.age} yrs` : ''].filter(Boolean).join(' • ');
                            const avatarSrc = isPatient
                                ? (app.doctorId?.iconUrl || '/default-avatar.png')
                                : (app.patientId?.iconUrl || '/default-avatar.png');
                            const st = STATUS[app.status];

                            return (
                                <div
                                    key={app._id}
                                    onClick={() => router.push(`/appointments/${app._id}`)}
                                    className="group card overflow-hidden cursor-pointer"
                                    style={{ animationDelay: `${idx * 40}ms` }}
                                >
                                    <div className="flex">
                                        {/* Status bar */}
                                        <div className={`w-1 flex-shrink-0 rounded-l-2xl ${st.bar}`} />

                                        <div className="flex-1 p-5">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                {/* Avatar + name */}
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                                                        <Image
                                                            src={avatarSrc}
                                                            alt={name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="56px"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                                                            {name}
                                                        </p>
                                                        <p className="text-sm text-gray-400 capitalize truncate">{subtitle}</p>
                                                        <div className="flex items-center gap-1.5 mt-1.5">
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-medium">
                                                                <ConsultIcon type={app.consultationType} />
                                                                {app.consultationType.replace('-', ' ')}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-medium">
                                                                {app.appointmentType === 'Group'
                                                                    ? <FaUsers className="text-[10px]" />
                                                                    : <FaUserMd className="text-[10px]" />}
                                                                {app.appointmentType}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Date & time */}
                                                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 flex-shrink-0">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                        <FaCalendarAlt className="text-primary text-xs flex-shrink-0" />
                                                        <span className="font-medium text-gray-700">{formatDate(app.date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                        <FaClock className="text-primary text-xs flex-shrink-0" />
                                                        <span>{to12Hour(app.startTime)}{app.endTime ? ` - ${to12Hour(app.endTime)}` : ''}</span>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );

}