'use client';

import { useParams, useRouter } from 'next/navigation';
import { users } from '@/data/users';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { FaUser, FaBriefcase, FaStar, FaComment, FaCalendarAlt, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AppointmentPage() {
    const { doctorId } = useParams();
    const { user } = useAuth();
    const router = useRouter();

    // Compute doctor from params – stable across renders
    const doctor = useMemo(() => {
        const id = Array.isArray(doctorId) ? doctorId[0] : doctorId;
        return users.find(u => u.id === id && u.role === 'doctor') || null;
    }, [doctorId]);

    // Redirect if doctor not found
    useEffect(() => {
        if (!doctor) {
            router.push('/404');
        }
    }, [doctor, router]);

    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            router.push(`/login?redirect=/appointment/${doctorId}`);
        }
    }, [user, doctorId, router]);

    // Handle non‑patient access with toast
    useEffect(() => {
        if (user && user.role !== 'patient') {
            toast.error('Only patients can book appointments.', {
                duration: 3000,
                position: 'top-center',
            });
            const timer = setTimeout(() => {
                router.push('/');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [user, router]);

    // If user is not a patient, don't render the page content (toast + redirect is enough)
    if (user && user.role !== 'patient') {
        return null;
    }

    if (!doctor) return <div className="text-center py-20">Loading doctor information...</div>;

    const handleBook = () => {
        if (!selectedDate || !selectedSlot) {
            toast.error('Please select a date and time slot.');
            return;
        }

        const appointment = {
            id: Date.now().toString(),
            doctorId: doctor.id,
            doctorName: doctor.name,
            patientId: user!.id,
            patientName: user!.name,
            date: selectedDate,
            slot: selectedSlot,
            bookedAt: new Date().toISOString(),
        };

        const existing = JSON.parse(localStorage.getItem('appointments') || '[]');
        existing.push(appointment);
        localStorage.setItem('appointments', JSON.stringify(existing));
        toast.success('Appointment booked successfully!');
        setSelectedDate(null);
        setSelectedSlot(null);
    };

    // Static calendar for July 2023
    const month = 'July 2023';
    const daysInMonth = 31;
    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyCells = 5; // 1st July was Saturday

    const Slots = [
        '10:00 AM - 10:15 AM',
        '10:30 AM - 10:45 AM',
        '11:00 AM - 11:15 AM',
        '11:30 AM - 11:45 AM',
        '12:00 PM - 12:15 PM',
        '12:30 PM - 12:45 PM',
        '01:00 PM - 01:15 PM',
        '01:30 PM - 01:45 PM',
        '03:00 PM - 03:15 PM',
        '03:30 PM - 03:45 PM',
        '04:00 PM - 04:15 PM',
        '04:30 PM - 04:45 PM',
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Doctor Information Card */}
                <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-8">
                    {/* Header with theme color */}
                    <div className="h-20" style={{ backgroundColor: '#46C2DE' }}></div>

                    <div className="px-6 py-8 relative">
                        {/* Avatar - positioned over the header */}
                        <div className="flex justify-center -mt-14 mb-4">
                            <div className="relative w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                                <Image
                                    src={doctor.iconUrl}
                                    alt={doctor.name}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                />
                            </div>
                        </div>

                        {/* Doctor Basic Info */}
                        <h1 className="text-2xl font-bold text-center text-gray-900">{doctor.name}</h1>
                        <p className="text-center text-lg" style={{ color: '#46C2DE' }}>
                            {doctor.specialty}
                        </p>
                        <p className="text-center text-sm text-gray-600 mt-1">{doctor.degree}</p>

                        {/* Stats Row - Light blue circular cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                            {/* Patients */}
                            <div className="flex flex-col items-center p-3 rounded-full bg-blue-50 w-24 h-24 mx-auto justify-center">
                                <FaUser className="text-xl" style={{ color: '#46C2DE' }} />
                                <span className="text-lg font-bold text-gray-900">
                                    {doctor.patientsCount || '5,000+'}
                                </span>
                                <span className="text-xs text-gray-500">patients</span>
                            </div>

                            {/* Experience */}
                            <div className="flex flex-col items-center p-3 rounded-full bg-blue-50 w-24 h-24 mx-auto justify-center">
                                <FaBriefcase className="text-xl" style={{ color: '#46C2DE' }} />
                                <span className="text-lg font-bold text-gray-900">{doctor.experienceYears}+</span>
                                <span className="text-xs text-gray-500">years</span>
                            </div>

                            {/* Rating */}
                            <div className="flex flex-col items-center p-3 rounded-full bg-blue-50 w-24 h-24 mx-auto justify-center">
                                <FaStar className="text-xl" style={{ color: '#46C2DE' }} />
                                <span className="text-lg font-bold text-gray-900">{doctor.rating}</span>
                                <span className="text-xs text-gray-500">rating</span>
                            </div>

                            {/* Reviews */}
                            <div className="flex flex-col items-center p-3 rounded-full bg-blue-50 w-24 h-24 mx-auto justify-center">
                                <FaComment className="text-xl" style={{ color: '#46C2DE' }} />
                                <span className="text-lg font-bold text-gray-900">
                                    {doctor.reviewsCount?.toLocaleString() || '4,942'}
                                </span>
                                <span className="text-xs text-gray-500">reviews</span>
                            </div>
                        </div>

                        {/* About Doctor */}
                        <div className="mt-6">
                            <h2 className="font-semibold text-gray-900">About Doctor</h2>
                            <p className="text-sm text-gray-600 mt-1">{doctor.about}</p>
                        </div>

                        {/* Service & Specialization */}
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-sm text-gray-700">Service</h3>
                                <p className="text-sm text-gray-600">{doctor.service?.join(', ') || 'Medicine'}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-gray-700">Specialization</h3>
                                <p className="text-sm text-gray-600">{doctor.specialty}</p>
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="mt-4">
                            <h3 className="font-semibold text-sm text-gray-700">Availability For Consulting</h3>
                            <p className="text-sm text-gray-600">Monday to Friday, 10 AM to 5 PM</p>
                        </div>
                    </div>
                </div>

                {/* Booking Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h2>

                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-500" style={{ color: '#46C2DE' }} /> {month}
                    </h3>

                    {/* Calendar */}
                    <div className="grid grid-cols-7 gap-2 mb-6">
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                            <div key={day} className="text-center font-semibold text-sm text-gray-600">
                                {day}
                            </div>
                        ))}
                        {Array(emptyCells)
                            .fill(null)
                            .map((_, i) => (
                                <div key={`empty-${i}`} className="p-2"></div>
                            ))}
                        {dates.map(date => (
                            <button
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                className={`p-2 text-center rounded-md transition ${selectedDate === date ? 'text-white' : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                style={selectedDate === date ? { backgroundColor: '#46C2DE' } : {}}
                            >
                                {date}
                            </button>
                        ))}
                    </div>

                    {selectedDate && (
                        <>
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <FaClock className="text-gray-500" style={{ color: '#46C2DE' }} /> Select slot
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                                {Slots.map(slot => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`p-2 text-sm border rounded-md transition ${selectedSlot === slot
                                            ? 'text-white border-transparent'
                                            : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                        style={selectedSlot === slot ? { backgroundColor: '#46C2DE' } : {}}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleBook}
                                className="w-full py-3 text-white font-medium rounded-md hover:opacity-90 transition cursor-pointer"
                                style={{ backgroundColor: '#46C2DE' }}
                            >
                                Book Appointment
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}