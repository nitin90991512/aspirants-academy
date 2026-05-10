'use client'

import { useEffect, useRef } from 'react'
import { Announcement } from '@/lib/types'
import { Megaphone } from 'lucide-react'

export default function AnnouncementTicker({ announcements }: { announcements: Announcement[] }) {
  const items = announcements.length > 0 ? announcements : [
    { id: '1', text: '🎉 Admission Open 2025-26 | Classes 6th–12th | Contact: 9265720004', is_active: true, priority: 10, created_at: '' },
    { id: '2', text: '📚 Navodaya Batch Starting Soon — Limited Seats!', is_active: true, priority: 8, created_at: '' },
    { id: '3', text: '🏆 Results Out: 45 Students Selected in Navodaya This Year!', is_active: true, priority: 5, created_at: '' },
  ]

  const text = items.map((a) => a.text).join('   •   ')

  return (
    <div className="bg-blue-700 text-white py-2.5 overflow-hidden">
      <div className="flex items-center">
        {/* Label */}
        <div className="flex items-center gap-2 bg-blue-600 px-4 py-0.5 shrink-0 border-r border-blue-500 z-10">
          <Megaphone className="w-4 h-4 text-amber-300" />
          <span className="text-sm font-semibold whitespace-nowrap text-amber-300">LATEST</span>
        </div>
        {/* Ticker */}
        <div className="overflow-hidden flex-1 relative">
          <div className="whitespace-nowrap animate-ticker text-sm font-medium text-blue-100 inline-block px-4">
            {text} &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; {text}
          </div>
        </div>
      </div>
    </div>
  )
}
