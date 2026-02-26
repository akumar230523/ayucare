'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaUser, FaBriefcase, FaStar, FaClock, FaShieldAlt, FaMobileAlt } from 'react-icons/fa';

interface Doctor {
    _id: string;
    name: string;
    specialty: string;
    expression?: string;
    rating: number;
    experienceYears: number;
    iconUrl: string;
    patientsCount?: string;
    reviewsCount?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Home() {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [stats, setStats] = useState({ totalDoctors: 0, totalPatients: 0, avgRating: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch patient count
                const patientsRes = await fetch(`${API_URL}/users/patients/count`);
                const patientsData = await patientsRes.json();
                // Fetch doctors
                const doctorsRes = await fetch(`${API_URL}/users/doctors`);
                const doctorsData = await doctorsRes.json();
                setDoctors(doctorsData);
                const totalDoctors = doctorsData.length;
                const totalPatients = patientsData.count || 0;
                // Calculate average rating
                const avgRating = totalDoctors > 0
                    ? (doctorsData.reduce((acc: number, d: Doctor) => acc + (d.rating || 0), 0) / totalDoctors).toFixed(1)
                    : 0;
                setStats({ totalDoctors, totalPatients, avgRating: Number(avgRating) });
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();
    }, []);

    // Get top 4 doctors by rating
    const topDoctors = [...doctors].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 to-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to Ayucare</h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Your trusted health companion. Connect with top doctors, book appointments, and manage your wellness journey.
                    </p>
                    <Link
                        href="/doctors"
                        className="inline-block px-8 py-4 text-lg font-medium text-white rounded-lg hover:opacity-90 transition shadow-lg"
                        style={{ backgroundColor: '#46C2DE' }}
                    >
                        Browse Doctors
                    </Link>
                </div>
            </section>

            {/* Stats Banner */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div>
                            <FaUser className="text-4xl mx-auto mb-2" style={{ color: '#46C2DE' }} />
                            <div className="text-3xl font-bold text-gray-900">{stats.totalPatients}+</div>
                            <div className="text-gray-600">Happy Patients</div>
                        </div>
                        <div>
                            <FaBriefcase className="text-4xl mx-auto mb-2" style={{ color: '#46C2DE' }} />
                            <div className="text-3xl font-bold text-gray-900">{stats.totalDoctors}+</div>
                            <div className="text-gray-600">Expert Doctors</div>
                        </div>
                        <div>
                            <FaStar className="text-4xl mx-auto mb-2" style={{ color: '#46C2DE' }} />
                            <div className="text-3xl font-bold text-gray-900">{stats.avgRating}</div>
                            <div className="text-gray-600">Average Rating</div>
                        </div>
                        <div>
                            <FaClock className="text-4xl mx-auto mb-2" style={{ color: '#46C2DE' }} />
                            <div className="text-3xl font-bold text-gray-900">24/7</div>
                            <div className="text-gray-600">Support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Top Rated Doctors */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Top Rated Doctors</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {topDoctors.map(doctor => (
                            <div
                                key={doctor._id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                            >
                                <div className="p-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
                                            <Image
                                                src={doctor.iconUrl || '/default-avatar.png'}
                                                alt={doctor.name}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                                            <p className="text-sm" style={{ color: '#46C2DE' }}>{doctor.specialty || '-'}</p>
                                            {doctor.expression && (
                                                <p className="text-sm text-gray-500 italic">
                                                    &ldquo;{doctor.expression}&rdquo;
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                <span className="text-sm text-gray-600">{doctor.rating ?? 'null'}</span>
                                                <FaStar className="text-yellow-400" />
                                            </div>
                                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                <FaBriefcase className="text-gray-400" />
                                                <span>{doctor.experienceYears ?? 'null'} years</span>
                                            </div>
                                        </div>
                                        <Link href={`/appointment/${doctor._id}`} onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="text-sm px-3 py-1 rounded-md text-white hover:opacity-90 transition cursor-pointer"
                                                style={{ backgroundColor: '#46C2DE' }}
                                            >
                                                Book
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link href="/doctors" className="inline-block px-6 py-3 border-2 rounded-lg hover:bg-gray-100 transition" style={{ borderColor: '#46C2DE', color: '#46C2DE' }}>
                            View All Doctors
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section (unchanged) */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Ayucare?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                                <FaShieldAlt className="text-3xl" style={{ color: '#46C2DE' }} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Trusted Professionals</h3>
                            <p className="text-gray-600">All doctors are verified and have years of experience.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                                <FaClock className="text-3xl" style={{ color: '#46C2DE' }} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
                            <p className="text-gray-600">Book appointments in seconds with our simple interface.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                                <FaMobileAlt className="text-3xl" style={{ color: '#46C2DE' }} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">24/7 Access</h3>
                            <p className="text-gray-600">Manage your health anytime, anywhere, on any device.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action for non-logged in users (unchanged) */}
            {!user && (
                <section className="py-16" style={{ backgroundColor: '#46C2DE' }}>
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Ready to start your health journey?</h2>
                        <p className="text-xl text-white mb-8">Join Ayucare today and connect with the best doctors.</p>
                        <Link href="/signup" className="inline-block px-8 py-4 bg-white text-lg font-medium rounded-lg hover:bg-gray-100 transition" style={{ color: '#46C2DE' }}>
                            Sign Up Now
                        </Link>
                    </div>
                </section>
            )}
        </div>
    );
}