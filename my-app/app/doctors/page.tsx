'use client';

import { useState, useMemo } from 'react';
import { users } from '@/data/users';
import DoctorCard from '@/components/DoctorCard';
import { FaUserMd, FaSearch, FaFilter } from 'react-icons/fa';

export default function DoctorsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');

    const doctors = users.filter(user => user.role === 'doctor');

    const specialties = useMemo(() => {
        const all = doctors.map(d => d.specialty).filter(Boolean) as string[];
        return ['All', ...Array.from(new Set(all))];
    }, [doctors]);

    const filteredDoctors = useMemo(() => {
        return doctors.filter(doctor => {
            const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (doctor.specialty?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchesSpecialty = selectedSpecialty === '' || selectedSpecialty === 'All' ||
                doctor.specialty === selectedSpecialty;
            return matchesSearch && matchesSpecialty;
        });
    }, [doctors, searchTerm, selectedSpecialty]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header with icon */}
                <div className="flex items-center gap-3 mb-8">
                    <FaUserMd className="text-4xl" style={{ color: '#46C2DE' }} />
                    <h1 className="text-3xl font-bold text-gray-900">Find a Doctor</h1>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                Search by name or specialty
                            </label>
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    id="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="e.g., Cardiology"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#46C2DE]"
                                />
                            </div>
                        </div>
                        <div className="md:w-64 relative">
                            <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <FaFilter className="text-gray-400" /> Filter by specialty
                            </label>
                            <select
                                id="specialty"
                                value={selectedSpecialty}
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#46C2DE] appearance-none bg-white"
                            >
                                {specialties.map(specialty => (
                                    <option key={specialty} value={specialty}>{specialty}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results count with icon */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <FaUserMd className="text-gray-400" />
                    <span>
                        Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Doctor Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map(doctor => (
                        <DoctorCard key={doctor.id} doctor={doctor} />
                    ))}
                </div>

                {filteredDoctors.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No doctors match your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}