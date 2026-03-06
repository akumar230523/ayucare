'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaCalendarAlt, FaCheckCircle, FaClock, FaExclamationCircle, FaPhone, FaSave, FaStethoscope, FaTimes, FaMapMarkerAlt, FaUser, FaUsers, FaUserMd, FaVideo } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const appointmentTypeOptions = [{ value: 'Individual', icon: FaUserMd }, { value: 'Group', icon: FaUsers }];
const consultationTypeOptions = [{ value: 'Video', icon: FaVideo }, { value: 'Audio', icon: FaPhone }, { value: 'In-person', icon: FaMapMarkerAlt }];

interface DoctorData {
    _id: string;
    name: string; about?: string; iconUrl?: string; gender?: string;
    degree?: string; service?: string[]; specialty?: string; expression?: string;
    experienceYears?: number; patientsCount?: string; fee?: number;
    availableDays?: string[]; startTime?: string; endTime?: string; duration?: number; breakDuration?: number;
    appointmentTypes?: string[]; consultationTypes?: string[]; available: boolean;
}

export default function UpdateDoctorProfile() {
    const router = useRouter();
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        name: '', about: '', iconUrl: '', gender: '',
        degree: '', service: '', specialty: '', expression: '',
        experienceYears: '', patientsCount: '', fee: '',
        availableDays: [] as string[], startTime: '', endTime: '', duration: '', breakDuration: '',
        appointmentTypes: [] as string[], consultationTypes: [] as string[],
    });

    useEffect(() => {
        if (!user) router.push('/');
        else if (user.role !== 'doctor') router.push('/patient/profile');
    }, [user, router]);

    useEffect(() => {
        const uid = user?._id;
        if (!uid || user?.role !== 'doctor') return;

        const fetchDoctor = async () => {
            try {
                const res = await fetch(`${API_URL}/doctors/user/${uid}`);
                if (res.status === 404) {
                    setFormData(prev => ({ ...prev, name: user.name }));
                    return;
                }
                if (!res.ok) throw new Error('Failed to fetch doctor');
                const data: DoctorData = await res.json();
                setFormData({
                    name: data.name || '',
                    about: data.about || '',
                    iconUrl: data.iconUrl || '',
                    gender: data.gender || '',
                    degree: data.degree || '',
                    service: data.service ? data.service.join(', ') : '',
                    specialty: data.specialty || '',
                    expression: data.expression || '',
                    experienceYears: data.experienceYears?.toString() || '',
                    patientsCount: data.patientsCount || '',
                    fee: data.fee?.toString() || '',
                    availableDays: data.availableDays || [],
                    startTime: data.startTime || '',
                    endTime: data.endTime || '',
                    duration: data.duration?.toString() || '',
                    breakDuration: data.breakDuration?.toString() || '',
                    appointmentTypes: data.appointmentTypes || [],
                    consultationTypes: data.consultationTypes || [],
                });
            } catch (error) {
                console.error(error);
                toast.error('Could not load your profile data.');
                setFormData(prev => ({ ...prev, name: user.name }));
            } finally {
                setFetching(false);
            }
        };
        fetchDoctor();
    }, [user]);

    const validateField = (name: string, value: string | number | undefined): string => {
        if (name === 'name' && !value) return 'Name is required';
        if (name === 'fee' && value && Number(value) < 100) return 'Fee must be at least ₹100';
        if (name === 'experienceYears' && value && Number(value) < 0) return 'Experience cannot be negative';
        if (name === 'duration' && value && Number(value) < 5) return 'Duration must be at least 5 minutes';
        if (name === 'breakDuration' && value && Number(value) < 0) return 'Break cannot be negative';
        return '';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleArrayToggle = (field: 'availableDays' | 'appointmentTypes' | 'consultationTypes', value: string) => {
        setFormData(prev => {
            const current = prev[field];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(v => v !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.profileId || !user?._id) return;

        // Validate required fields
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.about) newErrors.about = 'About is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.degree) newErrors.degree = 'Degree is required';
        if (!formData.service) newErrors.service = 'Services are required';
        if (!formData.specialty) newErrors.specialty = 'Specialty is required';
        if (!formData.expression) newErrors.expression = 'Expression is required';
        if (!formData.experienceYears || Number(formData.experienceYears) < 0) newErrors.experienceYears = 'Experience is required';
        if (!formData.patientsCount) newErrors.patientsCount = 'Patients count is required';
        if (!formData.fee || Number(formData.fee) < 100) newErrors.fee = 'Fee is required (min ₹100)';
        if (formData.availableDays.length === 0) newErrors.availableDays = 'Select at least one available day';
        if (!formData.startTime) newErrors.startTime = 'Start time is required';
        if (!formData.endTime) newErrors.endTime = 'End time is required';
        if (formData.startTime && formData.endTime) {
            if (formData.startTime >= formData.endTime) { newErrors.endTime = 'End time must be after start time'; }
        }
        if (!formData.duration || Number(formData.duration) < 5) newErrors.duration = 'Valid duration is required (min 5)';
        if (!formData.breakDuration || Number(formData.breakDuration) < 0) newErrors.breakDuration = 'Valid break is required';
        if (formData.appointmentTypes.length === 0) newErrors.appointmentTypes = 'Select at least one appointment type';
        if (formData.consultationTypes.length === 0) newErrors.consultationTypes = 'Select at least one consultation type';

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            toast.error('Please fix the errors before submitting.');
            return;
        }

        setLoading(true);

        const payload = {
            userId: user._id,
            name: formData.name,
            about: formData.about,
            iconUrl: formData.iconUrl,
            gender: formData.gender,
            degree: formData.degree,
            service: formData.service.split(',').map(s => s.trim()).filter(Boolean),
            specialty: formData.specialty,
            expression: formData.expression,
            experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
            patientsCount: formData.patientsCount,
            fee: formData.fee ? parseFloat(formData.fee) : undefined,
            availableDays: formData.availableDays,
            startTime: formData.startTime,
            endTime: formData.endTime,
            duration: formData.duration ? parseInt(formData.duration) : undefined,
            breakDuration: formData.breakDuration ? parseInt(formData.breakDuration) : undefined,
            appointmentTypes: formData.appointmentTypes,
            consultationTypes: formData.consultationTypes,
        };

        try {
            const res = await fetch(`${API_URL}/doctors/${user.profileId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                const updatedUser = { ...user, name: formData.name, iconUrl: formData.iconUrl };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                toast.success('Profile updated successfully.');
                router.push('/doctor/profile');
            } else {
                toast.error(data.message || 'Failed to update profile.');
            }
        } catch {
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'doctor') return null;
    if (fetching) return <div className="text-center py-20">Loading your profile...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="container-custom max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header ---------------------------------------------------------------- */}
                    <div className="bg-primary px-8 py-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                <FaStethoscope className="text-white" />Update Profile
                            </h1>
                            <Link href="/doctor/profile"
                                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition"
                            >
                                <FaTimes size={18} />
                            </Link>
                        </div>
                        <p className="text-white/80 text-sm mt-1">Keep your information accurate to attract more patients</p>
                    </div>

                    {/* Form ------------------------------------------------------------------ */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Personal --------------------------------- */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 pb-2 border-b">
                                <FaUser className="text-primary" />Personal
                            </h2>
                            {/*  */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Dr. John Doe"
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.gender && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.gender}
                                        </p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="iconUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                        Profile Image URL
                                    </label>
                                    <input
                                        id="iconUrl"
                                        type="url"
                                        name="iconUrl"
                                        value={formData.iconUrl}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">Leave empty to use default avatar</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">
                                        About <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="about"
                                        name="about"
                                        rows={4}
                                        value={formData.about}
                                        onChange={handleChange}
                                        placeholder="Tell patients about yourself, your approach, etc."
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                    />
                                    {errors.about && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.about}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-400 text-right">{formData.about.length} / 500</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="expression" className="block text-sm font-medium text-gray-700 mb-1">
                                        Expression(Tagline) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="expression"
                                        type="text"
                                        name="expression"
                                        value={formData.expression}
                                        onChange={handleChange}
                                        placeholder="Caring for your heart"
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                    />
                                    {errors.expression && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.expression}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Professional ----------------------------- */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 pb-2 border-b">
                                <FaStethoscope className="text-primary" /> Professional
                            </h2>
                            {/*  */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">
                                        Degree(s) (comma separated) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="degree"
                                        type="text"
                                        name="degree"
                                        value={formData.degree}
                                        onChange={handleChange}
                                        placeholder="MBBS, MD, Fellowship in Cardiology"
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                    />
                                    {errors.degree && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.degree}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-1">
                                        Experience (years) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="experienceYears"
                                        type="number"
                                        min="0"
                                        name="experienceYears"
                                        value={formData.experienceYears}
                                        onChange={handleChange}
                                        placeholder="12"
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                    />
                                    {errors.experienceYears && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.experienceYears}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="patientsCount" className="block text-sm font-medium text-gray-700 mb-1">
                                        Patients Count <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="patientsCount"
                                        type="text"
                                        name="patientsCount"
                                        value={formData.patientsCount}
                                        onChange={handleChange}
                                        placeholder="1,500+"
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                    />
                                    {errors.patientsCount && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.patientsCount}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-1">
                                        Consultation Fee (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="fee"
                                        type="number"
                                        step="5"
                                        min="100"
                                        name="fee"
                                        value={formData.fee}
                                        onChange={handleChange}
                                        placeholder="500"
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}

                                    />
                                    {errors.fee && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.fee}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                                        Services <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="service"
                                        type="text"
                                        name="service"
                                        value={formData.service}
                                        onChange={handleChange}
                                        placeholder="Echocardiogram, Stress Test, Holter Monitoring"
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                    />
                                    {errors.service && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.service}
                                        </p>
                                    )}
                                    <i className="mt-1 text-xs text-gray-400">Separate each service with a comma</i>
                                </div>

                                <div>
                                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                                        Specialty <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="specialty"
                                        type="text"
                                        name="specialty"
                                        value={formData.specialty}
                                        onChange={handleChange}
                                        placeholder="Cardiologist"
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                    />
                                    {errors.specialty && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.specialty}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Availability & Schedule ------------------ */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 pb-2 border-b">
                                <FaClock className="text-primary" /> Availability & Schedule
                            </h2>
                            {/*  */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/*  */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Available Days <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {weekDays.map(day => {
                                            const isSelected = formData.availableDays.includes(day);
                                            return (
                                                <button key={day} type="button" onClick={() => handleArrayToggle('availableDays', day)}
                                                    className={`py-3 px-2 rounded-xl border transition-all text-sm font-medium flex items-center justify-between
                                                        ${isSelected ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'}
                                                    `}
                                                >
                                                    <span>{day.slice(0, 3)}</span>
                                                    {isSelected && <FaCheckCircle className="text-primary" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.availableDays && (
                                        <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.availableDays}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="startTime"
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                    />
                                    {errors.startTime && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.startTime}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                                        End Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="endTime"
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                    />
                                    {errors.endTime && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.endTime}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                                        Slot Duration (minutes) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="duration"
                                        type="number"
                                        min="5"
                                        step="5"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        placeholder="30"
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                    />
                                    {errors.duration && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.duration}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="breakDuration" className="block text-sm font-medium text-gray-700 mb-1">
                                        Break Between Slots (minutes) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="breakDuration"
                                        type="number"
                                        min="0"
                                        step="5"
                                        name="breakDuration"
                                        value={formData.breakDuration}
                                        onChange={handleChange}
                                        placeholder="10"
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                    />
                                    {errors.breakDuration && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.breakDuration}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Appointment & Consultation Types --------- */}
                        <section className="space-y-6">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 pb-2 border-b">
                                <FaCalendarAlt className="text-primary" />Appointment
                            </h2>
                            {/*  */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Appointment Types <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {appointmentTypeOptions.map(option => {
                                        const isSelected = formData.appointmentTypes.includes(option.value);
                                        const Icon = option.icon;
                                        return (
                                            <button key={option.value} type="button" onClick={() => handleArrayToggle('appointmentTypes', option.value)}
                                                className={`py-4 rounded-xl border transition-all text-sm font-medium flex flex-col items-center gap-2
                                                    ${isSelected ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'}
                                                `}
                                            >
                                                <Icon className="text-xl" /> <span>{option.value}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.appointmentTypes && (
                                    <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle /> {errors.appointmentTypes}
                                    </p>
                                )}
                            </div>
                            {/*  */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Consultation Types <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {consultationTypeOptions.map(option => {
                                        const isSelected = formData.consultationTypes.includes(option.value);
                                        const Icon = option.icon;
                                        return (
                                            <button key={option.value} type="button" onClick={() => handleArrayToggle('consultationTypes', option.value)}
                                                className={`py-4 rounded-xl border transition-all text-sm font-medium flex flex-col items-center gap-2
                                                    ${isSelected ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'}
                                                `}
                                            >
                                                <Icon className="text-xl" /> <span className="text-xs">{option.value}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.consultationTypes && (
                                    <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle /> {errors.consultationTypes}
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Form Actions ------------------------------------------------------ */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                            <Link href="/doctor/profile"
                                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </Link>
                            <button type="submit" disabled={loading}
                                className="px-6 py-3 rounded-xl bg-primary text-white font-medium flex items-center gap-2 hover:bg-primary-dark transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowe"
                            >
                                {loading ? (<> Saving... </>) : (<> <FaSave className="text-lg" /> Save Changes </>)}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );

}