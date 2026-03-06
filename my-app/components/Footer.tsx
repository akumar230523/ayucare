import Link from 'next/link';
import { FaTwitter, FaLinkedinIn, FaInstagram, FaTelegram, FaYoutube, FaUserMd, FaPhone, FaEnvelope, FaMapMarkerAlt, FaRegCopyright } from 'react-icons/fa';

const SOCIAL = [
    { icon: <FaTwitter size={15} />, href: '#', label: 'Twitter' },
    { icon: <FaLinkedinIn size={15} />, href: '#', label: 'LinkedIn' },
    { icon: <FaInstagram size={15} />, href: '#', label: 'Instagram' },
    { icon: <FaTelegram size={15} />, href: '#', label: 'Facebook' },
    { icon: <FaYoutube size={15} />, href: '#', label: 'YouTube' },
];

const NAV_LINKS = {
    Company: [
        { label: 'About Us', href: '/about' },
        { label: 'Doctors', href: '/doctors' },
        { label: 'Careers', href: '#' },
        { label: 'Press', href: '#' },
    ],
    Support: [
        { label: 'Help Center', href: '#' },
        { label: 'Contact Us', href: '#' },
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
    ],
    'For Doctors': [
        { label: 'Join as Doctor', href: '/signup' },
        { label: 'Doctor Portal', href: '/appointments' },
        { label: 'Profile Setup', href: '/doctor/profile/edit' },
    ],
};

const CONTACT = [
    { icon: <FaPhone size={12} />, text: '+91 12345 67890' },
    { icon: <FaEnvelope size={12} />, text: 'support@ayucare.in' },
    { icon: <FaMapMarkerAlt size={12} />, text: 'New Delhi, Delhi, INDIA' },
];

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 text-gray-600">
            <div className="container-custom pt-12 pb-8">

                {/*  */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
                    {/* Brand */}
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                                <FaUserMd className="text-white text-sm" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                Ayu<span className="text-primary">care</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed text-gray-500 mb-5 max-w-xs">
                            Your trusted health companion. Connect with verified doctors, book appointments, and manage your wellness journey.
                        </p>
                        <ul className="space-y-2 mb-5">
                            {CONTACT.map((c) => (
                                <li key={c.text} className="flex items-center gap-2 text-sm text-gray-500">
                                    <span className="text-primary">{c.icon}</span>
                                    {c.text}
                                </li>
                            ))}
                        </ul>
                        <div className="flex items-center gap-2">
                            {SOCIAL.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                    {/* Links */}
                    {Object.entries(NAV_LINKS).map(([heading, links]) => (
                        <div key={heading}>
                            <h3 className="text-sm font-bold text-gray-900 mb-4">{heading}</h3>
                            <ul className="space-y-2.5">
                                {links.map((l) => (
                                    <li key={l.label}>
                                        <Link href={l.href} className="text-sm text-gray-500 hover:text-primary transition-colors">
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="flex items-center gap-1 text-xs text-gray-400">
                        <FaRegCopyright size={12} /> {new Date().getFullYear()} Ayucare. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link>
                    </div>
                </div>

            </div>
        </footer>
    );

}