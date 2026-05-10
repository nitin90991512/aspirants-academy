'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Megaphone, Plus, Loader2, Calendar, 
  User, X, Save, Search, Trash2, Bell, AlertTriangle
} from 'lucide-react'

interface Notice {
  id: string
  title: string
  content: string
  target_audience: string
  priority: string
  is_published: boolean
  publish_at: string
  created_at: string
  creator: {
    full_name: string
  }
}

export default function NoticesPage() {
  const supabase = createClient()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    content: '',
    target_audience: 'all',
    priority: 'normal',
    is_published: true,
  })

  useEffect(() => {
    fetchNotices()
  }, [])

  async function fetchNotices() {
    setLoading(true)
    const { data, error } = await supabase
      .from('notices')
      .select(`
        *,
        creator:created_by (full_name)
      `)
      .order('created_at', { ascending: false })

    if (data) setNotices(data as any)
    setLoading(false)
  }

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await supabase.from('notices').insert({
        ...form,
        created_by: user.id,
        publish_at: new Date().toISOString(),
      })

      if (insertError) throw insertError

      setShowAddModal(false)
      setForm({ title: '', content: '', target_audience: 'all', priority: 'normal', is_published: true })
      fetchNotices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notice')
    } finally {
      setSubmitting(false)
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Notice Board</h1>
          <p className="text-gray-500 text-sm">Post announcements for students, teachers, and parents</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          <span>Post Notice</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading notices...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getPriorityColor(notice.priority)}`}>
                      {notice.priority}
                    </span>
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(notice.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                      Target: {notice.target_audience}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{notice.title}</h3>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{notice.content}</p>
                  <div className="flex items-center gap-2 pt-2 text-xs text-gray-400">
                    <User className="w-3 h-3" />
                    <span>Posted by {notice.creator?.full_name || 'Admin'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {notices.length === 0 && (
            <div className="py-24 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No notices posted yet</p>
            </div>
          )}
        </div>
      )}

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setShowAddModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 font-[Poppins]">Post New Notice</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddNotice} className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Input label="Notice Title *" value={form.title} onChange={(v) => setForm({...form, title: v})} required placeholder="e.g. Holiday Announcement" />
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Content *</label>
                  <textarea 
                    required
                    value={form.content}
                    onChange={(e) => setForm({...form, content: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                    placeholder="Details of the announcement..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Target Audience</label>
                    <select 
                      value={form.target_audience} 
                      onChange={(e) => setForm({...form, target_audience: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                    >
                      <option value="all">All</option>
                      <option value="students">Students</option>
                      <option value="teachers">Teachers</option>
                      <option value="parents">Parents</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Priority</label>
                    <select 
                      value={form.priority} 
                      onChange={(e) => setForm({...form, priority: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                    >
                      <option value="normal">Normal</option>
                      <option value="important">Important</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                  <span>{submitting ? 'Posting...' : 'Post Notice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', required = false, placeholder = '' }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
      />
    </div>
  )
}
