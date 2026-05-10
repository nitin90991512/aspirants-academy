import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CreditCard, Plus, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate, getFeeStatusColor } from '@/lib/utils'
import { PendingFeesView } from '@/lib/types'

export const metadata = { title: 'Fees Management' }

export default async function FeesPage() {
  const supabase = await createClient()
  const { data: pendingFees } = await supabase.from('pending_fees_view').select('*').limit(50)
  const { data: recentPayments } = await supabase
    .from('fee_payments')
    .select('*, students(profiles(full_name))')
    .order('paid_at', { ascending: false })
    .limit(10)

  const totalPending = (pendingFees || []).reduce((s: number, f: PendingFeesView) => s + f.total_amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Fees Management</h1>
          <p className="text-gray-500 text-sm">Total pending: {formatCurrency(totalPending)}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/fees/collect" className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition">
            <CreditCard className="w-4 h-4" /> Collect Fee
          </Link>
          <Link href="/admin/fees/generate" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">
            <Plus className="w-4 h-4" /> Generate Invoices
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            <span className="font-semibold text-orange-800">Total Dues</span>
          </div>
          <div className="text-3xl font-black text-orange-700 font-[Poppins]">{formatCurrency(totalPending)}</div>
          <div className="text-sm text-orange-600 mt-1">{pendingFees?.length || 0} pending invoices</div>
        </div>
      </div>

      {/* Pending Fees Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Pending Dues</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Invoice No</th>
                <th>Class</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(pendingFees || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">No pending fees 🎉</td>
                </tr>
              ) : (
                (pendingFees || []).map((fee: PendingFeesView) => (
                  <tr key={fee.invoice_id}>
                    <td>
                      <div className="font-medium text-gray-900">{fee.student_name}</div>
                      <div className="text-xs text-gray-400">{fee.student_phone}</div>
                    </td>
                    <td className="font-mono text-sm text-gray-600">{fee.invoice_number || '—'}</td>
                    <td><span className="badge bg-blue-100 text-blue-700">{fee.class_name || '—'}</span></td>
                    <td className="font-semibold text-gray-900">{formatCurrency(fee.total_amount)}</td>
                    <td className="text-gray-500 text-sm">{formatDate(fee.due_date)}</td>
                    <td><span className={`badge ${getFeeStatusColor(fee.status)}`}>{fee.status}</span></td>
                    <td>
                      <button className="text-blue-600 hover:underline text-sm font-medium">Collect</button>
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
