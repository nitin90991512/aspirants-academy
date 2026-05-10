'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  UserCheck, Loader2, Calendar, 
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react'

export default function ParentAttendancePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [attendance, setAttendance] = useState<any[]>([])
  const [child, setChild] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Get parent's children
    const { data: parent } = await supabase.from('parents').select('id').eq('profile_id', user.id).single()
    if (!parent) { setLoading(false); return }

    const { data: children } = await supabase
      .from('student_parents')
      .select('student:student_id (*, profiles:profile_id (*))')
      .eq('parent_id', parent.id)
      .limit(1)
    
    if (children && children[0]) {
      const student = children[0].student as any
      setChild(student)

      // 2. Get attendance for this child
      const { data: att } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', student.id)
        .order('date', { ascending: false })
        .limit(30)
      
      setAttendance(att || [])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Attendance History</h1>
          <p className="text-gray-500 text-sm">Monitoring {child?.profiles?.full_name || 'your child'}'s daily presence</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : child ? (
        <div className="space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Present</p>
              <p className="text-2xl font-bold text-green-600">{attendance.filter(a => a.status === 'present').length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Absent</p>
              <p className="text-2xl font-bold text-red-600">{attendance.filter(a => a.status === 'absent').length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Days</p>
              <p className="text-2xl font-bold text-gray-900">{attendance.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Percentage</p>
              <p className="text-2xl font-bold text-blue-600">
                {attendance.length > 0 ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-sm">Recent Records</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {attendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${record.status === 'present' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">{record.status}</p>
                    </div>
                  </div>
                  {record.remarks && (
                    <div className="text-xs text-gray-500 italic bg-gray-50 px-3 py-1 rounded-full">
                      {record.remarks}
                    </div>
                  )}
                </div>
              ))}
              {attendance.length === 0 && (
                <div className="py-12 text-center text-gray-400 italic">No attendance records found</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-gray-500 italic">No student associated with your account found</div>
      )}
    </div>
  )
}
