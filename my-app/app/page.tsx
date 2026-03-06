'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import DoctorCard from '@/components/DoctorCard';
import { FaUser, FaBriefcase, FaStar, FaClock, FaShieldAlt, FaMobileAlt } from 'react-icons/fa';

interface Doctor {
    _id: string; iconUrl?: string; name: string;
    specialty?: string; expression?: string;
    about?: string; rating?: number; experienceYears?: number; fee?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Home() {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [stats, setStats] = useState({ totalDoctors: 0, totalPatients: 0, avgRating: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsRes, doctorsRes] = await Promise.all([
                    fetch(`${API_URL}/patients/count`),
                    fetch(`${API_URL}/doctors`),
                ]);
                const patientsData = await patientsRes.json();
                const doctorsData = await doctorsRes.json();
                setDoctors(doctorsData);
                const totalPatients = patientsData.count || 0;
                const totalDoctors = doctorsData.length;
                const avgRating = totalDoctors > 0 ? (doctorsData.reduce((acc: number, d: Doctor) => acc + (d.rating || 0), 0) / totalDoctors).toFixed(1) : 0;
                setStats({ totalDoctors, totalPatients, avgRating: Number(avgRating) });
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const topDoctors = [...doctors].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero -------------------------------------------------------------------------- */}
            <section className="bg-primary relative overflow-hidden py-16 md:py-24">
                <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
                <div className="container-custom text-center relative">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-widest mb-4">
                        Your Health Partner
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Welcome to Ayucare
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                        Your trusted health companion. Connect with top doctors, book appointments, and manage your wellness journey.
                    </p>
                    <Link
                        href="/doctors"
                        className="inline-block px-8 py-2.5 bg-white/20 text-white font-semibold rounded-xl hover:bg-white hover:text-primary transition shadow-lg"
                    >
                        Browse Doctors
                    </Link>
                </div>
            </section>

            {/* Stats ------------------------------------------------------------------------- */}
            <section className="py-12 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full" />
                                    <div className="h-6 bg-gray-200 rounded w-16 mx-auto mb-1" />
                                    <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
                                </div>
                            ))
                        ) : (
                            <>
                                <div>
                                    <FaUser className="text-4xl mx-auto mb-2 text-primary" />
                                    <div className="text-3xl font-bold text-gray-900">{stats.totalPatients}+</div>
                                    <div className="text-gray-600">Happy Patients</div>
                                </div>
                                <div>
                                    <FaBriefcase className="text-4xl mx-auto mb-2 text-primary" />
                                    <div className="text-3xl font-bold text-gray-900">{stats.totalDoctors}+</div>
                                    <div className="text-gray-600">Expert Doctors</div>
                                </div>
                                <div>
                                    <FaStar className="text-4xl mx-auto mb-2 text-primary" />
                                    <div className="text-3xl font-bold text-gray-900">{stats.avgRating}</div>
                                    <div className="text-gray-600">Average Rating</div>
                                </div>
                                <div>
                                    <FaClock className="text-4xl mx-auto mb-2 text-primary" />
                                    <div className="text-3xl font-bold text-gray-900">24/7</div>
                                    <div className="text-gray-600">Support</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Top Doctors ------------------------------------------------------------------- */}
            <section className="py-16 bg-gray-50">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Top Rated Doctors</h2>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array(4).fill(0).map((_, i) => (
                                <div key={i} className="card p-5 animate-pulse">
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gray-200" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {topDoctors.map(doctor => (
                                    <DoctorCard key={doctor._id} doctor={doctor} />
                                ))}
                            </div>
                            <div className="text-center mt-8">
                                {/* className="inline-block px-8 py-2.5 bg-white/20 text-white font-semibold rounded-xl hover:bg-white hover:text-primary transition shadow-lg" */}
                                <Link href="/doctors" className="btn-outline inline-block px-8 py-2 hover:bg-primary hover:text-white transition">
                                    View All Doctors
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Features ---------------------------------------------------------------------- */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Ayucare?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <FaShieldAlt className="text-3xl text-primary" />, title: 'Trusted Professionals', desc: 'All doctors are verified and have years of experience.' },
                            { icon: <FaClock className="text-3xl text-primary" />, title: 'Easy Booking', desc: 'Book appointments in seconds with our simple interface.' },
                            { icon: <FaMobileAlt className="text-3xl text-primary" />, title: '24/7 Access', desc: 'Manage your health anytime, anywhere, on any device.' },
                        ].map((feat, i) => (
                            <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                    {feat.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
                                <p className="text-gray-600">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ------------------------------------------------------------------------------- */}
            <section className="bg-primary relative overflow-hidden py-20">
                <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
                <div className="container-custom text-center relative">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to start your health journey?</h2>
                    <p className="text-white/80 mb-8">Join Ayucare today and connect with the best doctors.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {!user && <Link
                            href="/signup"
                            className="px-8 py-3 bg-white font-semibold rounded-xl hover:bg-gray-50 transition text-primary"
                        >
                            Sign Up Now
                        </Link>}

                        <Link
                            href="/doctors"
                            className="inline-block px-8 py-2.5 bg-white/20 text-white font-semibold rounded-xl hover:bg-white hover:text-primary transition shadow-lg"
                        >
                            Browse Doctors
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );

}