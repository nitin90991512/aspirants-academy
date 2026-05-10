import Link from 'next/link'
import { GraduationCap, ShieldCheck, Users, User, ArrowRight } from 'lucide-react'
import Logo from '@/components/Logo'

export const metadata = {
  title: 'Login - Aspirants Academy',
  description: 'Select your portal to login',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 flex justify-center">
            <Logo className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Aspirant's Academy
          </h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">
            Please select your portal to continue signing in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Portal */}
          <Link href="/login/admin" className="group">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 h-full flex flex-col hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Portal</h2>
              <p className="text-gray-500 flex-1">Access the core ERP, manage students, teachers, and finances.</p>
              <div className="mt-6 flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                Sign In <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>

          {/* Teacher Portal */}
          <Link href="/login/teacher" className="group">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 h-full flex flex-col hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Teacher Portal</h2>
              <p className="text-gray-500 flex-1">Mark attendance, upload marks, assign homework, and view timetable.</p>
              <div className="mt-6 flex items-center text-orange-500 font-semibold text-sm group-hover:gap-2 transition-all">
                Sign In <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>

          {/* Parent Portal */}
          <Link href="/login/parent" className="group">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 h-full flex flex-col hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <User className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Parent Portal</h2>
              <p className="text-gray-500 flex-1">Track your child's academic progress, view attendance, and pay fees.</p>
              <div className="mt-6 flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                Sign In <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center text-sm text-gray-400">
          Not registered? Contact <span className="text-blue-600 font-medium">Nitin Sir — 9265720004</span>
        </div>
      </div>
    </div>
  )
}
