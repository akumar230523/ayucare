'use client';

import Image from 'next/image';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { generateAppointmentPDF } from '@/utils/pdfGenerator';
import {
    FaArrowLeft, FaBan, FaCalendarAlt, FaCheckCircle, FaDownload, FaEdit, FaExclamationTriangle,
    FaMapMarkerAlt, FaNotesMedical, FaPhone, FaPills, FaPlus, FaSave, FaStethoscope, FaTimes, FaTrash,
    FaUser, FaUserCheck, FaUserMd, FaUserPlus, FaUsers, FaVideo
} from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Medicine {
    medicineName: string; dosage: string; frequency: string; duration: string;
}

interface Prescription {
    medicines: Medicine[]; doctorDescription: string; prescribedAt: string;
}

interface Appointment {
    _id: string;
    patientId: { _id: string; name: string; age?: number; gender?: string; iconUrl?: string; allergies?: string[]; problems?: string[] };
    doctorId: { _id: string; name: string; specialty?: string; iconUrl?: string; degree?: string; appointmentTypes?: string[]; consultationTypes?: string[] };
    patientName: string;
    doctorName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    appointmentType: 'Individual' | 'Group';
    visitType: 'New' | 'Repeat';
    consultationType: 'Video' | 'Audio' | 'In-person';
    patientProblem?: string;
    prescription?: Prescription[];
}

const to12Hour = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

const EMPTY_MEDICINE: Medicine = { medicineName: '', dosage: '', frequency: '', duration: '' };

const doctorAllows = (list: string[] | undefined, value: string) =>
    !list || list.length === 0 || list.includes(value);

