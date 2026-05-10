'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Save, Loader2, CheckCircle2, AlertCircle, User } from 'lucide-react'

interface Exam {
  id: string
  name: string
}

interface Class {
  id: string
  name: string
}

interface Subject {
  id: string
  name: string
  max_marks: number
}

interface StudentResult {
  student_id: string
  full_name: string
  admission_number: string
  marks_obtained: number | string
  is_absent: boolean
  result_id?: string
}

export default function ResultEditor({ 
  exams, 
  classes, 
  subjects 
}: { 
  exams: Exam[], 
  classes: Class[], 
  subjects: Subject[] 
}) {
  const [selectedExam, setSelectedExam] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  
  const [students, setStudents] = useState<StudentResult[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const supabase = createClient()

  const fetchResults = async () => {
    if (!selectedExam || !selectedClass || !selectedSubject) return
    
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // 1. Fetch students in this class
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          admission_number,
          profiles (full_name)
        `)
        .eq('class_id', selectedClass)
        .eq('is_active', true)

      if (studentsError) throw studentsError

      // 2. Fetch existing results
      const { data: resultsData, error: resultsError } = await supabase
        .from('exam_results')
        .select('*')
        .eq('exam_id', selectedExam)
        .eq('subject_id', selectedSubject)

      if (resultsError) throw resultsError

      // 3. Merge
      const merged = studentsData.map(s => {
        const result = resultsData?.find(r => r.student_id === s.id)
        return {
          student_id: s.id,
          full_name: (s.profiles as any)?.full_name || 'Unknown',
          admission_number: s.admission_number,
          marks_obtained: result ? result.marks_obtained : '',
          is_absent: result ? result.is_absent : false,
          result_id: result?.id
        }
      })

      setStudents(merged)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id

      const upserts = students.map(s => ({
        id: s.result_id || undefined,
        exam_id: selectedExam,
        student_id: s.student_id,
        subject_id: selectedSubject,
        marks_obtained: s.marks_obtained === '' ? 0 : Number(s.marks_obtained),
        is_absent: s.is_absent,
        entered_by: userId,
        updated_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from('exam_results')
        .upsert(upserts)

      if (error) throw error
      
      setMessage({ type: 'success', text: 'Results saved successfully!' })
      fetchResults() // Refresh to get new IDs
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const updateMark = (studentId: string, mark: string) => {
    setStudents(students.map(s => s.student_id === studentId ? { ...s, marks_obtained: mark } : s))
  }

  const toggleAbsent = (studentId: string) => {
    setStudents(students.map(s => s.student_id === studentId ? { ...s, is_absent: !s.is_absent } : s))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-6 font-[Poppins]">Filter Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Exam</label>
            <select 
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            >
              <option value="">Choose Exam...</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Class</label>
            <select 
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            >
              <option value="">Choose Class...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Subject</label>
            <select 
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            >
              <option value="">Choose Subject...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button 
            onClick={fetchResults}
            disabled={!selectedExam || !selectedClass || !selectedSubject || loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-semibold flex items-center gap-2 transition shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Load Students
          </button>
        </div>
      </div>

      {students.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-900">Student List</h3>
              <p className="text-xs text-gray-500">Enter marks for the selected subject</p>
            </div>
            <div className="flex items-center gap-4">
              {message.text && (
                <div className={`flex items-center gap-2 text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {message.text}
                </div>
              )}
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center gap-2 transition shadow-sm"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Admission No</th>
                  <th className="px-6 py-4 text-center">Is Absent?</th>
                  <th className="px-6 py-4">Marks Obtained</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student) => (
                  <tr key={student.student_id} className={`hover:bg-gray-50/50 transition ${student.is_absent ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                          {student.full_name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{student.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{student.admission_number}</td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={student.is_absent}
                        onChange={() => toggleAbsent(student.student_id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          disabled={student.is_absent}
                          value={student.is_absent ? '0' : student.marks_obtained}
                          onChange={e => updateMark(student.student_id, e.target.value)}
                          placeholder="0"
                          className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                        <span className="text-xs text-gray-400">/ {subjects.find(s => s.id === selectedSubject)?.max_marks || 100}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
