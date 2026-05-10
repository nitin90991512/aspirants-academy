'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  ClipboardList, Plus, Loader2, Calendar, 
  School, X, Save, Search, Trophy, FileText
} from 'lucide-react'
import Link from 'next/link'

interface Exam {
  id: string
  name: string
  exam_type: string
  class_id: string
  start_date: string
  is_published: boolean
  class: {
    name: string
  }
}

export default function ExamsPage() {
  const supabase = createClient()
  const [exams, setExams] = useState<Exam[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    exam_type: 'unit_test',
    class_id: '',
    start_date: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [{ data: examsData }, { data: classesData }] = await Promise.all([
      supabase
        .from('exams')
        .select(`
          *,
          class:class_id (name)
        `)
        .order('created_at', { ascending: false }),
      supabase.from('classes').select('id, name')
    ])

    if (examsData) setExams(examsData as any)
    if (classesData) setClasses(classesData)
    setLoading(false)
  }

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { error } = await supabase.from('exams').insert([form])
      if (error) throw error
      setShowAddModal(false)
      fetchData()
    } catch (err) {
      alert('Error creating exam')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Exams & Results</h1>
          <p className="text-gray-500 text-sm">Schedule exams and manage student performance</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Exam</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading exams...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${exam.is_published ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  {exam.is_published ? 'Published' : 'Draft'}
                </div>
              </div>
              
              <h3 className="font-bold text-gray-900 text-lg mb-1">{exam.name}</h3>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-4">
                {exam.exam_type.replace('_', ' ')} • {exam.class?.name || 'All Classes'}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Starts: {new Date(exam.start_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link 
                  href={`/admin/exams/results?exam_id=${exam.id}`}
                  className="flex-1 text-center py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
                >
                  Enter Results
                </Link>
                <button className="px-3 py-2 border border-gray-100 hover:bg-gray-50 text-gray-600 rounded-lg transition">
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {exams.length === 0 && (
            <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">No exams scheduled yet</p>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 font-[Poppins]">Schedule New Exam</h2>
            </div>
            <form onSubmit={handleAddExam} className="p-6 space-y-4">
              <Input label="Exam Name *" value={form.name} onChange={(v: string) => setForm({...form, name: v})} required />
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                <select 
                  value={form.exam_type} 
                  onChange={(e) => setForm({...form, exam_type: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                >
                  <option value="unit_test">Unit Test</option>
                  <option value="mid_term">Mid Term</option>
                  <option value="final">Final Exam</option>
                  <option value="navodaya_mock">Navodaya Mock</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class</label>
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
              <Input label="Start Date" type="date" value={form.start_date} onChange={(v: string) => setForm({...form, start_date: v})} required />
              
              <div className="mt-6 flex gap-3">
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold">
                  Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', required = false }: { label: string, value: string, onChange: (v: string) => void, type?: string, required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{label}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
    </div>
  )
}