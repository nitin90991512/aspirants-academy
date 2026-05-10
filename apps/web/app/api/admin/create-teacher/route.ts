import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createServiceClient()

    const {
      full_name, phone, email, date_of_birth, gender,
      qualification, specialization, employee_id, joining_date,
      salary_amount, address
    } = body

    if (!full_name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }

    // Check if phone already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existingProfile) {
      return NextResponse.json({ error: 'A user with this phone number already exists' }, { status: 409 })
    }

    // Create auth user for teacher
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      phone: `+91${phone}`,
      email: email || undefined,
      phone_confirm: true,
      user_metadata: { full_name, role: 'teacher' },
    })

    const profileId = authUser?.user?.id || crypto.randomUUID()

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: profileId,
      role: 'teacher',
      full_name,
      phone,
      email: email || null,
      date_of_birth: date_of_birth || null,
      gender: gender || null,
      address: address || null,
    })

    if (profileError) {
      return NextResponse.json({ error: 'Failed to create teacher profile: ' + profileError.message }, { status: 500 })
    }

    // Create teacher record
    const { data: teacher, error: teacherError } = await supabase.from('teachers').insert({
      profile_id: profileId,
      employee_id: employee_id || `TCH${Date.now().toString().slice(-6)}`,
      qualification: qualification || null,
      specialization: specialization ? specialization.split(',').map((s: string) => s.trim()) : [],
      joining_date: joining_date || null,
      salary_amount: salary_amount ? parseFloat(salary_amount) : null,
    }).select().single()

    if (teacherError) {
      return NextResponse.json({ error: 'Failed to create teacher record: ' + teacherError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, teacher_id: teacher?.id })
  } catch (err) {
    console.error('Create teacher error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
