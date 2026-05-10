'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  UserCog, Search, Plus, Loader2, Mail, Phone, 
  MapPin, GraduationCap, Calendar, DollarSign, X, Save
} from 'lucide-react'

interface Teacher {
  id: string
  employee_id: string
  qualification: string
  specialization: string[]
  profiles: {
    full_name: string
    phone: string
    email: string
    address: string
    is_active: boolean
  }
}

export default function TeachersPage() {
  const supabase = createClient()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    qualification: '',
    specialization: '',
    employee_id: '',
    joining_date: '',
    salary_amount: '',
    address: '',
    gender: 'male',
  })

  useEffect(() => {
    fetchTeachers()
  }, [])

  async function fetchTeachers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        profiles:profile_id (*)
      `)
      .order('created_at', { ascending: false })

    if (data) setTeachers(data as any)
    setLoading(false)
  }

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/admin/create-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create teacher')

      setShowAddModal(false)
      setForm({
        full_name: '', phone: '', email: '', qualification: '',
        specialization: '', employee_id: '', joining_date: '',
        salary_amount: '', address: '', gender: 'male'
      })
      fetchTeachers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTeachers = teachers.filter(t => 
    t.profiles.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.employee_id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Teachers Management</h1>
          <p className="text-gray-500 text-sm">Manage faculty profiles and accounts</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Teacher</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </div>
      </div>

      {/* Teacher List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading faculty data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">
                      {teacher.profiles.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">{teacher.profiles.full_name}</h3>
                      <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">{teacher.employee_id}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${teacher.profiles.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {teacher.profiles.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <GraduationCap className="w-4 h-4" />
                    <span>{teacher.qualification || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{teacher.profiles.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="w-4 h-4" />
                    <span>{teacher.profiles.phone}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {teacher.specialization?.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
                <button className="text-blue-600 text-xs font-bold hover:underline">View Profile</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setShowAddModal(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 font-[Poppins]">Register New Teacher</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="p-6 overflow-y-auto max-h-[80vh]">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Personal Details</h3>
                  <div className="space-y-3">
                    <Input label="Full Name *" value={form.full_name} onChange={(v: string) => setForm({...form, full_name: v})} required placeholder="John Doe" />
                    <Input label="Phone Number *" value={form.phone} onChange={(v: string) => setForm({...form, phone: v})} required placeholder="10-digit mobile" />
                    <Input label="Email Address" type="email" value={form.email} onChange={(v: string) => setForm({...form, email: v})} placeholder="teacher@example.com" />
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Gender</label>
                      <select 
                        value={form.gender} 
                        onChange={(e) => setForm({...form, gender: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Professional Info</h3>
                  <div className="space-y-3">
                    <Input label="Qualification" value={form.qualification} onChange={(v: string) => setForm({...form, qualification: v})} placeholder="e.g. M.Sc, B.Ed" />
                    <Input label="Specializations" value={form.specialization} onChange={(v: string) => setForm({...form, specialization: v})} placeholder="Maths, Science (comma separated)" />
                    <Input label="Employee ID" value={form.employee_id} onChange={(v: string) => setForm({...form, employee_id: v})} placeholder="Auto-generated if empty" />
                    <Input label="Joining Date" type="date" value={form.joining_date} onChange={(v: string) => setForm({...form, joining_date: v})} />
                    <Input label="Salary Amount" type="number" value={form.salary_amount} onChange={(v: string) => setForm({...form, salary_amount: v})} placeholder="Monthly salary" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Address</label>
                  <textarea 
                    value={form.address}
                    onChange={(e) => setForm({...form, address: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                    placeholder="Residential address"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{submitting ? 'Registering...' : 'Register Teacher'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', required = false, placeholder = '' }: { label: string, value: string, onChange: (v: string) => void, type?: string, required?: boolean, placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
      />
    </div>
  )
}