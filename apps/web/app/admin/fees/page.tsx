'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  CreditCard, Plus, Loader2, Save, Trash2, 
  Search, User, DollarSign, Calendar, Filter, 
  Receipt, Clock, CheckCircle, AlertCircle
} from 'lucide-react'

export default function AdminFeesPage() {
  const supabase = createClient()
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [invoiceForm, setInvoiceForm] = useState({
    amount: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
  })

  const [paymentForm, setPaymentForm] = useState({
    invoice_id: '',
    amount_paid: '',
    payment_method: 'cash',
    notes: '',
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    setLoading(true)
    const { data } = await supabase
      .from('student_full_view')
      .select('*')
      .order('full_name')
    
    if (data) setStudents(data)
    setLoading(false)
  }

  const fetchStudentFees = async (studentId: string) => {
    const { data: inv } = await supabase
      .from('fee_invoices')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    
    if (inv) setInvoices(inv)
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { error } = await supabase.from('fee_invoices').insert({
        student_id: selectedStudent.id,
        amount: parseFloat(invoiceForm.amount),
        total_amount: parseFloat(invoiceForm.amount),
        due_date: invoiceForm.due_date,
        discount_reason: invoiceForm.description
      })
      if (error) throw error
      setShowInvoiceModal(false)
      fetchStudentFees(selectedStudent.id)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // 1. Record Payment
      const { error: payError } = await supabase.from('fee_payments').insert({
        invoice_id: paymentForm.invoice_id,
        student_id: selectedStudent.id,
        amount_paid: parseFloat(paymentForm.amount_paid),
        payment_method: paymentForm.payment_method,
        notes: paymentForm.notes
      })
      if (payError) throw payError

      // 2. Update Invoice Status
      const invoice = invoices.find(i => i.id === paymentForm.invoice_id)
      const newStatus = parseFloat(paymentForm.amount_paid) >= invoice.total_amount ? 'paid' : 'partial'
      
      await supabase.from('fee_invoices').update({ status: newStatus }).eq('id', paymentForm.invoice_id)

      setShowPaymentModal(false)
      fetchStudentFees(selectedStudent.id)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admission_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Fees Management</h1>
          <p className="text-gray-500 text-sm">Collect payments and manage student invoices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Student List Sidebar */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Students</h3>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student)
                    fetchStudentFees(student.id)
                  }}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-blue-50/30 transition text-left ${selectedStudent?.id === student.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold uppercase overflow-hidden border-2 border-white shadow-sm">
                    {student.avatar_url ? <img src={student.avatar_url} className="w-full h-full object-cover" /> : student.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{student.full_name}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">#{student.admission_number}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Details Area */}
        <div className="xl:col-span-8">
          {selectedStudent ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Student Card */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-black border-4 border-white shadow-lg overflow-hidden">
                   {selectedStudent.avatar_url ? <img src={selectedStudent.avatar_url} className="w-full h-full object-cover" /> : selectedStudent.full_name?.charAt(0)}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl font-bold text-gray-900 font-[Poppins]">{selectedStudent.full_name}</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 mt-1">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <School className="w-4 h-4" />
                      <span>Class: {selectedStudent.class_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span>Father: {selectedStudent.father_name}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowInvoiceModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 transition"
                >
                  Create Invoice
                </button>
              </div>

              {/* Invoices List */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Fee Invoices</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{new Date(inv.created_at).toLocaleDateString()}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Due: {inv.due_date}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-gray-900">₹{inv.total_amount}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              inv.status === 'paid' ? 'bg-green-100 text-green-600' : 
                              inv.status === 'partial' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {inv.status !== 'paid' && (
                              <button 
                                onClick={() => {
                                  setPaymentForm({ ...paymentForm, invoice_id: inv.id, amount_paid: inv.total_amount.toString() })
                                  setShowPaymentModal(true)
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <Receipt className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {invoices.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                            No invoices generated yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <CreditCard className="w-16 h-16 text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">Select a student from the list to manage fees</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowInvoiceModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 font-[Poppins]">Create New Invoice</h2>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <Input label="Amount (₹)" type="number" required value={invoiceForm.amount} onChange={(v: string) => setInvoiceForm({...invoiceForm, amount: v})} />
              <Input label="Description / Reason" value={invoiceForm.description} onChange={(v: string) => setInvoiceForm({...invoiceForm, description: v})} placeholder="e.g. Monthly Fee - Oct" />
              <Input label="Due Date" type="date" value={invoiceForm.due_date} onChange={(v: string) => setInvoiceForm({...invoiceForm, due_date: v})} />
              <button disabled={submitting} className="w-full bg-blue-600 py-3 rounded-xl text-white font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Generate Invoice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 font-[Poppins]">Record Payment</h2>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <Input label="Amount Paid (₹)" type="number" required value={paymentForm.amount_paid} onChange={(v: string) => setPaymentForm({...paymentForm, amount_paid: v})} />
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Payment Method</label>
                <select 
                  value={paymentForm.payment_method} 
                  onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI / PhonePe / GPay</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Notes</label>
                <textarea 
                  value={paymentForm.notes} 
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
                  rows={2}
                  placeholder="Receipt number or other details..."
                />
              </div>
              <button disabled={submitting} className="w-full bg-green-600 py-3 rounded-xl text-white font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                Confirm Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', required = false, placeholder = '' }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{label}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition" />
    </div>
  )
}
