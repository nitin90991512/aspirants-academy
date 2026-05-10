'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  UserCheck, Loader2, Calendar, 
  School, Save, CheckCircle2, XCircle
} from 'lucide-react'

export default function TeacherAttendancePage() {
  const supabase = createClient()
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({})
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    fetchClasses()
  }, [])

  async function fetchClasses() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // In a real app, we'd fetch only classes assigned to this teacher
    const { data } = await supabase.from('classes').select('id, name').eq('is_active', true)
    if (data) setClasses(data)
    setLoading(false)
  }

  useEffect(() => {
    if (selectedClass) {
      fetchStudents()
    }
  }, [selectedClass])

  async function fetchStudents() {
    setLoading(true)
    const { data } = await supabase
      .from('students')
      .select(`
        id,
        profiles:profile_id (full_name)
      `)
      .eq('class_id', selectedClass)
      .eq('is_active', true)
    
    if (data) {
      setStudents(data)
      const initial: Record<string, 'present' | 'absent'> = {}
      data.forEach(s => initial[s.id] = 'present')
      setAttendance(initial)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSubmitting(true)
    setMessage({ text: '', type: '' })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const date = new Date().toISOString().split('T')[0]

      const records = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: studentId,
        class_id: selectedClass,
        date,
        status,
        marked_by: user?.id,
      }))

      const { error } = await supabase.from('attendance').upsert(records, {
        onConflict: 'student_id, date'
      })

      if (error) throw error
      setMessage({ text: 'Attendance marked successfully!', type: 'success' })
    } catch (err) {
      setMessage({ text: 'Failed to mark attendance', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Mark Attendance</h1>
        <p className="text-gray-500 text-sm">Take daily attendance for your students</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Select Class</label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          >
            <option value="">Choose a class...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 block font-bold uppercase mb-1">Date</span>
          <span className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString()}</span>
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 font-medium text-gray-900">{student.profiles.full_name}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-4">
                        <button 
                          onClick={() => setAttendance(a => ({...a, [student.id]: 'present'}))}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            attendance[student.id] === 'present' 
                              ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Present</span>
                        </button>
                        <button 
                          onClick={() => setAttendance(a => ({...a, [student.id]: 'absent'}))}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            attendance[student.id] === 'absent' 
                              ? 'bg-red-600 text-white shadow-lg shadow-red-100' 
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Absent</span>
                        </button>
                      </div>
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
              <span>Save Attendance</span>
            </button>
          </div>
        </div>
      ) : selectedClass ? (
        <div className="py-12 text-center text-gray-500 italic">No students found in this class</div>
      ) : null}
    </div>
  )
}
