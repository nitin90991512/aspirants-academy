import Link from 'next/link'
import { GraduationCap, Phone, Menu } from 'lucide-react'
import Logo from '@/components/Logo'

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <Logo className="w-12 h-12" />
            <div>
              <div className="font-bold text-gray-900 text-base leading-tight font-[Poppins]">
                Aspirants Academy
              </div>
              <div className="text-xs text-gray-500">Gandhinagar, Gujarat</div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#about" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">About</Link>
            <Link href="/#notices" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Notices</Link>
            <Link href="/#navodaya" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Navodaya</Link>
            <Link href="/#achievements" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Results</Link>
            <Link href="/gallery" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Gallery</Link>
            <Link href="/#contact" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Contact</Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="tel:9265720004"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
            >
              <Phone className="w-4 h-4" />
              <span>9265720004</span>
            </a>
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all hover:shadow-md"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
