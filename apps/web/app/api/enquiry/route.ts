import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { enquiry_name, name, phone, email, student_class, message, is_navodaya_interest } = await request.json()
    const supabase = await createServiceClient()

    await supabase.from('enquiries').insert({
      name: name || enquiry_name,
      phone,
      email: email || null,
      student_class: student_class || null,
      message: message || null,
      is_navodaya_interest: is_navodaya_interest || false,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 })
  }
}
