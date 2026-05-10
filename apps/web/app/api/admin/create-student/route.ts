import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createServiceClient()

    const {
      full_name, phone, guardian_phone, guardian_name,
      date_of_birth, gender, class_id, batch_id, academic_year_id,
      father_name, mother_name, address, previous_school,
      blood_group, is_navodaya_aspirant, navodaya_target_year,
      medical_notes, admission_number, roll_number,
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
      return NextResponse.json({ error: 'A student with this phone number already exists' }, { status: 409 })
    }

    // Create auth user for student
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      phone: `+91${phone}`,
      phone_confirm: true,
      user_metadata: { full_name, role: 'student' },
    })

    if (authError || !authUser.user) {
      // If auth fails (e.g., phone already in use), still create profile
      console.warn('Auth creation warning:', authError?.message)
    }

    const profileId = authUser?.user?.id || crypto.randomUUID()

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: profileId,
      role: 'student',
      full_name,
      phone,
      date_of_birth: date_of_birth || null,
      gender: gender || null,
      address: address || null,
    })

    if (profileError) {
      return NextResponse.json({ error: 'Failed to create student profile: ' + profileError.message }, { status: 500 })
    }

    // Create student record
    const { data: student, error: studentError } = await supabase.from('students').insert({
      profile_id: profileId,
      admission_number,
      roll_number: roll_number || null,
      class_id: class_id || null,
      batch_id: batch_id || null,
      academic_year_id: academic_year_id || null,
      father_name: father_name || null,
      mother_name: mother_name || null,
      is_navodaya_aspirant: is_navodaya_aspirant || false,
      navodaya_target_year: navodaya_target_year ? parseInt(navodaya_target_year) : null,
      previous_school: previous_school || null,
      blood_group: blood_group || null,
      medical_notes: medical_notes || null,
    }).select().single()

    if (studentError) {
      return NextResponse.json({ error: 'Failed to create student: ' + studentError.message }, { status: 500 })
    }

    // If guardian phone provided, create parent profile
    if (guardian_phone && guardian_phone !== phone) {
      const { data: existingParent } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', guardian_phone)
        .single()

      let parentProfileId: string

      if (existingParent) {
        parentProfileId = existingParent.id
      } else {
        const { data: parentAuth } = await supabase.auth.admin.createUser({
          phone: `+91${guardian_phone}`,
          phone_confirm: true,
          user_metadata: { full_name: guardian_name || father_name, role: 'parent' },
        })

        parentProfileId = parentAuth?.user?.id || crypto.randomUUID()

        await supabase.from('profiles').insert({
          id: parentProfileId,
          role: 'parent',
          full_name: guardian_name || father_name || 'Parent',
          phone: guardian_phone,
        })
      }

      // Link parent
      const { data: parentRecord } = await supabase
        .from('parents')
        .select('id')
        .eq('profile_id', parentProfileId)
        .single()

      let parentId: string

      if (parentRecord) {
        parentId = parentRecord.id
      } else {
        const { data: newParent } = await supabase.from('parents').insert({
          profile_id: parentProfileId,
          relation: 'guardian',
        }).select('id').single()
        parentId = newParent?.id
      }

      if (parentId && student?.id) {
        await supabase.from('student_parents').insert({
          student_id: student.id,
          parent_id: parentId,
          is_primary: true,
        })
      }
    }

    return NextResponse.json({ success: true, student_id: student?.id })
  } catch (err) {
    console.error('Create student error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
