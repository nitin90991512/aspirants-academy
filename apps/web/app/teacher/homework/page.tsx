'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  BookOpen, Plus, Loader2, Calendar, 
  School, X, Save, Search, Trash2, FileText, Upload
} from 'lucide-react'

export default function TeacherHomeworkPage() {
  const supabase = createClient()
  const [homeworks, setHomeworks] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    class_id: '',
    subject_id: '',
    due_date: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch teacher record
    const { data: teacher } = await supabase.from('teachers').select('id').eq('profile_id', user.id).single()
    if (!teacher) { setLoading(false); return }

    const [{ data: hw }, { data: cls }, { data: sub }] = await Promise.all([
      supabase
        .from('homework')
        .select(`
          *,
          class:class_id (name),
          subject:subject_id (name)
        `)
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false }),
      supabase.from('classes').select('id, name'),
      supabase.from('subjects').select('id, name')
    ])

    if (hw) setHomeworks(hw)
    if (cls) setClasses(cls)
    if (sub) setSubjects(sub)
    setLoading(false)
  }

  const handleAddHomework = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: teacher } = await supabase.from('teachers').select('id').eq('profile_id', user?.id).single()
      
      if (!teacher) throw new Error('Teacher record not found')

      const { error: insertError } = await supabase.from('homework').insert({
        ...form,
        teacher_id: teacher.id,
      })

      if (insertError) throw insertError

      setShowAddModal(false)
      setForm({ title: '', description: '', class_id: '', subject_id: '', due_date: '' })
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create homework')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Homework Management</h1>
          <p className="text-gray-500 text-sm">Assign and track student assignments</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Homework</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {homeworks.map((hw) => (
            <div key={hw.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{hw.class?.name}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{hw.title}</h3>
              <p className="text-xs text-gray-500 font-medium mb-4">{hw.subject?.name}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>Due: {new Date(hw.due_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg transition">VIEW SUBMISSIONS</button>
                <button className="p-2 text-gray-400 hover:text-red-500 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {homeworks.length === 0 && (
            <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">You haven't assigned any homework yet</p>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 font-[Poppins]">New Assignment</h2>
            </div>

            <form onSubmit={handleAddHomework} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
              
              <Input label="Title *" value={form.title} onChange={(v: string) => setForm({...form, title: v})} required placeholder="e.g. Chapter 5 Practice" />
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Description</label>
                <textarea 
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  placeholder="Instructions for students..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Class</label>
                  <select 
                    required
                    value={form.class_id} 
                    onChange={(e) => setForm({...form, class_id: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Subject</label>
                  <select 
                    required
                    value={form.subject_id} 
                    onChange={(e) => setForm({...form, subject_id: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <Input label="Due Date" type="date" value={form.due_date} onChange={(v: string) => setForm({...form, due_date: v})} required />
              
              <div className="mt-6 flex gap-3">
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Post Homework</span>
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
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
    </div>
  )
}
