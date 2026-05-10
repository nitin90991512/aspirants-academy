import Link from 'next/link'
import { GraduationCap, Phone, Menu } from 'lucide-react'

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-base leading-tight font-[Poppins]">
                Aspirants Academy
              </div>
              <div className="text-xs text-gray-500">Gandhinagar, Gujarat</div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { href: '#about', label: 'About' },
              { href: '#notices', label: 'Notices' },
              { href: '#navodaya', label: 'Navodaya' },
              { href: '#achievements', label: 'Results' },
              { href: '#gallery', label: 'Gallery' },
              { href: '#contact', label: 'Contact' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
              >
                {link.label}
              </a>
            ))}
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
