'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import {
  LayoutDashboard, Users, UserCheck, BookOpen, ClipboardList,
  FileText, Megaphone, CreditCard, TestTube, Settings, LogOut,
  GraduationCap, ChevronDown, Bell, Search, School, Calendar, Image,
  BarChart3, Menu, X, UserCog, Trophy
} from 'lucide-react'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/admin/students', icon: Users, label: 'Students' },
      { href: '/admin/teachers', icon: UserCog, label: 'Teachers' },
      { href: '/admin/classes', icon: School, label: 'Classes & Batches' },
    ],
  },
  {
    label: 'Academics',
    items: [
      { href: '/admin/attendance', icon: UserCheck, label: 'Attendance' },
      { href: '/admin/exams', icon: ClipboardList, label: 'Exams & Results' },
      { href: '/admin/homework', icon: BookOpen, label: 'Homework' },
      { href: '/admin/timetable', icon: Calendar, label: 'Timetable' },
      { href: '/admin/tests', icon: TestTube, label: 'Online Tests' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/admin/fees', icon: CreditCard, label: 'Fees Management' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { href: '/admin/notices', icon: Megaphone, label: 'Notices' },
      { href: '/admin/banners', icon: Image, label: 'Banners & Announcements' },
    ],
  },
  {
    label: 'Website',
    items: [
      { href: '/admin/achievements', icon: Trophy, label: 'Achievements' },
      { href: '/admin/gallery', icon: Image, label: 'Gallery' },
      { href: '/admin/website-content', icon: FileText, label: 'Website Content' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { href: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-gray-900 text-sm font-[Poppins] leading-tight">Aspirants Academy</div>
          <div className="text-xs text-blue-600 font-medium">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-left text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-gray-100 flex-col flex-shrink-0 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 bg-white shadow-xl flex flex-col">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search students, teachers..."
                className="bg-transparent text-sm outline-none w-56 text-gray-600 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-gray-900 leading-tight">Admin</div>
                <div className="text-xs text-gray-400">Nitin Sir</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
