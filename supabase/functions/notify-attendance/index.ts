// supabase/functions/notify-attendance/index.ts
// Deploy with: supabase functions deploy notify-attendance

import { createClient } from 'npm:@supabase/supabase-js@2'

async function sendWhatsApp(phone: string, message: string, apiKey: string) {
  try {
    await fetch('https://api.interakt.ai/v1/public/message/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        countryCode: '+91',
        phoneNumber: phone,
        type: 'Text',
        data: { message },
      }),
    })
  } catch (err) {
    console.error('WhatsApp send error:', err)
  }
}

async function sendPushNotification(fcmToken: string, title: string, body: string) {
  // Implement FCM push notification
  console.log('Push notification:', { fcmToken, title, body })
}

Deno.serve(async (req) => {
  try {
    const { studentId, status, date, checkInTime, classId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const interaktApiKey = Deno.env.get('INTERAKT_API_KEY') || ''

    // Get student info
    const { data: student } = await supabase
      .from('student_full_view')
      .select('full_name, class_name')
      .eq('id', studentId)
      .single()

    if (!student) {
      return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 })
    }

    // Get parents
    const { data: parentLinks } = await supabase
      .from('student_parents')
      .select(`
        parents (
          profile_id,
          profiles (phone, full_name, whatsapp_opt_in, sms_opt_in, fcm_token)
        )
      `)
      .eq('student_id', studentId)

    const messages: Record<string, string> = {
      present: `Dear Parent,\n✅ Your child *${student.full_name}* (${student.class_name}) attended *Aspirants Academy* today at ${checkInTime || 'morning'}.\n\n📚 Aspirants Academy, Gandhinagar | 9265720004`,
      absent: `Dear Parent,\n⚠️ Your child *${student.full_name}* (${student.class_name}) was *ABSENT* at Aspirants Academy today (${date}).\n\nIf unplanned, please contact: 9265720004\n\n📚 Aspirants Academy, Gandhinagar`,
      late: `Dear Parent,\n🕐 Your child *${student.full_name}* (${student.class_name}) arrived *LATE* at Aspirants Academy today at ${checkInTime}.\n\n📚 Aspirants Academy, Gandhinagar`,
    }

    const message = messages[status] || messages['absent']

    for (const link of parentLinks || []) {
      const parent = (link.parents as { profiles?: { phone?: string; whatsapp_opt_in?: boolean; sms_opt_in?: boolean; fcm_token?: string }; profile_id?: string })?.profiles
      const parentProfileId = (link.parents as { profile_id?: string })?.profile_id

      if (!parent) continue

      // Send WhatsApp
      if (parent.whatsapp_opt_in && parent.phone && interaktApiKey) {
        await sendWhatsApp(parent.phone, message, interaktApiKey)
      }

      // Send push notification
      if (parent.fcm_token) {
        const pushTitle = status === 'present' ? '✅ Attendance Marked' :
          status === 'absent' ? '⚠️ Child Absent Today' : '🕐 Child Arrived Late'
        await sendPushNotification(parent.fcm_token, pushTitle, `${student.full_name} is ${status} today`)
      }

      // Log notification
      if (parentProfileId) {
        await supabase.from('notification_log').insert({
          type: 'attendance',
          recipient_id: parentProfileId,
          channel: 'whatsapp',
          title: 'Attendance Update',
          body: message,
          status: 'sent',
          metadata: { student_id: studentId, attendance_status: status, date },
        })

        // Mark as notified
        await supabase.from('attendance').update({
          parent_notified: true,
          notification_sent_at: new Date().toISOString(),
        }).eq('student_id', studentId).eq('date', date)
      }
    }

    return new Response(JSON.stringify({ success: true, notified: parentLinks?.length || 0 }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Notification error:', err)
    return new Response(JSON.stringify({ error: 'Notification failed' }), { status: 500 })
  }
})
