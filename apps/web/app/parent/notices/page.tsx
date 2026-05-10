'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Megaphone, Loader2, Calendar, 
  User, Bell, AlertTriangle
} from 'lucide-react'

interface Notice {
  id: string
  title: string
  content: string
  target_audience: string
  priority: string
  publish_at: string
  created_at: string
}

export default function ParentNoticesPage() {
  const supabase = createClient()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotices()
  }, [])

  async function fetchNotices() {
    setLoading(true)
    const { data } = await supabase
      .from('notices')
      .select('*')
      .or('target_audience.eq.all,target_audience.eq.parents,target_audience.eq.students')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (data) setNotices(data as any)
    setLoading(false)
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'emergency': return 'bg-red-100 text-red-600 border-red-200'
      case 'urgent': return 'bg-orange-100 text-orange-600 border-orange-200'
      case 'important': return 'bg-blue-100 text-blue-600 border-blue-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Notice Board</h1>
        <p className="text-gray-500 text-sm">Stay updated with the latest announcements</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${getPriorityColor(notice.priority)}`}>
                  <Megaphone className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getPriorityColor(notice.priority)}`}>
                      {notice.priority}
                    </span>
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(notice.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{notice.title}</h3>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{notice.content}</p>
                </div>
              </div>
            </div>
          ))}

          {notices.length === 0 && (
            <div className="py-24 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No active notices at the moment</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
