export default function Footer() {
    return (
        <footer style={{ backgroundColor: '#46C2DE' }} className="py-6 mt-auto text-white">
            <div className="container mx-auto px-4 text-center">
                © {new Date().getFullYear()} Ayucare. All rights reserved.
            </div>
        </footer>
    )
}