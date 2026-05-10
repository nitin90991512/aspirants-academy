'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Book, Plus, Loader2, Save, Trash2, 
  FileText, School, X, Upload, Link as LinkIcon
} from 'lucide-react'

export default function AdminSyllabusPage() {
  const supabase = createClient()
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syllabuses, setSyllabuses] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    class_id: '',
    subject_id: '',
    title: '',
    description: '',
    file_url: '',
  })

  useEffect(() => {
    fetchMetadata()
    fetchSyllabuses()
  }, [])

  async function fetchMetadata() {
    const [{ data: cls }, { data: sub }] = await Promise.all([
      supabase.from('classes').select('id, name').eq('is_active', true),
      supabase.from('subjects').select('id, name').eq('is_active', true)
    ])
    if (cls) setClasses(cls)
    if (sub) setSubjects(sub)
  }

  async function fetchSyllabuses() {
    setLoading(true)
    const { data } = await supabase
      .from('syllabus')
      .select(`
        *,
        class:class_id (name),
        subject:subject_id (name)
      `)
      .order('created_at', { ascending: false })
    
    if (data) setSyllabuses(data)
    setLoading(false)
  }

  const handleAddSyllabus = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const { error: insertError } = await supabase.from('syllabus').insert([form])
      if (insertError) throw insertError

      setShowAddModal(false)
      fetchSyllabuses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save syllabus')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this syllabus?')) return
    await supabase.from('syllabus').delete().eq('id', id)
    fetchSyllabuses()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Syllabus Management</h1>
          <p className="text-gray-500 text-sm">Upload curriculum and subject outlines</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Syllabus</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {syllabuses.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {item.class?.name}
                </span>
                <span className="text-[10px] font-black text-gray-500 bg-gray-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {item.subject?.name}
                </span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-6">{item.description || 'No description provided'}</p>
              
              {item.file_url && (
                <a 
                  href={item.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition"
                >
                  <LinkIcon className="w-3 h-3" />
                  View Resource
                </a>
              )}
            </div>
          ))}
          
          {syllabuses.length === 0 && (
            <div className="col-span-full py-24 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <Book className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No syllabus records added yet</p>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 font-[Poppins]">Add Syllabus</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddSyllabus} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Class</label>
                  <select 
                    required
                    value={form.class_id} 
                    onChange={(e) => setForm({...form, class_id: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
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
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <Input 
                label="Syllabus Title" 
                value={form.title} 
                onChange={(v: string) => setForm({...form, title: v})} 
                required 
                placeholder="e.g. Annual Maths Syllabus 2024"
              />

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Description</label>
                <textarea 
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
                  placeholder="Details about the syllabus or chapters..."
                />
              </div>

              <Input 
                label="Resource URL (Link/File)" 
                value={form.file_url} 
                onChange={(v: string) => setForm({...form, file_url: v})} 
                placeholder="https://drive.google.com/..."
              />

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Syllabus</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', required = false, placeholder = '' }: { label: string, value: string, onChange: (v: string) => void, type?: string, required?: boolean, placeholder?: string }) {
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
