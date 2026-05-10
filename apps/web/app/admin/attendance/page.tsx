'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  UserCheck, Loader2, Calendar, 
  School, Search, Filter, CheckCircle2, XCircle
} from 'lucide-react'

export default function AdminAttendancePage() {
  const supabase = createClient()
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState<any[]>([])

  useEffect(() => {
    fetchClasses()
  }, [])

  async function fetchClasses() {
    const { data } = await supabase.from('classes').select('id, name')
    if (data) setClasses(data)
    setLoading(false)
  }

  async function fetchAttendance() {
    if (!selectedClass) return
    setLoading(true)
    // In a real app, we'd join with profiles. For now, fetch raw
    const { data } = await supabase
      .from('attendance')
      .select(`
        *,
        student:student_id (
          profiles:profile_id (full_name)
        )
      `)
      .eq('class_id', selectedClass)
      .eq('date', selectedDate)
    
    setAttendance(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (selectedClass) fetchAttendance()
  }, [selectedClass, selectedDate])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Student Attendance</h1>
          <p className="text-gray-500 text-sm">Monitor and manage daily attendance records</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
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
        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Date</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : selectedClass ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Check-in</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {attendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">{record.student?.profiles?.full_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        record.status === 'present' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{record.check_in_time || '--:--'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 italic">{record.remarks || 'None'}</td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                    No attendance records found for this date
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-24 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Please select a class to view attendance</p>
        </div>
      )}
    </div>
  )
}
