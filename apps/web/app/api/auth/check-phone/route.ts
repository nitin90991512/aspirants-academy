import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone || phone.length !== 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, is_active, full_name')
      .eq('phone', phone)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Phone number not registered. Please contact Aspirants Academy.' },
        { status: 404 }
      )
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { error: 'Your account is deactivated. Please contact the admin.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      role: profile.role,
      name: profile.full_name,
      can_login: true,
    })
  } catch (err) {
    console.error('Phone check error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
