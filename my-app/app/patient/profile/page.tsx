'use client';

import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { generatePrescriptionPDF } from '@/utils/pdfGenerator';
import {
    FaAllergies, FaArrowRight, FaCalendarAlt, FaCalendarCheck, FaClipboardList, FaDownload,
    FaEdit, FaEnvelope, FaExclamationTriangle, FaEye, FaFileMedical, FaFilePrescription, FaFlask,
    FaHeart, FaHeartbeat, FaLungs,
    FaPhone, FaPrescriptionBottle, FaQuoteLeft, FaRulerVertical, FaStethoscope, FaThermometerHalf, FaTimes, FaTint,
    FaUser, FaUserCircle, FaVenusMars, FaWeightHanging
} from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface BookedSlot {
    date: string; startTime: string;
}

interface Document {
    title: string; fileUrl: string; uploadedAt: string;
}

interface TestReport {
    testName: string; reportFileUrl: string; result: string; date: string;
}

interface VitalSigns {
    bloodPressure?: string; heartRate?: number; temperature?: number; oxygenLevel?: number; sugarLevel?: number; respiratoryRate?: number; recordedAt?: string;
}

interface EmergencyContact {
    name: string;
    relation: 'Parent' | 'Sibling' | 'Spouse' | 'Child' | 'Friend' | 'Other';
    email?: string;
    mobile?: string;
}

interface PrescriptionMedicine {
    medicineName: string; dosage: string; frequency: string; duration: string;
}

interface Prescription {
    medicines: PrescriptionMedicine[]; doctorDescription: string; prescribedAt: string;
}

interface AppointmentWithPrescription {
    _id: string;
    patientName: string;
    doctorName: string;
    doctorId: { name: string; specialty?: string };
    date: string;
    startTime: string;
    patientProblem?: string;
    prescription?: Prescription[];
}

interface ApiAppointment extends AppointmentWithPrescription {
    status: string;
}

interface FullPatient {
    _id: string;
    name: string; iconUrl?: string; age?: number;
    height?: number; weight?: number; gender?: string;
    allergies?: string[]; bloodGroup?: string; problems?: string[];
    documents?: Document[]; vitalSigns?: VitalSigns[], testReports?: TestReport[];
    emergencyContacts?: EmergencyContact[]; appointments?: string[]; bookedSlots?: BookedSlot[];
}

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
// ────────────────────────────────────────────────────────────────────────────────────────────────

