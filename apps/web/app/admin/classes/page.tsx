'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  School, Plus, Loader2, Users, Calendar, 
  MapPin, X, Save, Search, Trash2, Edit2
} from 'lucide-react'

interface Class {
  id: string
  name: string
  standard: number
  section: string
  room_number: string
  capacity: number
  is_active: boolean
  teacher?: {
    profiles: {
      full_name: string
    }
  }
  _count?: {
    students: number
  }
}

export default function ClassesPage() {
  const supabase = createClient()
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    standard: '',
    section: '',
    room_number: '',
    capacity: '40',
    class_teacher_id: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [{ data: classesData }, { data: teachersData }] = await Promise.all([
      supabase
        .from('classes')
        .select(`
          *,
          teacher:class_teacher_id (
            profiles:profile_id (full_name)
          )
        `)
        .order('standard', { ascending: true }),
      supabase
        .from('teachers')
        .select(`
          profile_id,
          profiles:profile_id (full_name)
        `)
    ])

    if (classesData) {
      // Get student counts manually as Supabase count aggregation is tricky in single query
      const { data: counts } = await supabase.rpc('get_class_student_counts')
      const enrichedClasses = classesData.map(c => ({
        ...c,
        student_count: counts?.find((count: any) => count.class_id === c.id)?.count || 0
      }))
      setClasses(enrichedClasses)
    }
    
    if (teachersData) setTeachers(teachersData)
    setLoading(false)
  }

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const { error: insertError } = await supabase.from('classes').insert({
        name: form.name || `Class ${form.standard}${form.section ? '-' + form.section : ''}`,
        standard: parseInt(form.standard),
        section: form.section || null,
        room_number: form.room_number || null,
        capacity: parseInt(form.capacity),
        class_teacher_id: form.class_teacher_id || null,
      })

      if (insertError) throw insertError

      setShowAddModal(false)
      setForm({ name: '', standard: '', section: '', room_number: '', capacity: '40', class_teacher_id: '' })
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Classes & Batches</h1>
          <p className="text-gray-500 text-sm">Manage academic structure and class teachers</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          <span>Create Class</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading classes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">
                      {cls.standard}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">{cls.name}</h3>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        {cls.section ? `Section ${cls.section}` : 'General Section'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Users className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Students</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{(cls as any).student_count || 0}<span className="text-xs text-gray-400 font-normal"> / {cls.capacity}</span></p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Room</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{cls.room_number || 'TBD'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Class Teacher:</span>
                    <span className="font-semibold text-gray-900">{cls.teacher?.profiles?.full_name || 'Not Assigned'}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all" 
                      style={{ width: `${Math.min(100, (((cls as any).student_count || 0) / cls.capacity) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                <button className="text-blue-600 text-xs font-bold hover:underline">Manage Batches</button>
                <button className="text-gray-400 text-xs font-bold hover:text-red-500 transition flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />
                  Archive
                </button>
              </div>
            </div>
          ))}
          
          {classes.length === 0 && (
            <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No classes created yet</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-blue-600 font-bold hover:underline"
              >
                Create your first class
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 font-[Poppins]">Create New Class</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Standard *</label>
                    <select 
                      required
                      value={form.standard} 
                      onChange={(e) => setForm({...form, standard: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                    >
                      <option value="">Select</option>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(s => <option key={s} value={s}>{s}th Standard</option>)}
                    </select>
                  </div>
                  <Input label="Section / Division" value={form.section} onChange={(v: string) => setForm({...form, section: v})} placeholder="e.g. A, B, Rose" />
                </div>

                <Input label="Class Display Name" value={form.name} onChange={(v: string) => setForm({...form, name: v})} placeholder="e.g. 10th Science Batch" />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Room Number" value={form.room_number} onChange={(v: string) => setForm({...form, room_number: v})} placeholder="e.g. Room 101" />
                  <Input label="Capacity" type="number" value={form.capacity} onChange={(v: string) => setForm({...form, capacity: v})} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Class Teacher</label>
                  <select 
                    value={form.class_teacher_id} 
                    onChange={(e) => setForm({...form, class_teacher_id: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => <option key={t.profile_id} value={t.profile_id}>{t.profiles.full_name}</option>)}
                  </select>
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
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{submitting ? 'Creating...' : 'Create Class'}</span>
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