const STATUS_STYLE = {
    Scheduled: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    Completed: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    Cancelled: 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

function ToggleBtn({ active, disabled = false, onClick, children }: {
    active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm transition
                ${active ? 'border-primary bg-blue-50 text-primary font-medium'
                    : disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                        : 'border-gray-200 text-gray-600 hover:border-primary'}`}
        >
            {children}
        </button>
    );
}

export default function AppointmentDetailPage() {
    const params = useParams();
    const appointmentId = (params?.id ?? params?.appointmentId ?? Object.values(params ?? {})[0]) as string | undefined;

    const { user } = useAuth();
    const router = useRouter();

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [saving, setSaving] = useState(false);
    const [medicines, setMedicines] = useState<Medicine[]>([{ ...EMPTY_MEDICINE }]);
    const [doctorDescription, setDoctorDescription] = useState('');

    const [editMode, setEditMode] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [editProblem, setEditProblem] = useState('');
    const [editApptType, setEditApptType] = useState<'Individual' | 'Group'>('Individual');
    const [editVisitType, setEditVisitType] = useState<'New' | 'Repeat'>('New');
    const [editConsultType, setEditConsultType] = useState<'Video' | 'Audio' | 'In-person'>('Video');

    useEffect(() => {
        if (!appointmentId) {
            setError('Appointment ID not found in URL.');
            setLoading(false);
            return;
        }
        const fetchAppointment = async () => {
            try {
                const res = await fetch(`${API_URL}/appointments/${appointmentId}`);
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    setError(data.message || 'Appointment not found.');
                    setLoading(false);
                    return;
                }
                const data: Appointment = await res.json();
                setAppointment(data);
                setEditProblem(data.patientProblem || '');
                setEditApptType(data.appointmentType);
                setEditVisitType(data.visitType);
                setEditConsultType(data.consultationType);
                if (data.prescription && data.prescription.length > 0) {
                    const latest = data.prescription[data.prescription.length - 1];
                    setMedicines(latest.medicines.length > 0 ? latest.medicines.map(m => ({ ...m })) : [{ ...EMPTY_MEDICINE }]);
                    setDoctorDescription(latest.doctorDescription || '');
                }
            } catch (err) {
                console.error(err);
                setError('Network error. Could not load appointment.');
            } finally {
                setLoading(false);
            }
        };
        fetchAppointment();
    }, [appointmentId]);

    const handleStatusChange = async (status: 'Completed' | 'Cancelled') => {
        if (!appointment || !user) return;
        try {
            const res = await fetch(`${API_URL}/appointments/${appointment._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, userId: user._id, role: user.role }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Appointment ${status.toLowerCase()}.`);
                setAppointment(prev => prev ? { ...prev, status } : prev);
                setTimeout(() => router.push('/appointments'), 1200);
            } else {
                toast.error(data.message || 'Failed to update status.');
            }
        } catch {
            toast.error('Network error.');
        }
    };

    const handleSaveEdit = async () => {
        if (!appointment || !user) return;
        setEditSaving(true);
        try {
            const res = await fetch(`${API_URL}/appointments/${appointment._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    role: user.role,
                    patientProblem: editProblem,
                    appointmentType: editApptType,
                    visitType: editVisitType,
                    consultationType: editConsultType,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Appointment updated.');
                setAppointment(data.appointment);
                setEditMode(false);
            } else {
                toast.error(data.message || 'Failed to update.');
            }
        } catch {
            toast.error('Network error.');
        } finally {
            setEditSaving(false);
        }
    };

    const handleCancelEdit = () => {
        if (!appointment) return;
        setEditProblem(appointment.patientProblem || '');
        setEditApptType(appointment.appointmentType);
        setEditVisitType(appointment.visitType);
        setEditConsultType(appointment.consultationType);
        setEditMode(false);
    };

    const handleSavePrescription = async () => {
        if (!appointment || !user) return;
        const validMeds = medicines.filter(m => m.medicineName.trim());
        if (validMeds.length === 0 && !doctorDescription.trim()) {
            toast.error('Please add at least one medicine or a description.');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/appointments/${appointment._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    role: user.role,
                    prescription: { medicines: validMeds, doctorDescription: doctorDescription.trim() },
                }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Prescription saved!');
                setAppointment(data.appointment);
            } else {
                toast.error(data.message || 'Failed to save.');
            }
        } catch {
            toast.error('Network error.');
        } finally {
            setSaving(false);
        }
    };

    const updateMedicine = (idx: number, field: keyof Medicine, value: string) =>
        setMedicines(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
    const addMedicine = () => setMedicines(prev => [...prev, { ...EMPTY_MEDICINE }]);
    const removeMedicine = (idx: number) => setMedicines(prev => prev.filter((_, i) => i !== idx));

    const handleDownload = (apt: Appointment) => {
        const rx = apt.prescription?.[apt.prescription.length - 1];
        generateAppointmentPDF({
            patientName: apt.patientName,
            doctorName: apt.doctorName,
            doctorSpecialty: apt.doctorId?.specialty,
            doctorDegree: apt.doctorId?.degree,
            date: apt.date,
            startTime: apt.startTime,
            endTime: apt.endTime,
            status: apt.status,
            appointmentType: apt.appointmentType,
            visitType: apt.visitType,
            consultationType: apt.consultationType,
            patientProblem: apt.patientProblem,
            patientAge: apt.patientId?.age,
            patientGender: apt.patientId?.gender,
            patientAllergies: apt.patientId?.allergies,
            patientProblems: apt.patientId?.problems,
            prescription: rx,
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-gray-400 text-sm">Loading appointment…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-red-500 font-medium">{error}</p>
                    <button onClick={() => router.back()} className="btn-primary px-5 py-2">Go Back</button>
                </div>
            </div>
        );
    }

    if (!appointment || !user) return null;

    const isDoctor = user.role === 'doctor';
    const isPatient = user.role === 'patient';
    const canEdit = appointment.status === 'Scheduled';
    const latestRx = appointment.prescription?.[appointment.prescription.length - 1];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Top bar */}
            <div className="bg-white border-b border-gray-100 shadow-sm">
                <div className="container-custom py-5 flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 cursor-pointer transition">
                        <FaArrowLeft />
                    </button>
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Appointment Detail</p>
                        <h1 className="text-xl font-bold text-gray-900">
                            {isPatient ? `Dr. ${appointment.doctorName}` : appointment.patientName}
                        </h1>
                    </div>
                    <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[appointment.status]}`}>
                        {appointment.status}
                    </span>
                    <button
                        onClick={() => handleDownload(appointment)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg cursor-pointer hover:opacity-90 transition flex-shrink-0"
                    >
                        <FaDownload size={10} /> Download
                    </button>
                </div>
            </div>

            {/* Appointment -------------------------------------------------------------------------------------------- */}
            <div className="container-custom mt-6 grid lg:grid-cols-3 gap-6">
                {/* Left column --------------------------------------------------------------- */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Appointment Info */}
                    <div className="card p-6">
                        <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                            <FaCalendarAlt className="text-primary" /> Appointment Info
                        </h2>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-gray-50 rounded-xl px-4 py-3">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Date</p>
                                <p className="text-gray-800">{formatDate(appointment.date)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl px-4 py-3">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Time</p>
                                <p className="text-gray-800">{to12Hour(appointment.startTime)} – {to12Hour(appointment.endTime)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl px-4 py-3">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Mode</p>
                                <p className="text-gray-800">{appointment.consultationType}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl px-4 py-3">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Type</p>
                                <p className="text-gray-800">{appointment.appointmentType} · {appointment.visitType} Patient</p>
                            </div>
                        </div>
                    </div>
                    {/* Patient Problem ------------------------------ */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                <FaNotesMedical className="text-primary" /> Patient Problem
                            </h2>
                            {/*  */}
                            {isPatient && canEdit && (
                                editMode ? (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={editSaving}
                                            className="flex items-center gap-1.5 text-sm font-semibold text-primary cursor-pointer hover:underline disabled:opacity-50"
                                        >
                                            <FaSave size={12} />
                                            {editSaving ? 'Saving…' : 'Save'}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="flex items-center gap-1.5 text-sm text-gray-400 cursor-pointer hover:text-red-500"
                                        >
                                            <FaTimes size={12} /> Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="flex items-center gap-1.5 text-sm text-primary cursor-pointer hover:underline"
                                    >
                                        <FaEdit size={12} /> Edit
                                    </button>
                                )
                            )}
                        </div>
                        {/*  */}
                        {editMode ? (
                            <div className="space-y-4">
                                <div>
                                    <textarea
                                        rows={3}
                                        value={editProblem}
                                        onChange={e => setEditProblem(e.target.value)}
                                        placeholder="Describe your problem..."
                                        maxLength={500}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Type</label>
                                    <div className="flex gap-2">
                                        <ToggleBtn
                                            active={editApptType === 'Individual'}
                                            disabled={!doctorAllows(appointment.doctorId?.appointmentTypes, 'Individual')}
                                            onClick={() => setEditApptType('Individual')}
                                        >
                                            <FaUserMd size={12} /> Individual
                                        </ToggleBtn>
                                        <ToggleBtn
                                            active={editApptType === 'Group'}
                                            disabled={!doctorAllows(appointment.doctorId?.appointmentTypes, 'Group')}
                                            onClick={() => setEditApptType('Group')}
                                        >
                                            <FaUsers size={12} /> Group
                                        </ToggleBtn>
                                    </div>
                                    {appointment.doctorId?.appointmentTypes && appointment.doctorId.appointmentTypes.length > 0 && (
                                        <p className="text-xs text-gray-400 mt-1">Available: {appointment.doctorId.appointmentTypes.join(', ')}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Patient Status</label>
                                    <div className="flex gap-2">
                                        <ToggleBtn active={editVisitType === 'New'} onClick={() => setEditVisitType('New')}>
                                            <FaUserPlus size={12} /> New
                                        </ToggleBtn>
                                        <ToggleBtn active={editVisitType === 'Repeat'} onClick={() => setEditVisitType('Repeat')}>
                                            <FaUserCheck size={12} /> Repeat
                                        </ToggleBtn>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Mode</label>
                                    <div className="flex gap-2">
                                        <ToggleBtn
                                            active={editConsultType === 'Video'}
                                            disabled={!doctorAllows(appointment.doctorId?.consultationTypes, 'Video')}
                                            onClick={() => setEditConsultType('Video')}
                                        >
                                            <FaVideo size={12} /> Video
                                        </ToggleBtn>
                                        <ToggleBtn
                                            active={editConsultType === 'Audio'}
                                            disabled={!doctorAllows(appointment.doctorId?.consultationTypes, 'Audio')}
                                            onClick={() => setEditConsultType('Audio')}
                                        >
                                            <FaPhone size={12} /> Audio
                                        </ToggleBtn>
                                        <ToggleBtn
                                            active={editConsultType === 'In-person'}
                                            disabled={!doctorAllows(appointment.doctorId?.consultationTypes, 'In-person')}
                                            onClick={() => setEditConsultType('In-person')}
                                        >
                                            <FaMapMarkerAlt size={12} /> In-Person
                                        </ToggleBtn>
                                    </div>
                                    {appointment.doctorId?.consultationTypes && appointment.doctorId.consultationTypes.length > 0 && (
                                        <p className="text-xs text-gray-400 mt-1">Available: {appointment.doctorId.consultationTypes.join(', ')}</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                                {appointment.patientProblem ? (
                                    <p className="text-sm text-gray-700 leading-relaxed break-words whitespace-pre-wrap">{appointment.patientProblem}</p>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No problem description provided.</p>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Doctor Prescription / Description ------------ */}
                    {isDoctor ? (
                        <div className="card p-6">
                            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                <FaPills className="text-primary" /> Prescription
                            </h2>
                            <div className="space-y-3 mb-4">
                                {medicines.map((med, idx) => (
                                    <div key={idx} className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                                        <div>
                                            {idx === 0 && <label className="text-xs text-gray-500 mb-1 block">Medicine</label>}
                                            <input value={med.medicineName} onChange={e => updateMedicine(idx, 'medicineName', e.target.value)} placeholder="e.g. Paracetamol"
                                                className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"/>
                                        </div>
                                        <div>
                                            {idx === 0 && <label className="text-xs text-gray-500 mb-1 block">Dosage</label>}
                                            <input value={med.dosage} onChange={e => updateMedicine(idx, 'dosage', e.target.value)} placeholder="e.g. 500mg"
                                                className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary" />
                                        </div>
                                        <div>
                                            {idx === 0 && <label className="text-xs text-gray-500 mb-1 block">Frequency</label>}
                                            <input value={med.frequency} onChange={e => updateMedicine(idx, 'frequency', e.target.value)} placeholder="e.g. Twice daily"
                                                className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary" />
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                {idx === 0 && <label className="text-xs text-gray-500 mb-1 block">Duration</label>}
                                                <input value={med.duration} onChange={e => updateMedicine(idx, 'duration', e.target.value)} placeholder="e.g. 5 days"
                                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                            {medicines.length > 1 && (
                                                <button onClick={() => removeMedicine(idx)}
                                                    className={`p-2 rounded-lg text-red-400 hover:bg-red-50 transition ${idx === 0 ? 'mt-5' : ''}`}>
                                                    <FaTrash size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addMedicine} className="flex items-center gap-2 text-sm text-primary hover:underline mb-4">
                                <FaPlus size={11} /> Add Medicine
                            </button>
                            <div className="mb-4">
                                <label className="text-xs text-gray-500 mb-1 block">Doctor Description</label>
                                <textarea rows={3} value={doctorDescription} onChange={e => setDoctorDescription(e.target.value)}
                                    placeholder="Additional instructions, advice, follow-up..."
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <button onClick={handleSavePrescription} disabled={saving}
                                className="btn-primary flex items-center gap-2 px-5 py-2.5 disabled:opacity-50 cursor-pointer">
                                <FaSave size={13} />
                                {saving ? 'Saving…' : 'Save Prescription'}
                            </button>
                        </div>
                    ) : latestRx ? (
                        <div className="card p-6">
                            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                <FaPills className="text-primary" /> Prescription
                            </h2>
                            {latestRx.medicines.length > 0 && (
                                <div className="overflow-x-auto mb-4">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="text-xs text-gray-400 border-b border-gray-100">
                                                <th className="pb-2 pr-4 font-medium">Medicine</th>
                                                <th className="pb-2 pr-4 font-medium">Dosage</th>
                                                <th className="pb-2 pr-4 font-medium">Frequency</th>
                                                <th className="pb-2 font-medium">Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {latestRx.medicines.map((m, i) => (
                                                <tr key={i} className="border-b border-gray-50 last:border-0">
                                                    <td className="py-2 pr-4 font-medium text-gray-800">{m.medicineName}</td>
                                                    <td className="py-2 pr-4 text-gray-600">{m.dosage}</td>
                                                    <td className="py-2 pr-4 text-gray-600">{m.frequency}</td>
                                                    <td className="py-2 text-gray-600">{m.duration}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {latestRx.doctorDescription && (
                                <p className="text-sm text-gray-600 leading-relaxed">{latestRx.doctorDescription}</p>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Right column -------------------------------------------------------------- */}
                <div className="space-y-5">
                    {/* Person card ---------------------------------- */}
                    <div className="card p-6">
                        <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                            <FaUser className="text-primary" />
                            {isPatient ? 'Doctor' : 'Patient'}
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                                <Image
                                    src={isPatient ? (appointment.doctorId?.iconUrl || '/default-avatar.png') : (appointment.patientId?.iconUrl || '/default-avatar.png')}
                                    alt="avatar" fill className="object-cover" sizes="56px"
                                />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">
                                    {isPatient ? appointment.doctorName : appointment.patientName}
                                </p>
                                {isPatient && appointment.doctorId?.specialty && (
                                    <p className="text-sm text-primary">{appointment.doctorId.specialty}</p>
                                )}
                                {isDoctor && (
                                    <p className="text-sm text-gray-500">
                                        {[appointment.patientId?.gender, appointment.patientId?.age ? `${appointment.patientId.age} yrs` : ''].filter(Boolean).join(' · ')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Allergies & Problems ------------------------- */}
                    <div className="card p-6 space-y-4">
                        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                            <FaExclamationTriangle className="text-primary" /> Patient Health Info
                        </h2>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">Allergies</p>
                            {appointment.patientId?.allergies && appointment.patientId.allergies.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {appointment.patientId.allergies.map((a, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200 rounded-full text-xs font-medium">
                                            {a}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">None reported</p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">Conditions</p>
                            {appointment.patientId?.problems && appointment.patientId.problems.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {appointment.patientId.problems.map((p, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 ring-1 ring-red-200 rounded-full text-xs font-medium">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">None reported</p>
                            )}
                        </div>
                    </div>
                    {/* Actions card */}
                    {canEdit && (
                        <div className="card p-6">
                            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                <FaStethoscope className="text-primary" /> Actions
                            </h2>
                            <div className="space-y-2">
                                {isDoctor && (
                                    <button
                                        onClick={() => handleStatusChange('Completed')}
                                        disabled={!latestRx || (latestRx.medicines.length === 0 && !latestRx.doctorDescription)}
                                        title={!latestRx ? 'Save a prescription before completing' : undefined}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <FaCheckCircle /> Mark as Completed
                                    </button>
                                )}
                                {isDoctor && !latestRx && (
                                    <p className="text-xs text-gray-400 text-center">Add a prescription first to mark complete.</p>
                                )}
                                <button
                                    onClick={() => handleStatusChange('Cancelled')}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition ring-1 ring-red-200 cursor-pointer"
                                >
                                    <FaBan /> Cancel Appointment
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );

}