function PrescriptionModal({ appointment, onClose }: { appointment: AppointmentWithPrescription; onClose: () => void }) {
    if (!appointment.prescription || appointment.prescription.length === 0) return null;

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const to12Hour = (t: string) => { if (!t) return ''; const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };

    const pres = appointment.prescription[appointment.prescription.length - 1];

    const handleDownload = () => {
        generatePrescriptionPDF({
            patientName: appointment.patientName || 'Patient',
            doctorName: appointment.doctorName,
            doctorSpecialty: appointment.doctorId?.specialty,
            date: appointment.date,
            startTime: appointment.startTime,
            patientProblem: appointment.patientProblem,
            prescription: pres,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-1xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* ── Header ── */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <FaFilePrescription className="text-primary" />
                        <h3 className="font-bold text-gray-900">Prescription</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg cursor-pointer hover:opacity-90 transition"
                        >
                            <FaDownload size={10} /> Download
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 cursor-pointer">
                            <FaTimes />
                        </button>
                    </div>
                </div>
                <div className="p-5 space-y-5">
                    {/* ── Doctor info banner ── */}
                    <div className="flex items-center gap-4 bg-primary/5 border border-primary/10 rounded-xl p-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FaStethoscope className="text-primary text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 break-words">{appointment.doctorName}</p>
                            {appointment.doctorId?.specialty && (
                                <p className="text-sm text-primary font-medium break-words">{appointment.doctorId.specialty}</p>
                            )}
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-500">{formatDate(appointment.date)}</p>
                            <p className="text-xs text-gray-400">{to12Hour(appointment.startTime)}</p>
                        </div>
                    </div>
                    {/* ── Patient complaint ── */}
                    {appointment.patientProblem && (
                        <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5">Patient Complaint</p>
                            <p className="text-sm text-gray-700 leading-relaxed break-words">{appointment.patientProblem}</p>
                        </div>
                    )}
                    {/* ── Medicines ── */}
                    {pres.medicines.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Medicines</p>
                            <div className="space-y-2">
                                {pres.medicines.map((med, i) => (
                                    <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <FaPrescriptionBottle size={11} className="text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm break-words">{med.medicineName}</p>
                                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                                                {med.dosage && <span className="text-xs text-gray-500 break-all">💊 {med.dosage}</span>}
                                                {med.frequency && <span className="text-xs text-gray-500 break-all">🔁 {med.frequency}</span>}
                                                {med.duration && <span className="text-xs text-gray-500 break-all">📅 {med.duration}</span>}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">#{i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* ── Doctor notes ── */}
                    {pres.doctorDescription && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1.5">Doctor&apos;s Notes</p>
                            <p className="text-sm text-gray-700 leading-relaxed break-words">{pres.doctorDescription}</p>
                        </div>
                    )}
                    {/* ── Footer ── */}
                    <div className="pt-5 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            Prescribed on {new Date(pres.prescribedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main Page ──────────────────────────────────────────────────────────────────────────────────────
export default function PatientProfile() {
    const router = useRouter();
    const { user } = useAuth();
    const [patient, setPatient] = useState<FullPatient | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'prescriptions' | 'documents' | 'test-reports' | 'vital-signs' | 'emergency'>('profile');
    const [appointments, setAppointments] = useState<AppointmentWithPrescription[]>([]);
    const [selectedPrescription, setSelectedPrescription] = useState<AppointmentWithPrescription | null>(null);

    useEffect(() => {
        if (!user) router.push('/');
        else if (user.role !== 'patient') router.push('/doctor/profile');
    }, [user, router]);

    useEffect(() => {
        const pid = user?.profileId;
        if (!pid) return;
        const fetchPatient = async () => {
            try {
                const res = await fetch(`${API_URL}/patients/${pid}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        setPatient({
                            _id: pid,
                            name: user.name, iconUrl: undefined, age: undefined, height: undefined, weight: undefined, gender: undefined,
                            allergies: [], bloodGroup: undefined, problems: [], documents: [], vitalSigns: [], testReports: [],
                            emergencyContacts: [], appointments: [], bookedSlots: [],
                        });
                        return;
                    }
                    throw new Error('Failed to fetch patient');
                }
                const data = await res.json();
                setPatient(data);
            } catch (error) {
                console.error(error);
                toast.error('Could not load patient data');
                setPatient({
                    _id: pid,
                    name: user.name, iconUrl: undefined, age: undefined,
                    height: undefined, weight: undefined, gender: undefined,
                    allergies: [], bloodGroup: undefined, problems: [],
                    documents: [], vitalSigns: [], testReports: [],
                    emergencyContacts: [], appointments: [], bookedSlots: [],
                });
            } finally {
                setLoading(false);
            }
        };
        fetchPatient();
    }, [user]);


    useEffect(() => {
        const uid = user?._id;
        if (!uid) return;
        const fetchAppointments = async () => {
            try {
                const res = await fetch(`${API_URL}/appointments?userId=${uid}&role=patient`);
                if (!res.ok) throw new Error('Failed to fetch appointments');
                const data: ApiAppointment[] = await res.json();
                const completed = data.filter(apt => apt.status === 'Completed');
                setAppointments(completed);
            } catch (error) {
                console.error(error);
                toast.error('Could not load your prescriptions');
            }
        };
        fetchAppointments();
    }, [user]);

    if (!user || user.role !== 'patient') return null;
    if (loading) return <div className="text-center py-20">Loading profile...</div>;
    if (!patient) return <div className="text-center py-20">Patient not found</div>;
    const p = patient;

    // Latest vital signs
    const latestVitals = p.vitalSigns && p.vitalSigns.length > 0
        ? p.vitalSigns.sort((a, b) => new Date(b.recordedAt || 0).getTime() - new Date(a.recordedAt || 0).getTime())[0]
        : null;

    const bmi = p.height && p.weight ? (p.weight / Math.pow(p.height / 100, 2)).toFixed(1) : null;        // BMI calculation
    const bmiLabel = bmi === null ? null :
        Number(bmi) < 18.5 ? 'Underweight' :
            Number(bmi) < 25 ? 'Normal' :
                Number(bmi) < 30 ? 'Overweight' : 'Obese';

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

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
                                src={p.iconUrl || '/default-avatar.png'}
                                alt={p.name}
                                fill
                                className="object-cover"
                                sizes="112px"
                            />
                        </div>
                        <div className="text-center sm:text-left sm:pb-4">
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">{p.name}</h1>
                                <Link href="/patient/profile/update">
                                    <button className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition flex-shrink-0 cursor-pointer" title='Update'>
                                        <FaEdit className="text-white text-xs" />
                                    </button>
                                </Link>
                            </div>
                            <p className="text-white text-sm italic mt-1 flex items-center gap-1 justify-center sm:justify-start capitalize">
                                <FaQuoteLeft size={10} /> {[p.gender, p.age ? `${p.age} yrs` : null].filter(Boolean).join(' · ') || 'Patient'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section ----------------------------------------------------------------- */}
            <div className="container-custom py-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard icon={<FaTint />} value={p.bloodGroup} label="Blood Group" />
                    <StatCard icon={<FaRulerVertical />} value={p.height ? `${p.height} cm` : '—'} label="Height" />
                    <StatCard icon={<FaWeightHanging />} value={p.weight ? `${p.weight} kg` : '—'} label="Weight" />
                    <StatCard icon={<FaUserCircle />} value={bmi ?? '—'} label="BMI" />
                </div>
            </div>

            {/* Tab Navigation ---------------------------------------------------------------- */}
            <div className="container-custom mb-6 overflow-x-auto">
                <div className="flex gap-2 pb-2">
                    <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<FaUser size={14} />} label="Profile" />
                    <TabButton active={activeTab === 'prescriptions'} onClick={() => setActiveTab('prescriptions')} icon={<FaFilePrescription size={14} />} label="Prescriptions" />
                    <TabButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} icon={<FaFileMedical size={14} />} label="Documents" />
                    <TabButton active={activeTab === 'vital-signs'} onClick={() => setActiveTab('vital-signs')} icon={<FaHeartbeat size={14} />} label="Vital Signs" />
                    <TabButton active={activeTab === 'test-reports'} onClick={() => setActiveTab('test-reports')} icon={<FaFlask size={14} />} label="Test Reports" />
                    <TabButton active={activeTab === 'emergency'} onClick={() => setActiveTab('emergency')} icon={<FaExclamationTriangle size={14} />} label="Emergency" />
                </div>
            </div>

            {/* Main Content ------------------------------------------------------------------ */}
            <div className="container-custom pb-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column ---------------------------------- */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h2 className="text-xs font-bold text-gray uppercase tracking-widest mb-3">Personal</h2>
                                <FieldRow icon={<FaVenusMars />} label="Gender" value={p.gender} />
                                <FieldRow icon={<FaCalendarAlt />} label="Age" value={`${p.age} years`} />
                                <FieldRow icon={<FaRulerVertical />} label="Height" value={`${p.height} cm`} />
                                <FieldRow icon={<FaWeightHanging />} label="Weight" value={`${p.weight} kg`} />
                                {bmi && bmiLabel && (
                                    <FieldRow icon={<FaUserCircle />} label="BMI" value={`${bmi} — ${bmiLabel}`} />
                                )}
                                <FieldRow icon={<FaTint />} label="Blood Group" value={p.bloodGroup} />
                            </div>
                        )}

                        {/* Prescriptions Tab */}
                        {activeTab === 'prescriptions' && (
                            <div className="space-y-4">
                                {appointments.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                        <FaFilePrescription className="text-4xl text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No prescriptions yet</p>
                                    </div>
                                ) : (
                                    appointments.map((apt) => (
                                        apt.prescription && apt.prescription.length > 0 && (
                                            <div
                                                key={apt._id}
                                                onClick={() => setSelectedPrescription(apt)}
                                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
                                            >
                                                {/*  */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{apt.doctorName}</h3>
                                                        <p className="text-sm text-primary font-medium">{apt.doctorId?.specialty}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(apt.date)} at {apt.startTime}</p>
                                                    </div>
                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex-shrink-0">Prescribed</span>
                                                </div>
                                                {/*  */}
                                                {apt.prescription.map((pres, idx) => (
                                                    <div key={idx} className="space-y-2">
                                                        {/* Medicines preview */}
                                                        {pres.medicines.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {pres.medicines.slice(0, 3).map((m, i) => (
                                                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                                                                        <FaPrescriptionBottle size={9} className="text-primary" />
                                                                        {m.medicineName}
                                                                    </span>
                                                                ))}
                                                                {pres.medicines.length > 3 && (
                                                                    <span className="text-xs text-gray-400">+{pres.medicines.length - 3} more</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {/*  */}
                                                <p className="text-xs text-primary mt-2 text-right">View full prescription →</p>
                                            </div>
                                        )
                                    ))
                                )}
                            </div>
                        )}

                        {/* Documents Tab */}
                        {activeTab === 'documents' && (
                            <div className="space-y-4">
                                {!p.documents || p.documents.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                        <FaFileMedical className="text-4xl text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No documents uploaded</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {p.documents.map((doc, idx) => (
                                            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FaFileMedical className="text-primary" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{doc.title}</p>
                                                        <p className="text-xs text-gray-400">{formatDate(doc.uploadedAt)}</p>
                                                    </div>
                                                </div>
                                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark">
                                                    <FaEye size={18} />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Test Reports Tab */}
                        {activeTab === 'test-reports' && (
                            <div className="space-y-4">
                                {!p.testReports || p.testReports.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                        <FaFlask className="text-4xl text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No test reports available</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {p.testReports.map((report, idx) => (
                                            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{report.testName}</h3>
                                                        <p className="text-sm text-gray-500">{formatDate(report.date)}</p>
                                                        {report.result && <p className="text-sm text-gray-700 mt-1">Result: {report.result}</p>}
                                                    </div>
                                                    <a href={report.reportFileUrl} target="_blank" rel="noopener noreferrer" className="btn-outline flex items-center gap-2 px-3 py-1.5 text-xs">
                                                        <FaEye /> View
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Vital Signs Tab */}
                        {activeTab === 'vital-signs' && (
                            <div className="space-y-4">
                                {!latestVitals ? (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                        <FaHeartbeat className="text-4xl text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No vital signs recorded</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                        <h2 className="text-xs font-bold text-gray uppercase tracking-widest mb-3">Vital Signs (latest)</h2>
                                        <div className="divide-y divide-gray-100">
                                            {latestVitals.bloodPressure && (
                                                <FieldRow icon={<FaHeartbeat />} label="Blood Pressure" value={latestVitals.bloodPressure} />
                                            )}
                                            {latestVitals.heartRate && (
                                                <FieldRow icon={<FaHeart />} label="Heart Rate" value={`${latestVitals.heartRate} bpm`} />
                                            )}
                                            {latestVitals.temperature && (
                                                <FieldRow icon={<FaThermometerHalf />} label="Temperature" value={`${latestVitals.temperature}°F`} />
                                            )}
                                            {latestVitals.oxygenLevel && (
                                                <FieldRow icon={<FaLungs />} label="Oxygen Level" value={`${latestVitals.oxygenLevel}%`} />
                                            )}
                                            {latestVitals.sugarLevel && (
                                                <FieldRow icon={<FaTint />} label="Sugar Level" value={`${latestVitals.sugarLevel} mg/dL`} />
                                            )}
                                            {latestVitals.respiratoryRate && (
                                                <FieldRow icon={<FaLungs />} label="Respiratory Rate" value={`${latestVitals.respiratoryRate} breaths/min`} />
                                            )}
                                        </div>
                                        {latestVitals.recordedAt && (
                                            <p className="text-xs text-gray-400 mt-3 text-center">Last updated: {formatDate(latestVitals.recordedAt)}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Emergency Tab */}
                        {activeTab === 'emergency' && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <div className="space-y-6">
                                    {/*  */}
                                    <div>
                                        <h2 className="text-xs font-bold text-gray uppercase tracking-widest mb-2">Emergency Info</h2>
                                        <FieldRow icon={<FaAllergies />} label="Allergies"
                                            value={
                                                p.allergies && p.allergies.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {p.allergies.map((allergy, i) => (
                                                            <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                                                {allergy}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    'None reported'
                                                )
                                            }
                                        />
                                        <FieldRow icon={<FaClipboardList />} label="Problems"
                                            value={
                                                p.problems && p.problems.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {p.problems.map((prob, i) => (
                                                            <span key={i} className="px-2 py-1 bg-red-100 text-red-500 rounded-full text-xs">
                                                                {prob}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    'None reported'
                                                )
                                            }
                                        />
                                    </div>
                                    {/*  */}
                                    {p.emergencyContacts && p.emergencyContacts.length > 0 && (
                                        <div>
                                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Emergency Contacts</h2>
                                            <div className="space-y-4">
                                                {p.emergencyContacts.map((contact, idx) => (
                                                    <div key={idx} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                                                        <p className="font-semibold text-gray-900">{contact.name}</p>
                                                        <p className="text-sm text-gray-600 capitalize">Relation: {contact.relation}</p>
                                                        {contact.email && <p className="text-sm text-gray-600">Email: {contact.email}</p>}
                                                        {contact.mobile && <p className="text-sm text-gray-600">Mobile: {contact.mobile}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/*  */}
                                    <div>
                                        <h2 className="text-xs font-bold text-gray uppercase tracking-widest mb-2">Safety Precautions</h2>
                                        <div className="divide-y divide-gray-100">
                                            <FieldRow icon={<FaPhone />} label="Ambulance" value={108} />
                                            <FieldRow icon={<FaStethoscope />} label="Emergency Helpline" value={+1234567890} />
                                        </div>
                                        <br />
                                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                                            <li>Keep emergency numbers handy</li>
                                            <li>Always carry your medical ID and blood group details</li>
                                            <li>Inform family members about your health conditions</li>
                                            <li>Store your medications in a safe place</li>
                                            <li>In case of emergency, call 108 immediately</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column --------------------------------- */}
                    <div className="space-y-6">
                        {/* Contact */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-xs font-bold text-gray uppercase tracking-widest mb-3">Contact</h2>
                            <FieldRow icon={<FaEnvelope />} label="Email" value={user.email} />
                            <FieldRow icon={<FaPhone />} label="Mobile" value={user.mobile} />
                        </div>
                        {/* Book an Appointment */}
                        <Link href="/doctors"
                            className="flex items-center gap-2 p-5 rounded-2xl bg-primary text-white transition-all group"
                        >
                            <div className="flex-1">
                                <p className="font-semibold text-white">Book an Appointment</p>
                                <p className="text-sm text-gray leading-relaxed mt-1">Browse available doctors</p>
                            </div>
                            <FaArrowRight className="text-white/80 group-hover:text-white transition-colors" />
                        </Link>
                        {/* Appointments */}
                        <Link href="/appointments"
                            className="flex items-center justify-between bg-white rounded-2xl border border-primary/20 shadow-sm p-5 hover:border-primary/50 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-2">
                                <FaCalendarCheck className="text-primary" />
                                <div>
                                    <p className="font-semibold text-gray-500">My Appointments</p>
                                    <p className="text-sm text-gray leading-relaxed mt-0.5">View, manage & track all your bookings</p>
                                </div>
                            </div>
                            <FaArrowRight className="text-gray-300 group-hover:text-primary transition-colors" />
                        </Link>
                    </div>

                </div>
            </div>

            {/* Prescription Modal ------------------------------------------------------------ */}
            {selectedPrescription && (
                <PrescriptionModal appointment={selectedPrescription} onClose={() => setSelectedPrescription(null)} />
            )}
        </div>
    );

}