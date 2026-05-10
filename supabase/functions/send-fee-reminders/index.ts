// supabase/functions/send-fee-reminders/index.ts
// Runs daily at 9 AM IST via cron: 30 3 * * *

import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const today = new Date()
  const threeDaysLater = new Date(today.getTime() + 3 * 86400000).toISOString().slice(0, 10)
  const todayStr = today.toISOString().slice(0, 10)

  // Get invoices due in 3 days (upcoming reminders)
  const { data: upcomingDues } = await supabase
    .from('pending_fees_view')
    .select('*')
    .eq('due_date', threeDaysLater)
    .in('status', ['pending', 'partial'])

  // Get overdue invoices (past due date, still pending)
  const { data: overdueDues } = await supabase
    .from('pending_fees_view')
    .select('*')
    .lt('due_date', todayStr)
    .in('status', ['pending', 'partial'])

  const interaktApiKey = Deno.env.get('INTERAKT_API_KEY') || ''

  let sent = 0
  let failed = 0

  // Process upcoming dues
  for (const invoice of upcomingDues || []) {
    try {
      // Get parent phone
      const { data: parents } = await supabase
        .from('student_parents')
        .select('parents(profiles(phone, whatsapp_opt_in))')
        .eq('student_id', invoice.student_id)

      const message = `Dear Parent,\n💳 Friendly Reminder: Fees of ₹${invoice.total_amount} for *${invoice.student_name}* (${invoice.class_name}) are due on ${invoice.due_date}.\n\nInvoice: ${invoice.invoice_number}\n\nPlease pay at the academy or online.\n\n📚 Aspirants Academy, Gandhinagar | 9265720004`

      for (const link of parents || []) {
        const parent = (link as { parents?: { profiles?: { phone?: string; whatsapp_opt_in?: boolean } } }).parents?.profiles
        if (parent?.whatsapp_opt_in && parent.phone && interaktApiKey) {
          await fetch('https://api.interakt.ai/v1/public/message/', {
            method: 'POST',
            headers: { 'Authorization': `Basic ${interaktApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ countryCode: '+91', phoneNumber: parent.phone, type: 'Text', data: { message } }),
          })
          sent++
        }
      }
    } catch {
      failed++
    }
  }

  // Process overdue
  for (const invoice of overdueDues || []) {
    try {
      // Mark as overdue if past due date
      await supabase.from('fee_invoices').update({ status: 'overdue' }).eq('id', invoice.invoice_id).in('status', ['pending', 'partial'])

      const { data: parents } = await supabase
        .from('student_parents')
        .select('parents(profiles(phone, whatsapp_opt_in))')
        .eq('student_id', invoice.student_id)

      const daysOverdue = Math.floor((today.getTime() - new Date(invoice.due_date).getTime()) / 86400000)
      const message = `Dear Parent,\n🔴 OVERDUE FEES: ₹${invoice.total_amount} for *${invoice.student_name}* (${invoice.class_name}) was due on ${invoice.due_date} (${daysOverdue} days ago).\n\nInvoice: ${invoice.invoice_number}\n\nPlease clear dues immediately to avoid late fees.\n\n📚 Aspirants Academy, Gandhinagar | 9265720004`

      for (const link of parents || []) {
        const parent = (link as { parents?: { profiles?: { phone?: string; whatsapp_opt_in?: boolean } } }).parents?.profiles
        if (parent?.whatsapp_opt_in && parent.phone && interaktApiKey) {
          await fetch('https://api.interakt.ai/v1/public/message/', {
            method: 'POST',
            headers: { 'Authorization': `Basic ${interaktApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ countryCode: '+91', phoneNumber: parent.phone, type: 'Text', data: { message } }),
          })
          sent++
        }
      }
    } catch {
      failed++
    }
  }

  return new Response(JSON.stringify({
    success: true,
    upcoming_reminders: upcomingDues?.length || 0,
    overdue_notices: overdueDues?.length || 0,
    notifications_sent: sent,
    notifications_failed: failed,
  }), { headers: { 'Content-Type': 'application/json' } })
})
