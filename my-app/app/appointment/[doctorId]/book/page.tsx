'use client';

import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useRef } from 'react';
import {
    FaCalendarAlt, FaCheck, FaChevronLeft, FaChevronRight, FaClock, 
    FaMapMarkerAlt, FaPhone, FaUserCheck, FaUserMd, FaUserPlus, FaUsers, FaVideo 
} from 'react-icons/fa';


interface BookedSlot {
    date: string;
    startTime: string;
}

interface Doctor {
    _id: string;
    name: string;
    availableDays?: string[];
    startTime?: string;
    endTime?: string;
    duration?: number;
    breakDuration?: number;
    appointmentTypes?: string[];
    consultationTypes?: string[];
    bookedSlots?: BookedSlot[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helpers ──────────────────────────────────────────────────────────────────────────────
const getMonthYear = (date: Date) => date.toLocaleString('default', { month: 'long', year: 'numeric' });
const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

const formatDate = (day: number, monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = String(monthDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
};

const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    const [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const convertTo12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const addMinutes = (time24: string, mins: number): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const total = hours * 60 + minutes + mins;
    const newHours = Math.floor(total / 60) % 24;
    const newMins = total % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
};

const generateTimeSlots = (start: string, end: string, duration: number, breakDuration: number): string[] => {
    const slots: string[] = [];
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;
    const step = duration + breakDuration;

    for (let time = startTotal; time + duration <= endTotal; time += step) {
        const hours = Math.floor(time / 60);
        const minutes = time % 60;
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours % 12 || 12;
        const displayMin = minutes.toString().padStart(2, '0');
        slots.push(`${displayHour}:${displayMin} ${period}`);
    }
    return slots;
};
// ────────────────────────────────────────────────────────────────────────────────────────────────


export default function BookingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { doctorId } = useParams();
    
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [slots, setSlots] = useState<string[]>([]);

    // Patient's own booked slots (to prevent double-booking across doctors)
    const [patientBookedSlots, setPatientBookedSlots] = useState<BookedSlot[]>([]);

    // Guard so role-error toast fires only once
    const toastShownRef = useRef(false);

    // Form state
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [appointmentType, setAppointmentType] = useState<'Individual' | 'Group'>('Individual');
    const [visitType, setVisitType] = useState<'New' | 'Repeat'>('New');
    const [consultationType, setConsultationType] = useState<'Video' | 'Audio' | 'In-person'>('Video');
    const [patientProblem, setPatientProblem] = useState('');

    // 1. Fetch doctor details
    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await fetch(`${API_URL}/doctors/${doctorId}`);
                if (!res.ok) throw new Error('Doctor not found');
                const data: Doctor = await res.json();
                setDoctor(data);

                if (data.startTime && data.endTime && data.duration) {
                    setSlots(generateTimeSlots(data.startTime, data.endTime, data.duration, data.breakDuration || 0));
                } else {
                    setSlots(['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM']);
                }
            } catch (error) {
                console.error(error);
                router.push('/404');
            } finally {
                setLoading(false);
            }
        };
        if (doctorId) fetchDoctor();
    }, [doctorId, router]);

    // 2. Fetch patient's own booked slots + check profile completeness
    useEffect(() => {
        const fetchPatientData = async () => {
            if (!user?.profileId) return;
            try {
                const res = await fetch(`${API_URL}/patients/${user.profileId}`);
                if (res.ok) {
                    const data = await res.json();
                    setPatientBookedSlots(data.bookedSlots || []);

                    // Profile completeness check
                    const incomplete =
                        !data.age ||
                        !data.gender ||
                        !data.allergies || data.allergies.length === 0 ||
                        !data.problems || data.problems.length === 0;

                    if (incomplete) {
                        toast.error('Complete your profile to secure your appointment.', { id: 'profile-incomplete' });
                        router.push('/patient/profile/update');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch patient data:', error);
            }
        };
        if (user?.role === 'patient') fetchPatientData();
    }, [user, router]);

    // 3. Compute booked slots for the selected date from doctor.bookedSlots
    const doctorBookedForDate = useMemo(() => {
        if (!doctor?.bookedSlots || !selectedDate) return new Set<string>();
        const dateStr = formatDate(selectedDate, currentMonth);
        return new Set(
            doctor.bookedSlots
                .filter(s => s.date === dateStr)
                .map(s => s.startTime)
        );
    }, [doctor, selectedDate, currentMonth]);

    // 4. Patient's own booked times for the selected date (cross-doctor conflict check)
    const patientBookedForDate = useMemo(() => {
        if (!selectedDate) return new Set<string>();
        const dateStr = formatDate(selectedDate, currentMonth);
        return new Set(
            patientBookedSlots
                .filter(s => s.date === dateStr)
                .map(s => s.startTime)
        );
    }, [patientBookedSlots, selectedDate, currentMonth]);

    // 5. Redirect unauthenticated / non-patient — toast fires exactly once via ref guard
    useEffect(() => {
        if (!loading && !user) {
            router.push(`/signin?redirect=/appointment/${doctorId}/book`);
        } else if (user && user.role !== 'patient') {
            if (!toastShownRef.current) {
                toastShownRef.current = true;
                toast.error('Only patients can book appointments.');
            }
            router.push('/');
        }
    }, [user, loading, doctorId, router]);

    // Calendar helpers 
    const isDatePast = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isDateAvailable = (day: number) => {
        if (!doctor?.availableDays) return true;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        return doctor.availableDays.includes(dayName);
    };

    // Returns true if the slot time has already passed when today is selected
    const isSlotPast = (slot12: string): boolean => {
        if (!selectedDate) return false;
        const now = new Date();
        const selectedIsToday =
            currentMonth.getFullYear() === now.getFullYear() &&
            currentMonth.getMonth() === now.getMonth() &&
            selectedDate === now.getDate();
        if (!selectedIsToday) return false;
        const slot24 = convertTo24Hour(slot12);
        const [sh, sm] = slot24.split(':').map(Number);
        const slotMinutes = sh * 60 + sm;
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        return slotMinutes <= nowMinutes;
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayIndex = getFirstDayOfMonth(currentMonth);
    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
        setSelectedDate(null);
        setSelectedSlot(null);
    };
    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
        setSelectedDate(null);
        setSelectedSlot(null);
    };

    // ---------- Type/Mode permission helpers ----------
    const isAppointmentTypeAllowed = (type: 'Individual' | 'Group'): boolean => {
        if (!doctor?.appointmentTypes || doctor.appointmentTypes.length === 0) return true;
        return doctor.appointmentTypes.includes(type);
    };

    const isConsultationTypeAllowed = (type: 'Video' | 'Audio' | 'In-person'): boolean => {
        if (!doctor?.consultationTypes || doctor.consultationTypes.length === 0) return true;
        return doctor.consultationTypes.includes(type);
    };

    // ---------- Book handler ----------
    const handleBook = async () => {
        if (!selectedDate || !selectedSlot) {
            toast.error('Please select a date and time slot.');
            return;
        }
        if (!user?.profileId) {
            toast.error('User profile not found. Please log in again.');
            return;
        }

        const slot24 = convertTo24Hour(selectedSlot);

        // Guard against race conditions (already reflected in local state)
        if (doctorBookedForDate.has(slot24)) {
            toast.error('This slot has just been booked. Please choose another.');
            setSelectedSlot(null);
            return;
        }
        if (patientBookedForDate.has(slot24)) {
            toast.error('You already have an appointment at this time.');
            setSelectedSlot(null);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: user.profileId,
                    doctorId: doctor?._id,
                    date: formatDate(selectedDate, currentMonth),
                    startTime: slot24,
                    appointmentType,
                    visitType,
                    consultationType,
                    patientProblem: patientProblem.trim() || undefined,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Appointment booked successfully!');
                setTimeout(() => router.push('/appointments'), 1200);
            } else {
                toast.error(data.message || 'Booking failed.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Network error. Please try again.');
        }
    };

    // ---------- Render ----------
    if (loading || !doctor) return <div className="text-center py-20">Loading...</div>;
    if (!user || user.role !== 'patient') return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Book with {doctor.name}</h1>
                    <p className="text-gray-600 mt-1">Select your preferred date and time, then provide details.</p>
                </div>

                {/* Two-column layout */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left column: Calendar & Time slots */}
                    <div className="space-y-6">
                        {/* Calendar card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">
                                    <FaChevronLeft className="text-gray-600" />
                                </button>
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <FaCalendarAlt style={{ color: '#46C2DE' }} />
                                    {getMonthYear(currentMonth)}
                                </h3>
                                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
                                    <FaChevronRight className="text-gray-600" />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 mb-2">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                    <div key={idx}>{day}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {Array(firstDayIndex).fill(null).map((_, i) => (
                                    <div key={`empty-${i}`} className="p-2" />
                                ))}
                                {dates.map(date => {
                                    const past = isDatePast(date);
                                    const available = isDateAvailable(date);
                                    const isSelected = selectedDate === date;
                                    const disabled = past || !available;
                                    return (
                                        <button
                                            key={date}
                                            onClick={() => !disabled && setSelectedDate(date)}
                                            disabled={disabled}
                                            className={`p-2 text-center rounded-lg transition ${isSelected
                                                ? 'text-white font-semibold'
                                                : disabled
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                                }`}
                                            style={isSelected ? { backgroundColor: '#46C2DE' } : {}}
                                        >
                                            {date}
                                        </button>
                                    );
                                })}
                            </div>
                            {doctor.availableDays && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Available days: {doctor.availableDays.join(', ')}
                                </p>
                            )}
                        </div>

                        {/* Time slots card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FaClock style={{ color: '#46C2DE' }} />
                                Available Slots
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {slots.map(slot => {
                                    const slot24 = convertTo24Hour(slot);
                                    const isDoctorBooked = doctorBookedForDate.has(slot24);
                                    const isPatientBooked = patientBookedForDate.has(slot24);
                                    const isPast = isSlotPast(slot);
                                    const isBooked = isDoctorBooked || isPatientBooked;
                                    const disabled = !selectedDate || isBooked || isPast;
                                    const isSelected = selectedSlot === slot;

                                    const endTime24 = addMinutes(slot24, doctor.duration || 30);
                                    const endTime12 = convertTo12Hour(endTime24);
                                    const displayText = `${slot} - ${endTime12}`;

                                    return (
                                        <button
                                            key={slot}
                                            onClick={() => !disabled && setSelectedSlot(slot)}
                                            disabled={disabled}
                                            className={`p-3 text-sm border rounded-xl transition ${isSelected
                                                ? 'text-white border-transparent'
                                                : disabled
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                                    : 'border-gray-200 hover:border-[#46C2DE] hover:text-[#46C2DE]'
                                                }`}
                                            style={isSelected ? { backgroundColor: '#46C2DE' } : {}}
                                            title={isDoctorBooked ? 'Already booked' : isPatientBooked ? 'You have an appointment at this time' : isPast ? 'This time has passed' : ''}
                                        >
                                            {displayText}
                                        </button>
                                    );
                                })}
                            </div>
                            {!selectedDate && (
                                <p className="text-sm text-gray-500 mt-3">Please select a date first.</p>
                            )}
                        </div>
                    </div>

                    {/* Right column: Appointment details */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Appointment Details</h2>

                        {/* Type */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => isAppointmentTypeAllowed('Individual') && setAppointmentType('Individual')}
                                    disabled={!isAppointmentTypeAllowed('Individual')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition ${appointmentType === 'Individual' && isAppointmentTypeAllowed('Individual')
                                        ? 'border-[#46C2DE] bg-blue-50 text-[#46C2DE]'
                                        : !isAppointmentTypeAllowed('Individual')
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <FaUserMd />
                                    <span>Individual</span>
                                </button>
                                <button
                                    onClick={() => isAppointmentTypeAllowed('Group') && setAppointmentType('Group')}
                                    disabled={!isAppointmentTypeAllowed('Group')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition ${appointmentType === 'Group' && isAppointmentTypeAllowed('Group')
                                        ? 'border-[#46C2DE] bg-blue-50 text-[#46C2DE]'
                                        : !isAppointmentTypeAllowed('Group')
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <FaUsers />
                                    <span>Group</span>
                                </button>
                            </div>
                            {doctor.appointmentTypes && doctor.appointmentTypes.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Available: {doctor.appointmentTypes.join(', ')}
                                </p>
                            )}
                        </div>

                        {/* Patient Status */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Status</label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setVisitType('New')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition ${visitType === 'New'
                                        ? 'border-[#46C2DE] bg-blue-50 text-[#46C2DE]'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <FaUserPlus />
                                    <span>New</span>
                                </button>
                                <button
                                    onClick={() => setVisitType('Repeat')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition ${visitType === 'Repeat'
                                        ? 'border-[#46C2DE] bg-blue-50 text-[#46C2DE]'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <FaUserCheck />
                                    <span>Repeat</span>
                                </button>
                            </div>
                        </div>

                        {/* Consultation Mode */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => isConsultationTypeAllowed('Video') && setConsultationType('Video')}
                                    disabled={!isConsultationTypeAllowed('Video')}
                                    className={`flex flex-col items-center py-3 px-2 rounded-xl border transition ${consultationType === 'Video' && isConsultationTypeAllowed('Video')
                                        ? 'border-[#46C2DE] bg-blue-50 text-[#46C2DE]'
                                        : !isConsultationTypeAllowed('Video')
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <FaVideo className="text-lg mb-1" />
                                    <span className="text-xs">Video</span>
                                </button>
                                <button
                                    onClick={() => isConsultationTypeAllowed('Audio') && setConsultationType('Audio')}
                                    disabled={!isConsultationTypeAllowed('Audio')}
                                    className={`flex flex-col items-center py-3 px-2 rounded-xl border transition ${consultationType === 'Audio' && isConsultationTypeAllowed('Audio')
                                        ? 'border-[#46C2DE] bg-blue-50 text-[#46C2DE]'
                                        : !isConsultationTypeAllowed('Audio')
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <FaPhone className="text-lg mb-1" />
                                    <span className="text-xs">Audio</span>
                                </button>
                                <button
                                    onClick={() => isConsultationTypeAllowed('In-person') && setConsultationType('In-person')}
                                    disabled={!isConsultationTypeAllowed('In-person')}
                                    className={`flex flex-col items-center py-3 px-2 rounded-xl border transition ${consultationType === 'In-person' && isConsultationTypeAllowed('In-person')
                                        ? 'border-[#46C2DE] bg-blue-50 text-[#46C2DE]'
                                        : !isConsultationTypeAllowed('In-person')
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <FaMapMarkerAlt className="text-lg mb-1" />
                                    <span className="text-xs">In‑Person</span>
                                </button>
                            </div>
                            {doctor.consultationTypes && doctor.consultationTypes.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Available: {doctor.consultationTypes.join(', ')}
                                </p>
                            )}
                        </div>

                        {/* Patient Problem */}
                        <div className="mb-6">
                            <label htmlFor="patientProblem" className="block text-sm font-medium text-gray-700 mb-2">
                                Describe your problem (briefly)
                            </label>
                            <textarea
                                id="patientProblem"
                                rows={3}
                                value={patientProblem}
                                onChange={(e) => setPatientProblem(e.target.value)}
                                placeholder="e.g., Fever and cough since 2 days"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#46C2DE] focus:border-transparent resize-none"
                                maxLength={500}
                            />
                        </div>

                        {/* Confirm Button */}
                        <button
                            onClick={handleBook}
                            disabled={!selectedDate || !selectedSlot}
                            className={`bg-[#46C2DE] w-full py-4 text-white font-medium rounded-xl transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${!selectedDate || !selectedSlot ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                                }`}
                        >
                            <FaCheck />
                            Confirm Appointment 
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
