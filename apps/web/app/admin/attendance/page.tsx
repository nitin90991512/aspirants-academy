'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserCheck, Save, Loader2, CheckCircle2, XCircle, Clock, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type AttendanceStatus = 'present' | 'absent' | 'late'

interface StudentAttendance {
  student_id: string
  full_name: string
  roll_number?: string
  status: AttendanceStatus
}

interface ClassOption {
  id: string
  name: string
  standard: number
  section?: string
}

export default function AttendancePage() {
  const supabase = createClient()

  const [classes, setClasses] = useState<ClassOption[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [students, setStudents] = useState<StudentAttendance[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('classes').select('id, name, standard, section').eq('is_active', true).order('standard')
      .then(({ data }) => setClasses(data || []))
  }, [])

  useEffect(() => {
    if (!selectedClass || !selectedDate) return
    loadAttendance()
  }, [selectedClass, selectedDate])

  async function loadAttendance() {
    setLoading(true)
    setSaved(false)

    // Get students in this class
    const { data: classStudents } = await supabase
      .from('students')
      .select('id, roll_number, profiles(full_name)')
      .eq('class_id', selectedClass)
      .eq('is_active', true)
      .order('roll_number')

    if (!classStudents) { setLoading(false); return }

    // Get existing attendance for this date
    const { data: existing } = await supabase
      .from('attendance')
      .select('student_id, status')
      .eq('class_id', selectedClass)
      .eq('date', selectedDate)

    const existingMap: Record<string, AttendanceStatus> = {}
    existing?.forEach((a) => { existingMap[a.student_id] = a.status as AttendanceStatus })

    setStudents(classStudents.map((s) => ({
      student_id: s.id,
      full_name: (s.profiles as unknown as { full_name: string })?.full_name || 'Unknown',
      roll_number: s.roll_number || undefined,
      status: existingMap[s.id] || 'present',
    })))

    setLoading(false)
  }

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => s.student_id === studentId ? { ...s, status } : s))
  }

  const markAll = (status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })))
  }

  const handleSave = async () => {
    if (!selectedClass || students.length === 0) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    const currentUserId = user?.id

    const records = students.map((s) => ({
      student_id: s.student_id,
      class_id: selectedClass,
      date: selectedDate,
      status: s.status,
      marked_by: currentUserId,
      check_in_time: new Date().toTimeString().slice(0, 5),
    }))

    const { error } = await supabase.from('attendance').upsert(records, {
      onConflict: 'student_id,date',
    })

    if (!error) {
      setSaved(true)
      // Notify parents of absent students
      const absentStudents = students.filter((s) => s.status === 'absent').map((s) => s.student_id)
      if (absentStudents.length > 0) {
        await fetch('/api/notify/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ absentStudentIds: absentStudents, date: selectedDate, classId: selectedClass }),
        }).catch(() => {}) // Non-blocking
      }
    }

    setSaving(false)
  }

  const presentCount = students.filter((s) => s.status === 'present').length
  const absentCount = students.filter((s) => s.status === 'absent').length
  const lateCount = students.filter((s) => s.status === 'late').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Attendance</h1>
          <p className="text-gray-500 text-sm">Mark and manage student attendance</p>
        </div>
      </div>

      {/* Selectors */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
            >
              <option value="">Choose a class...</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.section ? ` (${c.section})` : ''}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          {students.length > 0 && (
            <div className="flex gap-2">
              <button onClick={() => markAll('present')} className="px-3 py-2.5 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded-xl text-sm font-medium transition">
                ✅ All Present
              </button>
              <button onClick={() => markAll('absent')} className="px-3 py-2.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-xl text-sm font-medium transition">
                ❌ All Absent
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      {students.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total', value: students.length, color: 'bg-blue-50 text-blue-700', icon: Users },
            { label: 'Present', value: presentCount, color: 'bg-green-50 text-green-700', icon: CheckCircle2 },
            { label: 'Absent', value: absentCount, color: 'bg-red-50 text-red-700', icon: XCircle },
            { label: 'Late', value: lateCount, color: 'bg-yellow-50 text-yellow-700', icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-4 flex items-center gap-3`}>
              <stat.icon className="w-6 h-6 flex-shrink-0" />
              <div>
                <div className="text-2xl font-black font-[Poppins]">{stat.value}</div>
                <div className="text-xs font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attendance Grid */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {!selectedClass ? (
          <div className="text-center py-16 text-gray-400">
            <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Select a class to mark attendance</p>
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-400">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No students found in this class</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-12">#</th>
                    <th>Student Name</th>
                    <th className="w-24">Roll No</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, i) => (
                    <tr key={student.student_id}>
                      <td className="text-gray-400 text-sm">{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {student.full_name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{student.full_name}</span>
                        </div>
                      </td>
                      <td className="text-gray-500 text-sm font-mono">{student.roll_number || '—'}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {(['present', 'absent', 'late'] as AttendanceStatus[]).map((status) => (
                            <button
                              key={status}
                              onClick={() => setStatus(student.student_id, status)}
                              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                student.status === status
                                  ? status === 'present' ? 'attendance-present ring-2 ring-green-400 shadow-sm' :
                                    status === 'absent' ? 'attendance-absent ring-2 ring-red-400 shadow-sm' :
                                    'attendance-late ring-2 ring-yellow-400 shadow-sm'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                            >
                              {status === 'present' ? '✅ Present' : status === 'absent' ? '❌ Absent' : '🕐 Late'}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Save Button */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {formatDate(selectedDate)} — {students.length} students
              </p>
              <div className="flex items-center gap-3">
                {saved && (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Saved! Parents notified.
                  </div>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
