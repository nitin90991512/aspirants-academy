'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  ClipboardList, Loader2, Save, 
  Search, Filter, CheckCircle2, AlertCircle
} from 'lucide-react'

export default function TeacherMarksPage() {
  const supabase = createClient()
  const [exams, setExams] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [marks, setMarks] = useState<Record<string, { marks: string, remarks: string }>>({})
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    fetchMetadata()
  }, [])

  async function fetchMetadata() {
    const [{ data: ex }, { data: sub }] = await Promise.all([
      supabase.from('exams').select('id, name'),
      supabase.from('subjects').select('id, name')
    ])
    if (ex) setExams(ex)
    if (sub) setSubjects(sub)
    setLoading(false)
  }

  useEffect(() => {
    if (selectedExam && selectedSubject) {
      fetchStudentsAndResults()
    }
  }, [selectedExam, selectedSubject])

  async function fetchStudentsAndResults() {
    setLoading(true)
    // 1. Get class from exam
    const { data: exam } = await supabase.from('exams').select('class_id').eq('id', selectedExam).single()
    if (!exam) return

    // 2. Get students and existing marks
    const [{ data: std }, { data: existingMarks }] = await Promise.all([
      supabase.from('students').select('id, profiles:profile_id (full_name)').eq('class_id', exam.class_id),
      supabase.from('exam_results').select('student_id, marks_obtained, remarks').eq('exam_id', selectedExam).eq('subject_id', selectedSubject)
    ])

    if (std) {
      setStudents(std)
      const initial: Record<string, { marks: string, remarks: string }> = {}
      std.forEach(s => {
        const existing = existingMarks?.find(m => m.student_id === s.id)
        initial[s.id] = { 
          marks: existing?.marks_obtained?.toString() || '', 
          remarks: existing?.remarks || '' 
        }
      })
      setMarks(initial)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSubmitting(true)
    setMessage({ text: '', type: '' })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const records = Object.entries(marks).map(([studentId, data]) => ({
        student_id: studentId,
        exam_id: selectedExam,
        subject_id: selectedSubject,
        marks_obtained: parseFloat(data.marks) || 0,
        remarks: data.remarks,
        entered_by: user?.id,
      }))

      const { error } = await supabase.from('exam_results').upsert(records, {
        onConflict: 'student_id, exam_id, subject_id'
      })

      if (error) throw error
      setMessage({ text: 'Marks saved successfully!', type: 'success' })
    } catch (err) {
      setMessage({ text: 'Failed to save marks', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Enter Exam Marks</h1>
        <p className="text-gray-500 text-sm">Input student scores for scheduled examinations</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Select Exam</label>
          <select 
            value={selectedExam} 
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          >
            <option value="">Choose exam...</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Select Subject</label>
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          >
            <option value="">Choose subject...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : students.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase w-32">Marks</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 font-medium text-gray-900">{student.profiles.full_name}</td>
                    <td className="px-6 py-4">
                      <input 
                        type="number"
                        value={marks[student.id]?.marks || ''}
                        onChange={(e) => setMarks(m => ({...m, [student.id]: {...m[student.id], marks: e.target.value}}))}
                        placeholder="00"
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center font-bold"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text"
                        value={marks[student.id]?.remarks || ''}
                        onChange={(e) => setMarks(m => ({...m, [student.id]: {...m[student.id], remarks: e.target.value}}))}
                        placeholder="Excellent performance"
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={handleSave}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save All Marks</span>
            </button>
          </div>
        </div>
      ) : selectedExam && selectedSubject ? (
        <div className="py-12 text-center text-gray-500 italic">No students found for this exam/class</div>
      ) : null}
    </div>
  )
}
