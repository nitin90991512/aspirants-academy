import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { absentStudentIds, date, classId } = await request.json()
    
    // Call the Supabase Edge Function for each absent student
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
    }

    const results = await Promise.allSettled(
      (absentStudentIds || []).map((studentId: string) =>
        fetch(`${supabaseUrl}/functions/v1/notify-attendance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ studentId, status: 'absent', date, classId }),
        })
      )
    )

    const succeeded = results.filter((r) => r.status === 'fulfilled').length

    return NextResponse.json({
      success: true,
      notified: succeeded,
      total: absentStudentIds?.length || 0,
    })
  } catch (err) {
    console.error('Notify attendance error:', err)
    return NextResponse.json({ error: 'Notification failed' }, { status: 500 })
  }
}
