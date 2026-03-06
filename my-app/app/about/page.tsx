import Link from 'next/link';
import {
    FaUserMd, FaHeart, FaShieldAlt, FaMobile,
    FaStar, FaUsers, FaCalendarCheck,
} from 'react-icons/fa';

const STATS = [
    { value: '500+', label: 'Verified Doctors' },
    { value: '50K+', label: 'Happy Patients' },
    { value: '4.8', label: 'Average Rating' },
    { value: '24/7', label: 'Always Available' },
];

const VALUES = [
    { icon: <FaHeart />, title: 'Patient First', desc: 'Every decision we make starts with the patient. We are committed to making healthcare accessible, affordable, and human.' },
    { icon: <FaShieldAlt />, title: 'Trust & Safety', desc: 'All doctors on our platform are verified, licensed professionals. Your health data is encrypted and never sold.' },
    { icon: <FaCalendarCheck />, title: 'Convenience', desc: 'Book, reschedule, or cancel appointments in seconds. No phone calls, no waiting rooms — healthcare on your schedule.' },
    { icon: <FaMobile />, title: 'Always With You', desc: 'From mobile to desktop, Ayucare is always accessible. Your health records and appointments travel with you.' },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <section className="bg-primary relative overflow-hidden py-20">
                <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
                <div className="container-custom text-center relative">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-widest mb-4">
                        Our Story
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
                        Healthcare that <br className="hidden sm:block" />
                        <span className="text-white">puts you first</span>
                    </h1>
                    <p className="text-white/80 text-lg max-w-2xl mx-auto">
                        Ayucare was founded with a simple belief: every person deserves easy access to quality healthcare. We connect patients with trusted doctors — simply, transparently, and compassionately.
                    </p>
                </div>
            </section>

            <section className="bg-gray-50 py-12 border-b border-gray-100">
                <div className="container-custom">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                        {STATS.map(s => (
                            <div key={s.label}>
                                <p className="text-3xl font-bold text-gray-900" style={{ color: s.value === '4.8' ? '#46C2DE' : undefined }}>
                                    {s.value}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">Our Mission</span>
                            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
                                Making quality healthcare accessible to everyone
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                We started Ayucare after seeing how difficult it was for people to find the right doctor, book an appointment, and manage their health records — all in one place.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Today, Ayucare connects thousands of patients with verified doctors across specializations. We believe healthcare should be a seamless experience, not a frustrating one.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: <FaUserMd className="text-2xl text-primary" />, label: 'Find Doctors', sub: 'Browse by specialty' },
                                { icon: <FaCalendarCheck className="text-2xl text-primary" />, label: 'Book Instantly', sub: 'No waiting on hold' },
                                { icon: <FaStar className="text-2xl text-primary" />, label: 'Verified Reviews', sub: 'Real patient feedback' },
                                { icon: <FaUsers className="text-2xl text-primary" />, label: 'Community Care', sub: 'Group & individual' },
                            ].map(c => (
                                <div key={c.label} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                    {c.icon}
                                    <p className="font-semibold text-gray-800 mt-2 text-sm">{c.label}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{c.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">What We Stand For</span>
                        <h2 className="text-3xl font-bold text-gray-900 mt-2">Our core values</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {VALUES.map(v => (
                            <div key={v.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg text-primary">
                                    {v.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-primary relative overflow-hidden py-20">
                <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
                <div className="container-custom text-center relative">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to take control of your health?</h2>
                    <p className="text-white/80 mb-8">Join thousands of patients and doctors who trust Ayucare every day.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/signup"
                            className="px-8 py-3 bg-white font-semibold rounded-xl hover:bg-gray-50 transition text-primary"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            href="/doctors"
                            className="px-8 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition"
                        >
                            Browse Doctors
                        </Link>
                    </div>
                </div>
            </section>
            
        </div>
    );
}