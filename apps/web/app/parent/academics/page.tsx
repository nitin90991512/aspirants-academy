'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  BookOpen, Calendar, Loader2, Clock, 
  User, School, FileText, Download, ExternalLink,
  Info
} from 'lucide-react'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export default function ParentAcademicsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'timetable' | 'syllabus'>('timetable')
  const [student, setStudent] = useState<any>(null)
  const [timetable, setTimetable] = useState<any[]>([])
  const [syllabuses, setSyllabuses] = useState<any[]>([])

  useEffect(() => {
    fetchStudentData()
  }, [])

  async function fetchStudentData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Get student linked to this parent
      const { data: parentData } = await supabase
        .from('parents')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (parentData) {
        const { data: linkData } = await supabase
          .from('student_parents')
          .select('student:student_id (*, class:class_id (*))')
          .eq('parent_id', parentData.id)
          .single()

        if (linkData?.student) {
          const studentObj = Array.isArray(linkData.student) ? linkData.student[0] : linkData.student
          setStudent(studentObj)
          
          // 2. Fetch Timetable
          const { data: tt } = await supabase
            .from('timetable')
            .select(`
              *,
              subject:subject_id (name),
              teacher:teacher_id (profiles:profile_id (full_name))
            `)
            .eq('class_id', studentObj.class_id)
            .order('period_number')
          
          if (tt) setTimetable(tt)

          // 3. Fetch Syllabus
          const { data: syl } = await supabase
            .from('syllabus')
            .select(`
              *,
              subject:subject_id (name)
            `)
            .eq('class_id', studentObj.class_id)
          
          if (syl) setSyllabuses(syl)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getDaySchedule = (day: string) => {
    return timetable.filter(t => t.day === day).sort((a, b) => a.period_number - b.period_number)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Loading academic data...</p>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center space-y-4">
        <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
          <Info className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Student Profile Not Linked</h2>
        <p className="text-gray-500">We couldn't find a student linked to your account. Please contact the academy administration to link your child's profile.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Academic Resources</h1>
          <p className="text-gray-500 text-sm">Timetable and Syllabus for {student.full_name}</p>
        </div>
        
        <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('timetable')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'timetable' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Timetable
          </button>
          <button 
            onClick={() => setActiveTab('syllabus')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'syllabus' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Syllabus
          </button>
        </div>
      </div>

      {activeTab === 'timetable' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {DAYS.map((day) => (
            <div key={day} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">{day}</h3>
              </div>
              <div className="p-4 flex-1 space-y-3">
                {getDaySchedule(day).map((entry) => (
                  <div key={entry.id} className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center flex-shrink-0 shadow-lg shadow-blue-100">
                        <span className="text-[10px] font-black uppercase opacity-60">Prd</span>
                        <span className="text-sm font-black leading-none">{entry.period_number}</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-bold text-gray-900 text-sm">{entry.subject?.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{entry.teacher?.profiles?.full_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {getDaySchedule(day).length === 0 && (
                  <div className="py-8 text-center text-gray-300 italic text-sm">No periods today</div>
                )}
              </div>
            </div>
          ))}
          
          {/* Sample View Callout */}
          {timetable.length === 0 && (
            <div className="col-span-full mt-8 p-8 bg-blue-50 rounded-3xl border border-blue-100 text-center">
              <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-blue-900 mb-2">Sample Academic Schedule</h3>
              <p className="text-blue-700/70 text-sm mb-6 max-w-md mx-auto">
                No digital timetable has been set for this class yet. Below is a sample of how your child's schedule will look once published.
              </p>
              <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img 
                  src="/school_timetable_sample.png" 
                  alt="Sample Timetable" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {syllabuses.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all group">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 w-fit mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black text-gray-500 bg-gray-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {item.subject?.name}
                </span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-3 mb-6">{item.description}</p>
              
              {item.file_url && (
                <a 
                  href={item.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-100"
                >
                  <Download className="w-4 h-4" />
                  Download Syllabus
                </a>
              )}
            </div>
          ))}
          {syllabuses.length === 0 && (
            <div className="col-span-full py-24 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No syllabus content available for your class yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
