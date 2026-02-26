'use client';

import Image from 'next/image';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { FaUser, FaBriefcase, FaStar, FaComment, FaCalendarAlt, FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Doctor {
    _id: string;
    name: string;
    specialty?: string;
    degree?: string;
    patientsCount?: string;
    experienceYears?: number;
    rating?: number;
    reviewsCount?: number;
    about?: string;
    service?: string[];
    iconUrl?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get month name and year
const getMonthYear = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

// Generate days in month
const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
};

// Get first day of month (0 = Sunday, 1 = Monday, ...)
const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
};

// Format date as YYYY-MM-DD
const formatDate = (day: number, monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = String(monthDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
};

export default function AppointmentPage() {
    const { doctorId } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [problem, setProblem] = useState(''); // 👈 added state for problem description

    // Month navigation state
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Fetch doctor details
    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await fetch(`${API_URL}/users/doctors/${doctorId}`);
                if (!res.ok) {
                    router.push('/404');
                    return;
                }
                const data = await res.json();
                setDoctor(data);
            } 
            catch (error) {
                console.error('Failed to fetch doctor:', error);
                router.push('/404');
            } 
            finally {
                setLoading(false);
            }
        };
        if (doctorId) fetchDoctor();
    }, [doctorId, router]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!user && !loading) {
            router.push(`/signin?redirect=/appointment/${doctorId}`);
        }
    }, [user, loading, doctorId, router]);

    // Handle doctor trying to book
    useEffect(() => {
        if (user && user.role !== 'patient') {
            toast.error('Only patients can book appointments.', { duration: 3000 });
            const timer = setTimeout(() => router.push('/'), 2000);
            return () => clearTimeout(timer);
        }
    }, [user, router]);

    // Booking handler
    const handleBook = async () => {
        if (!selectedDate || !selectedSlot) {
            toast.error('Please select a date and time slot.');
            return;
        }
        if (!problem.trim()) {
            toast.error('Please describe your problem briefly.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: user?.profileId,      // use profileId from logged-in user
                    doctorId: doctor?._id,
                    date: formatDate(selectedDate, currentMonth),
                    time: selectedSlot,
                    patientProblem: problem
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Appointment booked successfully!');
                setSelectedDate(null);
                setSelectedSlot(null);
                setProblem('');
                router.push('/appointments');
            } 
            else {
                toast.error(data.message || 'Booking failed.');
            }
        } 
        catch (error) {
            toast.error('Network error. Please try again.');
            console.error(error);
        }
    };

    // Check if a given day of the current month is in the past
    const isDatePast = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // start of today
        return date < today;
    };

    // Calendar calculations
    const monthName = getMonthYear(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayIndex = getFirstDayOfMonth(currentMonth);
    const emptyCells = firstDayIndex;

    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
        setSelectedDate(null); // Reset selected date when month changes
        setSelectedSlot(null);
        setProblem('');
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
        setSelectedDate(null);
        setSelectedSlot(null);
        setProblem('');
    };

    const Slots = [ '10:00 AM - 10:15 AM', '10:30 AM - 10:45 AM', '11:00 AM - 11:15 AM', '11:30 AM - 11:45 AM', 
                    '12:00 PM - 12:15 PM', '12:30 PM - 12:45 PM', '01:00 PM - 01:15 PM', '01:30 PM - 01:45 PM', 
                    '03:00 PM - 03:15 PM', '03:30 PM - 03:45 PM', '04:00 PM - 04:15 PM', '04:30 PM - 04:45 PM',
    ];

    if (loading) return <div className="text-center py-20">Loading doctor information...</div>;
    if (!doctor) return <div className="text-center py-20">Doctor not found</div>;
    if (user && user.role !== 'patient') return null; // Don't render content for non-patients

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Doctor Information Card */}
                <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-8">
                    <div className="h-20" style={{ backgroundColor: '#46C2DE' }}></div>
                    <div className="px-6 py-8 relative">
                        <div className="flex justify-center -mt-14 mb-4">
                            <div className="relative w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                                <Image
                                    src={doctor.iconUrl || '/default-avatar.png'}
                                    alt={doctor.name}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-center text-gray-900">{doctor.name}</h1>
                        <p className="text-center text-lg" style={{ color: '#46C2DE' }}>
                            {doctor.specialty || '-'}
                        </p>
                        <p className="text-center text-sm text-gray-600 mt-1">{doctor.degree || '-'}</p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                            <div className="flex flex-col items-center p-3 rounded-full bg-blue-50 w-24 h-24 mx-auto justify-center">
                                <FaUser className="text-xl" style={{ color: '#46C2DE' }} />
                                <span className="text-lg font-bold text-gray-900">{doctor.patientsCount || '0'}</span>
                                <span className="text-xs text-gray-500">patients</span>
                            </div>
                            <div className="flex flex-col items-center p-3 rounded-full bg-blue-50 w-24 h-24 mx-auto justify-center">
                                <FaBriefcase className="text-xl" style={{ color: '#46C2DE' }} />
                                <span className="text-lg font-bold text-gray-900">{doctor.experienceYears ?? 0}+</span>
                                <span className="text-xs text-gray-500">years</span>
                            </div>
                            <div className="flex flex-col items-center p-3 rounded-full bg-blue-50 w-24 h-24 mx-auto justify-center">
                                <FaStar className="text-xl" style={{ color: '#46C2DE' }} />
                                <span className="text-lg font-bold text-gray-900">{doctor.rating ?? '-'}</span>
                                <span className="text-xs text-gray-500">rating</span>
                            </div>
                            <div className="flex flex-col items-center p-3 rounded-full bg-blue-50 w-24 h-24 mx-auto justify-center">
                                <FaComment className="text-xl" style={{ color: '#46C2DE' }} />
                                <span className="text-lg font-bold text-gray-900">{doctor.reviewsCount?.toLocaleString() || '0'}</span>
                                <span className="text-xs text-gray-500">reviews</span>
                            </div>
                        </div>

                        {/* About */}
                        {doctor.about && (
                            <div className="mt-6">
                                <h2 className="font-semibold text-gray-900">About Doctor</h2>
                                <p className="text-sm text-gray-600 mt-1">{doctor.about}</p>
                            </div>
                        )}

                        {/* Service & Specialization */}
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-sm text-gray-700">Service</h3>
                                <p className="text-sm text-gray-600">{doctor.service?.join(', ') || '-'}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-gray-700">Specialization</h3>
                                <p className="text-sm text-gray-600">{doctor.specialty || '-'}</p>
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

                    {/* Month navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={prevMonth}
                            className="p-2 rounded-full hover:bg-gray-100 transition"
                        >
                            <FaChevronLeft className="text-gray-600" />
                        </button>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-500" style={{ color: '#46C2DE' }} /> {monthName}
                        </h3>
                        <button
                            onClick={nextMonth}
                            className="p-2 rounded-full hover:bg-gray-100 transition"
                        >
                            <FaChevronRight className="text-gray-600" />
                        </button>
                    </div>

                    {/* Calendar */}
                    <div className="grid grid-cols-7 gap-2 mb-6">
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                            <div key={day} className="text-center font-semibold text-sm text-gray-600">
                                {day}
                            </div>
                        ))}
                        {Array(emptyCells).fill(null).map((_, i) => (
                            <div key={`empty-${i}`} className="p-2"></div>
                        ))}
                        {dates.map(date => {
                            const past = isDatePast(date);
                            return (
                                <button
                                    key={date}
                                    onClick={() => !past && setSelectedDate(date)}
                                    disabled={past}
                                    className={`p-2 text-center rounded-md transition ${selectedDate === date
                                            ? 'text-white'
                                            : past
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                    style={selectedDate === date ? { backgroundColor: '#46C2DE' } : {}}
                                >
                                    {date}
                                </button>
                            );
                        })}
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

                            {/* 👇 Problem description textarea */}
                            <div className="mb-4">
                                <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-1">
                                    Describe your problem (briefly)
                                </label>
                                <textarea
                                    id="problem"
                                    rows={2}
                                    value={problem}
                                    onChange={(e) => setProblem(e.target.value)}
                                    placeholder="e.g., Fever and cough since 2 days"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#46C2DE]"
                                    maxLength={500}
                                />
                            </div>

                            <button
                                onClick={handleBook}
                                className="w-full py-3 text-white font-medium rounded-md hover:opacity-90 transition cursor-pointer"
                                style={{ backgroundColor: '#46C2DE' }}
                            >
                                Confirm Appointment
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

}