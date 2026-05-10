'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  ClipboardList, Loader2, Trophy, 
  FileText, TrendingUp, AlertCircle
} from 'lucide-react'

export default function ParentExamsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<any[]>([])
  const [child, setChild] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

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

      const { data: res } = await supabase
        .from('exam_results')
        .select(`
          *,
          exam:exam_id (name, exam_type),
          subject:subject_id (name)
        `)
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })
      
      setResults(res || [])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Exam Results</h1>
        <p className="text-gray-500 text-sm">Track {child?.profiles?.full_name || 'your child'}'s academic performance</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : child ? (
        <div className="space-y-6">
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Group by exam name in a real app, for now list items */}
              {results.map((res) => (
                <div key={res.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score</p>
                      <p className="text-xl font-bold text-gray-900">{res.marks_obtained} / {res.max_marks}</p>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{res.subject?.name}</h3>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-4">{res.exam?.name}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-xs text-gray-400">Percentage: {Math.round((res.marks_obtained / res.max_marks) * 100)}%</span>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      (res.marks_obtained / res.max_marks) >= 0.33 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {(res.marks_obtained / res.max_marks) >= 0.33 ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No exam results available yet</p>
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center text-gray-500 italic">No student associated with your account found</div>
      )}
    </div>
  )
}
