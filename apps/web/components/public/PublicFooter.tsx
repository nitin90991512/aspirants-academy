import { GraduationCap, Phone, MapPin, MessageSquare, Share2, Star, Play } from 'lucide-react'
import Link from 'next/link'

export default function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-base font-[Poppins]">Aspirants Academy</div>
                <div className="text-xs text-gray-400">Gandhinagar, Gujarat</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Empowering students with quality education and expert guidance for Classes 6th–12th and Navodaya entrance preparation.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Share2, href: '#' },
                { icon: Star, href: '#' },
                { icon: Play, href: '#' },
              ].map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  className="w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-[Poppins]">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '#about', label: 'About Us' },
                { href: '#navodaya', label: 'Navodaya Coaching' },
                { href: '#achievements', label: 'Results & Achievements' },
                { href: '#gallery', label: 'Gallery' },
                { href: '#notices', label: 'Notice Board' },
                { href: '/login', label: 'Student/Parent Login' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition"
                  >
                    → {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Classes */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-[Poppins]">Our Programs</h3>
            <ul className="space-y-2">
              {[
                'Class 6th – Foundation',
                'Class 7th & 8th – Core',
                'Class 9th & 10th – Board Prep',
                'Class 11th & 12th – Science',
                'Navodaya Entrance Batch',
                'Special Weekend Batches',
              ].map((item) => (
                <li key={item} className="text-sm text-gray-400">• {item}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-[Poppins]">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">
                  Aspirants Academy, Gandhinagar, Gujarat – 382010
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href="tel:9265720004" className="text-sm text-gray-400 hover:text-white transition">
                  +91 9265720004 (Nitin Sir)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-green-400 flex-shrink-0" />
                <a
                  href="https://wa.me/919265720004"
                  className="text-sm text-gray-400 hover:text-green-400 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp: 9265720004
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Aspirants Academy, Gandhinagar. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Built with ❤️ for student success
          </p>
        </div>
      </div>
    </footer>
  )
}
