'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Calendar, Plus, Loader2, Save, Trash2, 
  Clock, BookOpen, User, School, X
} from 'lucide-react'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export default function AdminTimetablePage() {
  const supabase = createClient()
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState('')
  const [timetable, setTimetable] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    day: 'monday',
    period_number: 1,
    subject_id: '',
    teacher_id: '',
    start_time: '08:00',
    end_time: '09:00',
    room_number: '',
  })

  useEffect(() => {
    fetchMetadata()
  }, [])

  async function fetchMetadata() {
    setLoading(true)
    const [{ data: cls }, { data: sub }, { data: tch }] = await Promise.all([
      supabase.from('classes').select('id, name').eq('is_active', true),
      supabase.from('subjects').select('id, name').eq('is_active', true),
      supabase.from('teachers').select('id, profiles:profile_id (full_name)').eq('is_active', true)
    ])
    if (cls) setClasses(cls)
    if (sub) setSubjects(sub)
    if (tch) setTeachers(tch)
    setLoading(false)
  }

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable()
    }
  }, [selectedClass])

  async function fetchTimetable() {
    setLoading(true)
    const { data } = await supabase
      .from('timetable')
      .select(`
        *,
        subject:subject_id (name),
        teacher:teacher_id (profiles:profile_id (full_name))
      `)
      .eq('class_id', selectedClass)
      .order('day')
      .order('period_number')
    
    if (data) setTimetable(data)
    setLoading(false)
  }

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const { error: insertError } = await supabase.from('timetable').insert({
        ...form,
        class_id: selectedClass,
        period_number: parseInt(form.period_number.toString())
      })

      if (insertError) throw insertError

      setShowAddModal(false)
      fetchTimetable()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save timetable entry')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this period?')) return
    await supabase.from('timetable').delete().eq('id', id)
    fetchTimetable()
  }

  const getDaySchedule = (day: string) => {
    return timetable.filter(t => t.day === day).sort((a, b) => a.period_number - b.period_number)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Academic Timetable</h1>
          <p className="text-gray-500 text-sm">Schedule periods, subjects and teachers for each class</p>
        </div>
        {selectedClass && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Period</span>
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Select Class</label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
          >
            <option value="">Choose a class to manage timetable...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : selectedClass ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {DAYS.map((day) => (
            <div key={day} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">{day}</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                  {getDaySchedule(day).length} Periods
                </span>
              </div>
              <div className="p-4 flex-1 space-y-3">
                {getDaySchedule(day).map((entry) => (
                  <div key={entry.id} className="group p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all relative">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 w-5 h-5 rounded flex items-center justify-center">
                            {entry.period_number}
                          </span>
                          <h4 className="font-bold text-gray-900 text-sm">{entry.subject?.name}</h4>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          <span>{entry.teacher?.profiles?.full_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                          <Clock className="w-3 h-3" />
                          <span>{entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {getDaySchedule(day).length === 0 && (
                  <div className="py-8 text-center text-gray-400 italic text-sm">No periods scheduled</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Please select a class to view/edit timetable</p>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 font-[Poppins]">Add Period</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Day</label>
                  <select 
                    value={form.day} 
                    onChange={(e) => setForm({...form, day: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
                  </select>
                </div>
                <Input 
                  label="Period Number" 
                  type="number" 
                  value={form.period_number} 
                  onChange={(v: string) => setForm({...form, period_number: parseInt(v) || 1})} 
                />
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

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Teacher</label>
                <select 
                  required
                  value={form.teacher_id} 
                  onChange={(e) => setForm({...form, teacher_id: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.profiles.full_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Time" type="time" value={form.start_time} onChange={(v: string) => setForm({...form, start_time: v})} />
                <Input label="End Time" type="time" value={form.end_time} onChange={(v: string) => setForm({...form, end_time: v})} />
              </div>

              <Input label="Room / Lab Name" value={form.room_number} onChange={(v: string) => setForm({...form, room_number: v})} placeholder="e.g. Room 102" />

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Period</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', required = false, placeholder = '' }: { label: string, value: any, onChange: (v: string) => void, type?: string, required?: boolean, placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{label}</label>
      <input 
        type={type} 
        required={required} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder} 
        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition" 
      />
    </div>
  )
}
