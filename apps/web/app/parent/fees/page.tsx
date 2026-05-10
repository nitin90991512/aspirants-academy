'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  CreditCard, Loader2, DollarSign, Calendar, 
  Receipt, Clock, CheckCircle, AlertCircle,
  TrendingUp, Wallet, ArrowRight, Info
} from 'lucide-react'

export default function ParentFeesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<any>(null)
  const [summary, setSummary] = useState({ total_fees: 0, paid_fees: 0, pending_fees: 0 })
  const [invoices, setInvoices] = useState<any[]>([])

  useEffect(() => {
    fetchFeesData()
  }, [])

  async function fetchFeesData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Get linked student
      const { data: parentData } = await supabase.from('parents').select('id').eq('profile_id', user.id).single()
      if (parentData) {
        const { data: linkData } = await supabase
          .from('student_parents')
          .select('student_id, student:student_id (full_name)')
          .eq('parent_id', parentData.id)
          .single()

        if (linkData) {
          const studentId = linkData.student_id
          const studentObj = Array.isArray(linkData.student) ? linkData.student[0] : linkData.student
          setStudent(studentObj)

          // 2. Get Fee Summary (using RPC)
          const { data: sum, error: sumErr } = await supabase.rpc('get_student_fee_summary', { student_uuid: studentId })
          if (sum && sum[0]) {
            setSummary(sum[0])
          }

          // 3. Get Invoices
          const { data: inv } = await supabase
            .from('fee_invoices')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })
          
          if (inv) setInvoices(inv)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Fetching financial records...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Fees & Payments</h1>
        <p className="text-gray-500 text-sm">Financial summary for {student?.full_name}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Total Fee Amount</p>
            <h3 className="text-3xl font-black">₹{summary.total_fees.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-green-500 opacity-5 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Fees Paid</p>
            <h3 className="text-3xl font-black text-green-600">₹{summary.paid_fees.toLocaleString()}</h3>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${(summary.paid_fees / (summary.total_fees || 1)) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-gray-400">
                {Math.round((summary.paid_fees / (summary.total_fees || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-red-500 opacity-5 group-hover:scale-110 transition-transform">
            <AlertCircle className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Remaining Balance</p>
            <h3 className="text-3xl font-black text-red-600">₹{summary.pending_fees.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-400 font-medium mt-4">Please clear outstanding dues at the earliest.</p>
          </div>
        </div>
      </div>

      {/* Invoices Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Invoices & Receipts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Invoice Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{inv.discount_reason || 'Monthly Tuition Fee'}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">INV-#{inv.id.slice(0, 8).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-gray-900">₹{inv.total_amount}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{new Date(inv.due_date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {inv.status === 'paid' ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" />
                          Paid
                        </span>
                      ) : inv.status === 'partial' ? (
                         <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          Partial
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          <AlertCircle className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                    No fee records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl h-fit">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-blue-900 text-sm">Payment Information</h4>
          <p className="text-xs text-blue-700 leading-relaxed mt-1">
            Currently, we only accept offline payments at the academy office. Please carry the invoice copy or mention the invoice number during payment. Online payment integration is coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}
