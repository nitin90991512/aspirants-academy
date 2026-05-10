'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Loader2, User, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { generateAdmissionNumber, BLOOD_GROUPS, CLASS_STANDARDS } from '@/lib/utils'

interface Class {
  id: string
  name: string
  standard: number
  section?: string
}

interface Batch {
  id: string
  name: string
  class_id: string
}

interface AcademicYear {
  id: string
  name: string
  is_current: boolean
}

export default function AddStudentPage() {
  const router = useRouter()
  const supabase = createClient()

  const [classes, setClasses] = useState<Class[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    guardian_phone: '',
    guardian_name: '',
    date_of_birth: '',
    gender: '',
    class_id: '',
    batch_id: '',
    academic_year_id: '',
    father_name: '',
    mother_name: '',
    address: '',
    previous_school: '',
    blood_group: '',
    is_navodaya_aspirant: false,
    navodaya_target_year: '',
    medical_notes: '',
    admission_number: generateAdmissionNumber(),
    roll_number: '',
  })

  useEffect(() => {
    async function fetchData() {
      const [{ data: cls }, { data: ay }] = await Promise.all([
        supabase.from('classes').select('*').eq('is_active', true).order('standard'),
        supabase.from('academic_years').select('*').order('created_at', { ascending: false }),
      ])
      setClasses(cls || [])
      setAcademicYears(ay || [])
      const current = ay?.find((y: AcademicYear) => y.is_current)
      if (current) setForm((f) => ({ ...f, academic_year_id: current.id }))
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!form.class_id) { setBatches([]); return }
    supabase.from('batches').select('*').eq('class_id', form.class_id).eq('is_active', true).then(({ data }) => setBatches(data || []))
  }, [form.class_id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Create a fake auth user for the student (admin creates them)
      // In production, student would do OTP login. Here we create the profile directly.
      // For demo: we create a profile with a dummy UUID
      const studentUUID = crypto.randomUUID()

      // Insert into profiles table (using service role via API)
      const res = await fetch('/api/admin/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          profile_id: studentUUID,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create student')

      router.push('/admin/students')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create student')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/students" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Add New Student</h1>
          <p className="text-gray-500 text-sm">Fill in the student details below</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full Name *" name="full_name" type="text" value={form.full_name} onChange={handleChange} required placeholder="Student's full name" />
            <FormField label="Student's Phone (for login) *" name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="10-digit mobile number" />
            <FormField label="Date of Birth *" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select name="gender" value={form.gender} onChange={handleChange} required className="form-select w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select name="blood_group" value={form.blood_group} onChange={handleChange} className="form-select w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition">
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <FormField label="Admission Number" name="admission_number" type="text" value={form.admission_number} onChange={handleChange} required />
            <FormField label="Roll Number" name="roll_number" type="text" value={form.roll_number} onChange={handleChange} placeholder="Optional" />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition resize-none" placeholder="Home address" />
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            Academic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
              <select name="class_id" value={form.class_id} onChange={handleChange} required className="form-select w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition">
                <option value="">Select Class</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}{c.section ? ` (${c.section})` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <select name="batch_id" value={form.batch_id} onChange={handleChange} className="form-select w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition" disabled={batches.length === 0}>
                <option value="">Select Batch (optional)</option>
                {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <select name="academic_year_id" value={form.academic_year_id} onChange={handleChange} className="form-select w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition">
                <option value="">Select Year</option>
                {academicYears.map((ay) => <option key={ay.id} value={ay.id}>{ay.name}{ay.is_current ? ' (Current)' : ''}</option>)}
              </select>
            </div>
            <FormField label="Previous School" name="previous_school" type="text" value={form.previous_school} onChange={handleChange} placeholder="Optional" />
          </div>

          {/* Navodaya Aspirant */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_navodaya_aspirant"
                name="is_navodaya_aspirant"
                checked={form.is_navodaya_aspirant}
                onChange={handleChange}
                className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="is_navodaya_aspirant" className="font-medium text-amber-800">
                Navodaya Vidyalaya Aspirant 🎯
              </label>
            </div>
            {form.is_navodaya_aspirant && (
              <div className="mt-3">
                <FormField label="Target Exam Year" name="navodaya_target_year" type="number" value={form.navodaya_target_year} onChange={handleChange} placeholder="e.g. 2026" />
              </div>
            )}
          </div>
        </div>

        {/* Family Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Family Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Father's Name *" name="father_name" type="text" value={form.father_name} onChange={handleChange} required />
            <FormField label="Mother's Name" name="mother_name" type="text" value={form.mother_name} onChange={handleChange} />
            <FormField label="Guardian/Parent Phone (for login) *" name="guardian_phone" type="tel" value={form.guardian_phone} onChange={handleChange} required placeholder="Parent's mobile number" />
            <FormField label="Guardian Name" name="guardian_name" type="text" value={form.guardian_name} onChange={handleChange} />
          </div>
        </div>

        {/* Medical */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Medical Notes</h2>
          <textarea
            name="medical_notes"
            value={form.medical_notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition resize-none"
            placeholder="Any medical conditions, allergies, or special needs..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pb-6">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Adding Student...' : 'Add Student'}
          </button>
          <Link href="/admin/students" className="px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

function FormField({
  label, name, type, value, onChange, required, placeholder, readOnly
}: {
  label: string
  name: string
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  placeholder?: string
  readOnly?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition ${readOnly ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
      />
    </div>
  )
}
