import { createClient } from '@/lib/supabase/server'
import {
  Users, UserCheck, CreditCard, Bell, TrendingUp, TrendingDown,
  BookOpen, Trophy, AlertCircle, CheckCircle, Clock, BarChart3
} from 'lucide-react'
import { formatCurrency, getAttendanceBadgeColor } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().slice(0, 10)
    const thisMonth = new Date().getMonth() + 1
    const thisYear = new Date().getFullYear()

    const [
      { count: totalStudents },
      { count: totalTeachers },
      { count: totalClasses },
      { data: todayAttendance },
      { data: pendingFees },
      { data: recentPayments },
      { data: activeNotices },
      { data: upcomingExams },
      { data: lowAttendance },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('classes').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('attendance').select('status').eq('date', today),
      supabase.from('pending_fees_view').select('total_amount').limit(100),
      supabase.from('fee_payments').select('amount_paid, paid_at, students(profiles(full_name))').order('paid_at', { ascending: false }).limit(5),
      supabase.from('notices').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('exams').select('name, start_date, exam_type, classes(name)').eq('is_published', false).gte('start_date', today).lte('start_date', new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)).limit(3),
      supabase.from('attendance_percentage_view').select('*').lt('percentage', 75).limit(5),
    ])

    const presentCount = (todayAttendance || []).filter((a: { status: string }) => a.status === 'present').length
    const absentCount = (todayAttendance || []).filter((a: { status: string }) => a.status === 'absent').length
    const totalMarked = (todayAttendance || []).length
    const attendancePct = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0

    const pendingTotal = (pendingFees || []).reduce((sum: number, f: { pending_amount: number }) => sum + (f.pending_amount || 0), 0)

    return {
      totalStudents: totalStudents || 0,
      totalTeachers: totalTeachers || 0,
      totalClasses: totalClasses || 0,
      presentCount,
      absentCount,
      totalMarked,
      attendancePct,
      pendingTotal,
      recentPayments: recentPayments || [],
      activeNotices: activeNotices || 0,
      upcomingExams: upcomingExams || [],
      lowAttendance: lowAttendance || [],
    }
  } catch (err) {
    console.error('Dashboard data error:', err)
    return {
      totalStudents: 0, totalTeachers: 0, totalClasses: 0,
      presentCount: 0, absentCount: 0, totalMarked: 0, attendancePct: 0,
      pendingTotal: 0, recentPayments: [], activeNotices: 0, upcomingExams: [], lowAttendance: [],
    }
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  const statCards = [
    {
      title: 'Total Students',
      value: data.totalStudents,
      sub: `${data.presentCount} present today`,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      href: '/admin/students',
    },
    {
      title: "Today's Attendance",
      value: `${data.attendancePct}%`,
      sub: `${data.presentCount} present / ${data.absentCount} absent`,
      icon: UserCheck,
      color: data.attendancePct >= 85 ? 'from-green-500 to-green-600' : data.attendancePct >= 75 ? 'from-yellow-500 to-yellow-600' : 'from-red-500 to-red-600',
      bg: data.attendancePct >= 85 ? 'bg-green-50' : data.attendancePct >= 75 ? 'bg-yellow-50' : 'bg-red-50',
      text: data.attendancePct >= 85 ? 'text-green-600' : data.attendancePct >= 75 ? 'text-yellow-600' : 'text-red-600',
      href: '/admin/attendance',
    },
    {
      title: 'Pending Fees',
      value: formatCurrency(data.pendingTotal),
      sub: 'Total dues outstanding',
      icon: CreditCard,
      color: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      href: '/admin/fees',
    },
    {
      title: 'Active Notices',
      value: data.activeNotices,
      sub: `${data.totalClasses} active classes`,
      icon: Bell,
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      href: '/admin/notices',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/attendance" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">
            Mark Attendance
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.title} href={card.href} className="stat-card group hover-lift block">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-6 h-6 ${card.text}`} />
              </div>
              <div className={`w-8 h-8 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center opacity-70`}>
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className={`text-3xl font-black ${card.text} font-[Poppins] mb-1`}>{card.value}</div>
            <div className="text-sm font-semibold text-gray-700">{card.title}</div>
            <div className="text-xs text-gray-400 mt-0.5">{card.sub}</div>
          </Link>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attendance Progress */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-500" />
            Today's Attendance
          </h3>

          {data.totalMarked === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Not marked yet today</p>
              <Link href="/admin/attendance" className="text-blue-600 text-sm font-medium hover:underline mt-1 inline-block">
                Mark Now →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Present</span>
                <span className="font-semibold text-green-600">{data.presentCount}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${data.totalMarked > 0 ? (data.presentCount / data.totalMarked) * 100 : 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Absent</span>
                <span className="font-semibold text-red-600">{data.absentCount}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-red-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${data.totalMarked > 0 ? (data.absentCount / data.totalMarked) * 100 : 0}%` }}
                />
              </div>
              <div className={`text-center p-3 rounded-xl ${getAttendanceBadgeColor(data.attendancePct)}`}>
                <span className="font-bold text-lg">{data.attendancePct}%</span>
                <span className="text-sm ml-1">overall attendance</span>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            Upcoming Exams (7 days)
          </h3>
          {data.upcomingExams.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No upcoming exams</p>
              <Link href="/admin/exams" className="text-blue-600 text-sm font-medium hover:underline mt-1 inline-block">
                Create Exam →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.upcomingExams.map((exam: unknown) => {
                const e = exam as { name: string; start_date: string; exam_type: string; classes?: { name: string } }
                return (
                <div key={e.name} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{e.name}</div>
                    <div className="text-xs text-gray-500">{e.start_date} • {e.classes?.name}</div>
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Low Attendance Alert */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Low Attendance Alert
          </h3>
          {data.lowAttendance.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">All students above 75%</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.lowAttendance.map((student: { student_id: string; full_name: string; percentage: number; class_name?: string }) => (
                <div key={student.student_id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{student.full_name}</div>
                    <div className="text-xs text-gray-500">{student.class_name}</div>
                  </div>
                  <span className="text-sm font-bold text-red-600">{student.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-500" />
            Recent Payments
          </h3>
          <Link href="/admin/fees" className="text-sm text-blue-600 hover:underline">
            View all →
          </Link>
        </div>
        {data.recentPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No payments recorded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.map((payment: unknown, i: number) => {
                  const p = payment as { amount_paid: number; paid_at: string; students?: { profiles?: { full_name?: string } } }
                  return (
                  <tr key={i}>
                    <td className="font-medium text-gray-900">{p.students?.profiles?.full_name || '—'}</td>
                    <td className="font-semibold text-green-600">{formatCurrency(p.amount_paid)}</td>
                    <td className="text-gray-500">{new Date(p.paid_at).toLocaleDateString('en-IN')}</td>
                    <td><span className="badge bg-green-100 text-green-700">Paid</span></td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/admin/students?action=add', label: 'Add Student', icon: Users },
            { href: '/admin/attendance', label: 'Mark Attendance', icon: UserCheck },
            { href: '/admin/fees?action=collect', label: 'Collect Fees', icon: CreditCard },
            { href: '/admin/notices?action=create', label: 'Post Notice', icon: Bell },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 transition text-sm font-semibold"
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
