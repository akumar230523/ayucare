'use client';

import { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaFilter, FaUserMd, FaTimes } from 'react-icons/fa';
import DoctorCard from '@/components/DoctorCard';

interface Doctor {
    _id: string;
    name: string;
    specialty?: string;
    rating?: number;
    experienceYears?: number;
    iconUrl?: string;
    expression?: string;
    about?: string;
    fee?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await fetch(`${API_URL}/doctors`);
                const data = await res.json();
                setDoctors(data);
            } catch (err) {
                console.error('Failed to fetch doctors:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const specialties = useMemo(() => {
        const all = doctors.map((d) => d.specialty).filter(Boolean) as string[];
        return Array.from(new Set(all)).sort();
    }, [doctors]);

    const filtered = useMemo(() => {
        const q = searchTerm.toLowerCase();
        return doctors.filter((d) => {
            const matchSearch =
                d.name.toLowerCase().includes(q) ||
                (d.specialty?.toLowerCase() ?? '').includes(q) ||
                (d.about?.toLowerCase() ?? '').includes(q);
            const matchSpecialty = !selectedSpecialty || d.specialty === selectedSpecialty;
            return matchSearch && matchSpecialty;
        });
    }, [doctors, searchTerm, selectedSpecialty]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSpecialty('');
    };

    const hasFilters = searchTerm || selectedSpecialty;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-primary relative overflow-hidden py-12">
                <div className="absolute -top-8 -right-8 w-52 h-52 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />

                <div className="container-custom relative">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <FaUserMd className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Find Doctors</h1>
                    </div>
                    <p className="text-white/75 text-sm mb-6">
                        Browse verified doctors by name, specialty, or search below
                    </p>

                    <div className="relative max-w-xl">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, specialty…"
                            className="w-full pl-11 pr-10 py-3 rounded-xl bg-white border border-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                <FaTimes size={13} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                {specialties.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mb-6">
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">
                            <FaFilter size={10} /> Filter
                        </span>
                        <button
                            onClick={() => setSelectedSpecialty('')}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!selectedSpecialty
                                    ? 'bg-primary text-white'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                                }`}
                        >
                            All
                        </button>
                        {specialties.map((s) => (
                            <button
                                key={s}
                                onClick={() => setSelectedSpecialty(s === selectedSpecialty ? '' : s)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedSpecialty === s
                                        ? 'bg-primary text-white'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between mb-5">
                    <p className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">{filtered.length}</span>{' '}
                        doctor{filtered.length !== 1 ? 's' : ''} found
                        {selectedSpecialty && (
                            <span className="text-primary font-medium"> · {selectedSpecialty}</span>
                        )}
                    </p>
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition"
                        >
                            <FaTimes size={11} /> Clear filters
                        </button>
                    )}
                </div>

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="card p-5 animate-pulse">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-xl bg-gray-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 bg-gray-200 rounded" />
                                    <div className="h-2 bg-gray-200 rounded w-5/6" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map((doctor) => (
                            <DoctorCard key={doctor._id} doctor={doctor} />
                        ))}
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <FaUserMd className="text-2xl text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium mb-1">No doctors found</p>
                        <p className="text-sm text-gray-400 mb-4">Try adjusting your search or filters</p>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-primary font-medium hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}