import { createClient } from '@/lib/supabase/server'
import ResultEditor from './ResultEditor'
import { ClipboardList } from 'lucide-react'

export const metadata = {
  title: 'Edit Student Results - Aspirants Academy',
}

async function getData() {
  const supabase = await createClient()
  
  const [exams, classes, subjects] = await Promise.all([
    supabase.from('exams').select('id, name').eq('is_published', true).order('created_at', { ascending: false }),
    supabase.from('classes').select('id, name').eq('is_active', true).order('standard'),
    supabase.from('subjects').select('id, name, max_marks').eq('is_active', true).order('name')
  ])

  return {
    exams: exams.data || [],
    classes: classes.data || [],
    subjects: subjects.data || []
  }
}

export default async function ResultsPage() {
  const { exams, classes, subjects } = await getData()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <ClipboardList className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Student Results</h1>
          <p className="text-gray-500 text-sm">Enter or edit marks for student examinations.</p>
        </div>
      </div>

      <ResultEditor 
        exams={exams} 
        classes={classes} 
        subjects={subjects} 
      />
    </div>
  )
}
