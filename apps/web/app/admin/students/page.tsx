import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Plus, Search, Filter, Download, Upload, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { StudentFullView } from '@/lib/types'

export const metadata = { title: 'Students' }

async function getStudents(search?: string, classFilter?: string) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('student_full_view')
      .select('*')
      .order('full_name')

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,admission_number.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    if (classFilter) {
      query = query.eq('standard', parseInt(classFilter))
    }

    const { data, error } = await query.limit(100)
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

async function getClasses() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('classes').select('id, name, standard, section').eq('is_active', true).order('standard')
    return data || []
  } catch {
    return []
  }
}

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ search?: string; class?: string }> }) {
  const params = await searchParams
  const students = await getStudents(params.search, params.class)
  const classes = await getClasses()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Students</h1>
          <p className="text-gray-500 text-sm">{students.length} students found</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition">
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition">
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link
            href="/admin/students/add"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <form method="GET" className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-48">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="search"
              name="search"
              defaultValue={params.search}
              placeholder="Search by name, admission no, phone..."
              className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
            />
          </div>
          <select
            name="class"
            defaultValue={params.class}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">All Classes</option>
            {classes.map((c: { id: string; name: string }) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
            Search
          </button>
          {(params.search || params.class) && (
            <Link href="/admin/students" className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition">
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Admission No</th>
                <th>Class</th>
                <th>Father's Name</th>
                <th>Phone</th>
                <th>Navodaya</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No students found</p>
                    <p className="text-sm mt-1">
                      <Link href="/admin/students/add" className="text-blue-600 hover:underline">Add your first student</Link>
                    </p>
                  </td>
                </tr>
              ) : (
                students.map((student: StudentFullView) => (
                  <tr key={student.id} className="cursor-pointer hover:bg-gray-50 transition">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {student.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{student.full_name}</div>
                          <div className="text-xs text-gray-400">Roll: {student.roll_number || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-sm text-gray-600">{student.admission_number}</td>
                    <td>
                      <span className="badge bg-blue-100 text-blue-700">
                        {student.class_name || '—'} {student.section ? `(${student.section})` : ''}
                      </span>
                    </td>
                    <td className="text-gray-600 text-sm">{student.father_name || '—'}</td>
                    <td className="text-gray-600 text-sm font-mono">{student.phone}</td>
                    <td>
                      {student.is_navodaya_aspirant ? (
                        <span className="badge bg-amber-100 text-amber-700 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          Yes
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="text-gray-500 text-sm">{formatDate(student.admission_date)}</td>
                    <td>
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
