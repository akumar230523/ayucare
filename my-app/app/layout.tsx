import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

import '../styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Ayucare - Your Trusted Health Companion',
    description: 'Connect with verified doctors, book appointments, and manage your wellness journey.',
};

export default function RootLayout({ children } : { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <Header />
                    <main className="min-h-screen">{children}</main>
                    <Footer />
                    <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
                </AuthProvider>
            </body>
        </html>
    );
    
}