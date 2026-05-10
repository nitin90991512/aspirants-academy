import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Bell, Plus, Eye, Trash2 } from 'lucide-react'
import { formatDate, getNoticePriorityColor, timeAgo } from '@/lib/utils'
import { Notice } from '@/lib/types'

export const metadata = { title: 'Notices' }

export default async function NoticesPage() {
  const supabase = await createClient()
  const { data: notices } = await supabase
    .from('notices')
    .select('*, profiles!created_by(full_name)')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Notices</h1>
          <p className="text-gray-500 text-sm">{notices?.length || 0} notices</p>
        </div>
        <Link href="/admin/notices/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">
          <Plus className="w-4 h-4" /> Post Notice
        </Link>
      </div>

      <div className="space-y-3">
        {(notices || []).map((notice: Notice & { profiles?: { full_name: string } }) => (
          <div key={notice.id} className={`bg-white rounded-xl border border-gray-100 p-5 shadow-sm ${notice.priority === 'emergency' ? 'border-l-4 border-l-red-500' : notice.priority === 'urgent' ? 'border-l-4 border-l-orange-500' : notice.priority === 'important' ? 'border-l-4 border-l-yellow-500' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {notice.is_pinned && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">📌 Pinned</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getNoticePriorityColor(notice.priority)}`}>{notice.priority.toUpperCase()}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{notice.target_audience}</span>
                  {notice.is_published
                    ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Published</span>
                    : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Draft</span>
                  }
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{notice.title}</h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{notice.content}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>By {notice.profiles?.full_name || 'Admin'}</span>
                  <span>{timeAgo(notice.created_at)}</span>
                  <span>{notice.view_count} views</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {(!notices || notices.length === 0) && (
          <div className="text-center py-16 text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No notices posted yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
