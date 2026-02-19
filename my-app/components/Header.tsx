import Link from 'next/link'

export default function Header() {
    return (
        <header style={{ backgroundColor: '#46C2DE' }} className="py-4 shadow-md">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-white">
                    Ayucare
                </Link>
                <nav className="space-x-4">
                    <Link href="/login" className="text-white hover:text-gray-200 transition">
                        Login
                    </Link>
                    <Link href="/signup" className="text-white hover:text-gray-200 transition">
                        Sign Up
                    </Link>
                </nav>
            </div>
        </header>
    )
}