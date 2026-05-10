'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import {
  LayoutDashboard, UserCheck, BookOpen, ClipboardList,
  Megaphone, CreditCard, Settings, LogOut,
  GraduationCap, Bell, Search, Calendar, Image,
  Menu, X, MessageSquare
} from 'lucide-react'
import Logo from '@/components/Logo'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/parent/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'My Child',
    items: [
      { href: '/parent/attendance', icon: UserCheck, label: 'Attendance' },
      { href: '/parent/academics', icon: BookOpen, label: 'Academics & Timetable' },
      { href: '/parent/exams', icon: ClipboardList, label: 'Exam Results' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/parent/fees', icon: CreditCard, label: 'Fees & Invoices' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { href: '/parent/notices', icon: Megaphone, label: 'Notice Board' },
      { href: '/parent/messages', icon: MessageSquare, label: 'Messages' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { href: '/parent/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

export default function ParentLayout({ children }: { children: React.ReactNode }) {
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
        <Logo className="w-10 h-10" />
        <div>
          <div className="font-bold text-gray-900 text-sm font-[Poppins] leading-tight">Aspirants Academy</div>
          <div className="text-xs text-amber-600 font-medium">Parent Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/parent/dashboard' && pathname.startsWith(item.href))
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
            
            {/* Child Selector for Parents */}
            <div className="hidden sm:flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200/50 rounded-lg px-3 py-1.5 text-sm font-medium">
              <UserCheck className="w-4 h-4" />
              Viewing: Rahul Kumar (Class 10-A)
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative w-8 h-8 flex items-center justify-center text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-gray-900 leading-tight">Parent</div>
                <div className="text-xs text-gray-400">Parent One</div>
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
