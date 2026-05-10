'use client'

import { 
  UserCheck, 
  BookOpen, 
  CreditCard, 
  Megaphone,
  TrendingUp,
  Clock,
  Calendar as CalendarIcon,
  ChevronRight,
  AlertCircle,
  Trophy
} from 'lucide-react'

export default function ParentDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Here is the latest update on Rahul's progress.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Present Today
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Overall Attendance",
            value: "92.5%",
            subtext: "15 absent days total",
            icon: UserCheck,
            color: "from-blue-500 to-blue-600",
            trend: "+2.1% from last month"
          },
          {
            label: "Pending Fees",
            value: "₹ 15,000",
            subtext: "Term 2 Tuition Fee",
            icon: CreditCard,
            color: "from-red-500 to-red-600",
            trend: "Due in 5 days",
            trendColor: "text-red-500"
          },
          {
            label: "Last Test Score",
            value: "88/100",
            subtext: "Mathematics Unit Test",
            icon: TrendingUp,
            color: "from-green-500 to-green-600",
            trend: "Top 10% in class"
          },
          {
            label: "Pending Homework",
            value: "2 Tasks",
            subtext: "Science, English",
            icon: BookOpen,
            color: "from-amber-500 to-amber-600",
            trend: "Due tomorrow"
          }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
            <div className="flex justify-between items-start mb-4 relative">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-sm`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="relative">
              <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <p className="text-xs text-gray-400 mb-3">{stat.subtext}</p>
              <div className={`text-xs font-medium ${stat.trendColor || 'text-green-600'} flex items-center gap-1`}>
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academics & Timetable */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Tests/Exams */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-[Poppins]">Upcoming Exams</h2>
                <p className="text-xs text-gray-500 mt-1">Next 30 days schedule</p>
              </div>
              <button className="text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="p-0">
              <div className="divide-y divide-gray-50">
                {[
                  { subject: "Science (Term 1)", date: "15 Nov 2026", time: "10:00 AM", syllabus: "Chapters 1 to 5" },
                  { subject: "Mathematics", date: "18 Nov 2026", time: "10:00 AM", syllabus: "Algebra & Geometry" },
                  { subject: "English Literature", date: "22 Nov 2026", time: "09:30 AM", syllabus: "Prose & Poetry Section A" }
                ].map((exam, i) => (
                  <div key={i} className="p-5 flex items-start gap-4 hover:bg-gray-50/50 transition">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex flex-col items-center justify-center flex-shrink-0 border border-amber-100">
                      <span className="text-xs font-bold uppercase">{exam.date.split(' ')[1]}</span>
                      <span className="text-lg font-black leading-none">{exam.date.split(' ')[0]}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900">{exam.subject}</h4>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {exam.time}
                      </p>
                      <p className="text-xs text-gray-600 mt-2 bg-gray-100 px-2 py-1 rounded inline-block">
                        Syllabus: {exam.syllabus}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navodaya Prep Highlights */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl shadow-sm overflow-hidden text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="p-6 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-[Poppins]">Navodaya Preparation</h3>
                  <p className="text-blue-200 text-xs">Target Year: 2027</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                  <div className="text-blue-200 text-xs mb-1">Mock Tests Taken</div>
                  <div className="text-2xl font-bold">12</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                  <div className="text-blue-200 text-xs mb-1">Avg. Score</div>
                  <div className="text-2xl font-bold">84%</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                  <div className="text-blue-200 text-xs mb-1">Mental Ability</div>
                  <div className="text-2xl font-bold text-green-400">Strong</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                  <div className="text-blue-200 text-xs mb-1">Arithmetic</div>
                  <div className="text-2xl font-bold text-amber-400">Average</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Notices & Alerts */}
        <div className="space-y-6">
          {/* Action Needed */}
          <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-red-900">Action Needed</h3>
            </div>
            <p className="text-sm text-red-700 mb-4">
              Term 2 Tuition fees of ₹15,000 is due on 15th Nov 2026.
            </p>
            <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition">
              Pay Now
            </button>
          </div>

          {/* Notice Board */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-[Poppins]">Notice Board</h2>
              </div>
              <button className="text-sm text-blue-600 font-semibold hover:text-blue-700">
                View All
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { title: "Diwali Holidays Announcement", date: "10 Nov 2026", type: "Holiday" },
                { title: "Parent Teacher Meeting", date: "08 Nov 2026", type: "Event" },
                { title: "Change in School Timings", date: "01 Nov 2026", type: "Notice" }
              ].map((notice, i) => (
                <div key={i} className="p-4 hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Megaphone className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 leading-tight">{notice.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{notice.type}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" /> {notice.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
