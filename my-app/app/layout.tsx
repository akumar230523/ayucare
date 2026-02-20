import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react'; // ← import Suspense

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Ayucare',
    description: 'Role-based patient/doctor login with icons',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={`${inter.className} flex flex-col min-h-screen`}>
                <AuthProvider>
                    {/* Wrap Header in Suspense with a fallback that matches the header style */}
                    <Suspense fallback={<div className="h-16" style={{ backgroundColor: '#46C2DE' }} />}>
                        <Header />
                    </Suspense>
                    <main className="flex-grow">{children}</main>
                    <Footer />
                    <Toaster position="top-center" reverseOrder={false} />
                </AuthProvider>
            </body>
        </html>
    );
}