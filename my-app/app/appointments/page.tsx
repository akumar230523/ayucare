'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaClock, FaNotesMedical, FaBan, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';

interface Appointment {
    _id: string;
    doctorId: { _id: string; name: string; specialty?: string; iconUrl?: string };
    patientId: { _id: string; name: string; age?: number; gender?: string; problem?: string };
    doctorName: string;
    patientName: string;
    patientProblem?: string;
    date: string;
    time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AppointmentsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

    // Define fetchAppointments with useCallback so it can be used in useEffect and handleCancel
    const fetchAppointments = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/appointments?userId=${user._id}&role=${user.role}`);
            const data = await res.json();
            if (res.ok) {
                setAppointments(data);
            } 
            else {
                toast.error(data.message || 'Failed to load appointments');
            }
        } 
        catch (error) {
            toast.error('Network error!');
            console.error(error);
        } 
        finally {
            setLoading(false);
        }
    }, [user]); // Recreate when user changes

    useEffect(() => {
        if (!user) {
            router.push('/');
            return;
        }
        fetchAppointments();
    }, [user, router, fetchAppointments]); // Now includes all dependencies

    const handleCancel = async (appointmentId: string) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            const res = await fetch(`${API_URL}/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled' })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Appointment cancelled');
                fetchAppointments(); // refresh list
            } else {
                toast.error(data.message || 'Failed to cancel');
            }
        } catch (error) {
            toast.error('Network error');
            console.error(error);
        }
    };

    const filteredAppointments = appointments.filter(app => {
        if (activeTab === 'upcoming') return app.status === 'scheduled';
        if (activeTab === 'completed') return app.status === 'completed';
        return app.status === 'cancelled';
    });

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Header with back button */}
                    <div className="h-20 relative" style={{ backgroundColor: '#46C2DE' }}>
                        <div className="absolute top-4 left-4">
                            <Link
                                href={user.role === 'patient' ? '/patient/profile' : '/doctor/profile'}
                                className="text-white hover:opacity-80 flex items-center gap-1"
                            >
                                <span>← Back to Profile</span>
                            </Link>
                        </div>
                        <h1 className="text-white text-2xl font-bold text-center pt-4">My Appointments</h1>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        {(['upcoming', 'completed', 'cancelled'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 px-1 text-center font-medium text-sm capitalize transition
                                    ${activeTab === tab
                                        ? 'border-b-2 text-gray-900'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                style={activeTab === tab ? { borderColor: '#46C2DE' } : {}}
                            >
                                {tab}
                                {tab === 'upcoming' && <FaHourglassHalf className="inline ml-2" />}
                                {tab === 'completed' && <FaCheckCircle className="inline ml-2" />}
                                {tab === 'cancelled' && <FaBan className="inline ml-2" />}
                            </button>
                        ))}
                    </div>

                    {/* Appointments List */}
                    <div className="p-6">
                        {loading ? (
                            <div className="text-center py-10">Loading appointments...</div>
                        ) : filteredAppointments.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                No {activeTab} appointments found.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredAppointments.map(app => (
                                    <div key={app._id} className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            {/* Left: Doctor/Patient info */}
                                            <div className="flex items-center space-x-4">
                                                <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
                                                    <Image
                                                        src={
                                                            user.role === 'patient'
                                                                ? (app.doctorId?.iconUrl || '/default-avatar.png')
                                                                : '/default-avatar.png'  // For doctor viewing patient, always default
                                                        }
                                                        alt=""
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {user.role === 'patient' ? app.doctorName : app.patientName}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {user.role === 'patient'
                                                            ? (app.doctorId?.specialty || 'Doctor')
                                                            : `Patient · Age: ${app.patientId?.age || 'N/A'}`}
                                                    </p>
                                                    {app.patientProblem && (
                                                        <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                                                            <FaNotesMedical className="mt-0.5 flex-shrink-0" />
                                                            <span className="line-clamp-2">{app.patientProblem}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Middle: Date & Time */}
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <FaCalendarAlt style={{ color: '#46C2DE' }} />
                                                    <span>{app.date}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FaClock style={{ color: '#46C2DE' }} />
                                                    <span>{app.time}</span>
                                                </div>
                                            </div>

                                            {/* Right: Status & Cancel button */}
                                            <div className="flex items-center justify-end space-x-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                                                    ${app.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                                                        app.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                                    {app.status}
                                                </span>
                                                {app.status === 'scheduled' && (
                                                    <button
                                                        onClick={() => handleCancel(app._id)}
                                                        className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition"
                                                        style={{ backgroundColor: '#46C2DE' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}