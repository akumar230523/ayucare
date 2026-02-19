import Link from 'next/link'

export default function Home() {
    return (
        <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold mb-6">Welcome to Ayucare</h1>
            <p className="text-lg text-gray-600 mb-8">
                Your health and wellness companion.
            </p>
            <div className="space-x-4">
                <Link
                    href="/login"
                    style={{ backgroundColor: '#46C2DE' }}
                    className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition inline-block"
                >
                    Login
                </Link>
                <Link
                    href="/signup"
                    className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition inline-block"
                >
                    Sign Up
                </Link>
            </div>
        </div>
    )
}