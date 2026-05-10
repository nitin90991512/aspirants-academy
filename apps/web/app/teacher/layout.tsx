'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import {
  LayoutDashboard, UserCheck, BookOpen, ClipboardList,
  TestTube, LogOut, GraduationCap, Bell, Menu, X, MessageSquare
} from 'lucide-react'

const navItems = [
  { href: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/teacher/attendance', icon: UserCheck, label: 'Mark Attendance' },
  { href: '/teacher/homework', icon: BookOpen, label: 'Homework' },
  { href: '/teacher/marks', icon: ClipboardList, label: 'Enter Marks' },
  { href: '/teacher/tests', icon: TestTube, label: 'Online Tests' },
  { href: '/teacher/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/teacher/notices', icon: Bell, label: 'Notices' },
]

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="hidden lg:flex w-56 bg-white border-r border-gray-100 flex-col flex-shrink-0">
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm font-[Poppins]">Aspirants Academy</div>
            <div className="text-xs text-green-600 font-medium">Teacher Panel</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <button onClick={handleLogout} className="sidebar-link w-full text-left text-red-500 hover:bg-red-50">
            <LogOut className="w-4 h-4" /> <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between shadow-sm">
          <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <Bell className="w-5 h-5 text-gray-500" />
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">T</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
