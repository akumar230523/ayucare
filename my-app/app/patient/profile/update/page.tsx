'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaCheckCircle, FaExclamationCircle, FaHeartbeat, FaPhone, FaPlus, FaSave, FaTimes, FaTrash, FaUser } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const problemOptions = ['Blood Pressure', 'Diabetes', 'Tension', 'Heart Disease', 'Asthma', 'Thyroid', 'Other'];
const relationOptions = ['Parent', 'Sibling', 'Spouse', 'Child', 'Friend', 'Other'];

interface EmergencyContact {
    name: string; relation: string; email: string; mobile: string;
}

interface VitalSigns {
    bloodPressure?: string; heartRate?: number; temperature?: number; oxygenLevel?: number; sugarLevel?: number; respiratoryRate?: number; recordedAt?: Date;
}

interface FullPatient {
    _id: string;
    name: string; iconUrl?: string; gender?: string; age?: number;
    height?: number; weight?: number;
    bloodGroup?: string; vitalSigns?: VitalSigns[];
    allergies?: string[]; problems?: string[];
    emergencyContacts?: EmergencyContact[];
}

export default function UpdatePatientProfile() {
    const router = useRouter();
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<FullPatient>({
        _id: '',
        name: '', iconUrl: '', age: undefined, gender: '',
        height: undefined, weight: undefined,
        allergies: [], bloodGroup: '', problems: [],
        vitalSigns: [],
        emergencyContacts: [],
    });

    const [vitalsInput, setVitalsInput] = useState({
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        oxygenLevel: '',
        sugarLevel: '',
        respiratoryRate: '',
    });

    useEffect(() => {
        if (!user) router.push('/');
        else if (user.role !== 'patient') router.push('/doctor/profile');
    }, [user, router]);

    useEffect(() => {
        const pid = user?.profileId;
        if (!pid || user?.role !== 'patient') return;

        const fetchPatient = async () => {
            try {
                const res = await fetch(`${API_URL}/patients/${pid}`);
                if (!res.ok) throw new Error('Failed to fetch patient');
                const data = await res.json();

                setFormData({
                    _id: data._id,
                    name: data.name || '',
                    iconUrl: data.iconUrl || '',
                    gender: data.gender || '',
                    age: data.age || undefined,
                    height: data.height || undefined,
                    weight: data.weight || undefined,
                    bloodGroup: data.bloodGroup || '',
                    problems: data.problems || [],
                    allergies: data.allergies || [],
                    emergencyContacts: data.emergencyContacts || [],
                    vitalSigns: data.vitalSigns || [],
                });

                const latest = data.vitalSigns?.[0];
                if (latest) {
                    setVitalsInput({
                        bloodPressure: latest.bloodPressure || '',
                        heartRate: latest.heartRate?.toString() || '',
                        temperature: latest.temperature?.toString() || '',
                        oxygenLevel: latest.oxygenLevel?.toString() || '',
                        sugarLevel: latest.sugarLevel?.toString() || '',
                        respiratoryRate: latest.respiratoryRate?.toString() || '',
                    });
                }
            } catch (error) {
                console.error(error);
                toast.error('Could not load your profile data');
                setFormData(prev => ({ ...prev, name: user.name || '' }));
            } finally {
                setFetching(false);
            }
        };
        fetchPatient();
    }, [user]);

    const validateField = (name: string, value: string | number | undefined): string => {
        if (name === 'name' && !value) return 'Name is required';
        if (name === 'gender' && !value) return 'Gender is required';
        if (name === 'age') {
            if (!value) return 'Age is required';
            if (Number(value) < 0 || Number(value) > 150) return 'Age must be between 0 and 150';
        }
        if (name === 'height' && value && Number(value) < 0) return 'Height must be positive';
        if (name === 'weight' && value && Number(value) < 0) return 'Weight must be positive';
        return '';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? (value ? Number(value) : undefined) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
        const error = validateField(name, parsedValue);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleVitalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setVitalsInput(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayToggle = (field: 'problems', value: string) => {
        setFormData(prev => {
            const current = prev[field] || [];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(v => v !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const handleAllergiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            allergies: value.split(',').map(s => s.trim()).filter(Boolean),
        }));
    };

    const addEmergencyContact = () => {
        setFormData(prev => ({
            ...prev, emergencyContacts: [
                ...(prev.emergencyContacts || []), { name: '', relation: 'Other', email: '', mobile: '' }
            ]
        }));
    };

    const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
        setFormData(prev => {
            const updated = [...(prev.emergencyContacts || [])];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, emergencyContacts: updated };
        });
    };

    const removeEmergencyContact = (index: number) => {
        setFormData(prev => ({
            ...prev,
            emergencyContacts: (prev.emergencyContacts || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.profileId || !user?._id) return;

        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.age) newErrors.age = 'Age is required';
        if (formData.age && (formData.age < 0 || formData.age > 150)) newErrors.age = 'Invalid age';
        if (formData.height && formData.height < 0) newErrors.height = 'Invalid height';
        if (formData.weight && formData.weight < 0) newErrors.weight = 'Invalid weight';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            toast.error('Please fix the errors before submitting.');
            return;
        }

        setLoading(true);

        const hasVitals = Object.values(vitalsInput).some(v => v.trim() !== '');
        let newVitals: VitalSigns | undefined;
        if (hasVitals) {
            newVitals = {
                bloodPressure: vitalsInput.bloodPressure || undefined,
                heartRate: vitalsInput.heartRate ? Number(vitalsInput.heartRate) : undefined,
                temperature: vitalsInput.temperature ? Number(vitalsInput.temperature) : undefined,
                oxygenLevel: vitalsInput.oxygenLevel ? Number(vitalsInput.oxygenLevel) : undefined,
                sugarLevel: vitalsInput.sugarLevel ? Number(vitalsInput.sugarLevel) : undefined,
                respiratoryRate: vitalsInput.respiratoryRate ? Number(vitalsInput.respiratoryRate) : undefined,
                recordedAt: new Date(),
            };
        }

        const payload = {
            userId: user._id,
            name: formData.name,
            iconUrl: formData.iconUrl,
            gender: formData.gender,
            age: formData.age,
            height: formData.height,
            weight: formData.weight,
            allergies: formData.allergies,
            bloodGroup: formData.bloodGroup,
            problems: formData.problems,
            emergencyContacts:
                formData.emergencyContacts,
            ...(newVitals && { vitalSigns: [...(formData.vitalSigns || []), newVitals] }),
        };

        try {
            const res = await fetch(`${API_URL}/patients/${user.profileId}`, {
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
                router.push('/patient/profile');
            } else {
                toast.error(data.message || 'Failed to update profile.');
            }
        } catch {
            toast.error('Network error! Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'patient') return null;
    if (fetching) return <div className="text-center py-20">Loading your profile...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="container-custom max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header ---------------------------------------------------------------- */}
                    <div className="bg-primary px-8 py-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                <FaUser className="text-white" />Update Profile
                            </h1>
                            <Link href="/patient/profile"
                                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition"
                            >
                                <FaTimes size={18} />
                            </Link>
                        </div>
                        <p className="text-white/80 text-sm mt-1">Keep your information up-to-date for better care</p>
                    </div>

                    {/* Form ------------------------------------------------------------------ */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Personal Information */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 pb-2 border-b">
                                <FaUser className="text-primary" />Personal
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                        placeholder="John Doe"
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
                                <div>
                                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                                        Age <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="age"
                                        type="number"
                                        name="age"
                                        value={formData.age || ''}
                                        onChange={handleChange}
                                        min="0"
                                        max="150"
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                        placeholder="30"
                                    />
                                    {errors.age && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.age}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                                        Height (cm)
                                    </label>
                                    <input
                                        id="height"
                                        type="number"
                                        name="height"
                                        value={formData.height || ''}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.1"
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                        placeholder="175"
                                    />
                                    {errors.height && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.height}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                                    <input
                                        id="weight"
                                        type="number"
                                        name="weight"
                                        value={formData.weight || ''}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.1"
                                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition`}
                                        placeholder="70"
                                    />
                                    {errors.weight && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {errors.weight}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                                    <select
                                        id="bloodGroup"
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
                                    >
                                        <option value="">Select</option>
                                        {bloodGroupOptions.map(group => (
                                            <option key={group} value={group}>{group}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Medical Information */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 pb-2 border-b">
                                <FaHeartbeat className="text-primary" />
                                Medical Details
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Problems (select all that apply)
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {problemOptions.map(problem => {
                                            const isSelected = formData.problems?.includes(problem);
                                            return (
                                                <button
                                                    key={problem}
                                                    type="button"
                                                    onClick={() => handleArrayToggle('problems', problem)}
                                                    className={`py-2 px-4 rounded-lg border transition-all text-sm font-medium flex items-center justify-between
                                                        ${isSelected
                                                            ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                                            : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                                                        }`}
                                                >
                                                    <span>{problem}</span>
                                                    {isSelected && <FaCheckCircle className="text-primary" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                                        Allergies (comma separated)
                                    </label>
                                    <input
                                        id="allergies"
                                        type="text"
                                        name="allergies"
                                        value={formData.allergies?.join(', ') || ''}
                                        onChange={handleAllergiesChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
                                        placeholder="Penicillin, Peanuts, Pollen"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">Separate multiple allergies with commas</p>
                                </div>
                            </div>
                        </section>

                        {/* Vital Signs */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 pb-2 border-b">
                                <FaHeartbeat className="text-primary" />
                                New Vital Signs Reading
                            </h2>
                            <p className="text-sm text-gray-500 mb-2">Add your latest measurements – a new record will be created.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700 mb-1">
                                        Blood Pressure
                                    </label>
                                    <input
                                        id="bloodPressure"
                                        type="text"
                                        name="bloodPressure"
                                        value={vitalsInput.bloodPressure}
                                        onChange={handleVitalsChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
                                        placeholder="120/80"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="heartRate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Heart Rate (bpm)
                                    </label>
                                    <input
                                        id="heartRate"
                                        type="number"
                                        name="heartRate"
                                        value={vitalsInput.heartRate}
                                        onChange={handleVitalsChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
                                        placeholder="72"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                                        Temperature (°F)
                                    </label>
                                    <input
                                        id="temperature"
                                        type="number"
                                        name="temperature"
                                        value={vitalsInput.temperature}
                                        onChange={handleVitalsChange}
                                        step="0.1"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
                                        placeholder="98.6"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="oxygenLevel" className="block text-sm font-medium text-gray-700 mb-1">
                                        Oxygen Level (%)
                                    </label>
                                    <input
                                        id="oxygenLevel"
                                        type="number"
                                        name="oxygenLevel"
                                        value={vitalsInput.oxygenLevel}
                                        onChange={handleVitalsChange}
                                        min="0"
                                        max="100"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
                                        placeholder="98"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="sugarLevel" className="block text-sm font-medium text-gray-700 mb-1">
                                        Sugar Level (mg/dL)
                                    </label>
                                    <input
                                        id="sugarLevel"
                                        type="number"
                                        name="sugarLevel"
                                        value={vitalsInput.sugarLevel}
                                        onChange={handleVitalsChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
                                        placeholder="110"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="respiratoryRate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Respiratory Rate (breaths/min)
                                    </label>
                                    <input
                                        id="respiratoryRate"
                                        type="number"
                                        name="respiratoryRate"
                                        value={vitalsInput.respiratoryRate}
                                        onChange={handleVitalsChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
                                        placeholder="16"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Emergency Contacts */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 pb-2 border-b">
                                    <FaPhone className="text-primary" />
                                    Emergency Contacts
                                </h2>
                                <button
                                    type="button"
                                    onClick={addEmergencyContact}
                                    className="text-sm text-primary hover:text-primary-dark flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-full transition"
                                >
                                    <FaPlus size={12} /> Add Contact
                                </button>
                            </div>
                            {formData.emergencyContacts && formData.emergencyContacts.length > 0 ? (
                                <div className="space-y-4">
                                    {formData.emergencyContacts.map((contact, index) => (
                                        <div key={index} className="relative border border-gray-200 rounded-2xl p-5 bg-gray-50/50">
                                            <button
                                                type="button"
                                                onClick={() => removeEmergencyContact(index)}
                                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
                                                aria-label="Remove contact"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                                                    <input
                                                        type="text"
                                                        value={contact.name}
                                                        onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Relation</label>
                                                    <select
                                                        value={contact.relation}
                                                        onChange={(e) => updateEmergencyContact(index, 'relation', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
                                                    >
                                                        {relationOptions.map(rel => (
                                                            <option key={rel} value={rel}>{rel}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        value={contact.email}
                                                        onChange={(e) => updateEmergencyContact(index, 'email', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Mobile</label>
                                                    <input
                                                        type="tel"
                                                        value={contact.mobile}
                                                        onChange={(e) => updateEmergencyContact(index, 'mobile', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">
                                    No emergency contacts added. Click &quot;Add Contact&quot; to add one.
                                </p>
                            )}
                        </section>

                        {/* Form Actions ------------------------------------------------------ */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                            <Link href="/patient/profile"
                                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </Link>
                            <button type="submit" disabled={loading}
                                className="px-6 py-2 rounded-lg bg-primary text-white font-medium flex items-center gap-2 hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
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