'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  BookOpen, Loader2, Calendar, 
  School, Plus, Search, FileText, Trash2
} from 'lucide-react'

export default function AdminHomeworkPage() {
  const supabase = createClient()
  const [homeworks, setHomeworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeworks()
  }, [])

  async function fetchHomeworks() {
    setLoading(true)
    const { data } = await supabase
      .from('homework')
      .select(`
        *,
        class:class_id (name),
        teacher:teacher_id (
          profiles:profile_id (full_name)
        ),
        subject:subject_id (name)
      `)
      .order('created_at', { ascending: false })
    
    if (data) setHomeworks(data)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Homework Management</h1>
          <p className="text-gray-500 text-sm">Track and manage assignments across all classes</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {homeworks.map((hw) => (
            <div key={hw.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{hw.class?.name}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{hw.title}</h3>
              <p className="text-xs text-gray-500 font-medium mb-4">{hw.subject?.name}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>Due: {new Date(hw.due_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <FileText className="w-3 h-3" />
                  <span>By: {hw.teacher?.profiles?.full_name}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg transition">VIEW SUBMISSIONS</button>
                <button className="p-2 text-gray-400 hover:text-red-500 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {homeworks.length === 0 && (
            <div className="col-span-full py-24 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No homework assigned yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}