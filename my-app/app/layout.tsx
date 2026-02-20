import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

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
                    <Header />
                    <main className="flex-grow">{children}</main>
                    <Footer />
                    <Toaster position="top-center" reverseOrder={false} />
                </AuthProvider>
            </body>
        </html>
    );
}