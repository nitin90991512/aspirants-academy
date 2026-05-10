'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, Phone, Shield, Loader2, ArrowRight, CheckCircle } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/admin/dashboard'

  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userInfo, setUserInfo] = useState<{ name: string; role: string } | null>(null)

  const supabase = createClient()

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Phone number not registered. Contact Aspirants Academy.')
        setLoading(false)
        return
      }

      setUserInfo({ name: data.name, role: data.role })

      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: `+91${cleanPhone}`,
      })

      if (otpError) {
        console.warn('OTP error (dev mode):', otpError.message)
      }

      setStep('otp')
    } catch {
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const cleanPhone = phone.replace(/\D/g, '')

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: `+91${cleanPhone}`,
        token: otp,
        type: 'sms',
      })

      if (verifyError || !data.user) {
        setError('Invalid OTP. Please try again.')
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile) {
        const roleRoutes: Record<string, string> = {
          admin: '/admin/dashboard',
          teacher: '/teacher/dashboard',
          student: '/',
          parent: '/',
        }
        router.push(roleRoutes[profile.role] || redirectTo)
      } else {
        router.push(redirectTo)
      }
    } catch {
      setError('Verification failed. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side — Branding */}
      <div className="hidden lg:flex lg:w-1/2 hero-bg hero-pattern flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-100px] left-[-50px] w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>Aspirants Academy</h1>
              <p className="text-blue-300 text-sm">Gandhinagar, Gujarat</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Empowering<br />
            <span className="gradient-text-gold">Students</span> to<br />
            Reach Their<br />
            Dreams
          </h2>

          <p className="text-blue-200 text-lg leading-relaxed">
            Comprehensive coaching for Classes 6th–12th with specialized Navodaya Vidyalaya entrance preparation.
          </p>
        </div>

        <div className="relative space-y-4">
          {[
            '✅ 200+ Navodaya Selections',
            '✅ Expert faculty for all subjects',
            '✅ Regular mock tests & assessments',
            '✅ Parent-teacher communication portal',
          ].map((feature) => (
            <p key={feature} className="text-blue-100 text-sm font-medium">{feature}</p>
          ))}
          <div className="pt-4 border-t border-white/10">
            <p className="text-blue-300 text-sm">
              📞 Contact: <span className="text-white font-semibold">Nitin Sir — 9265720004</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Aspirants Academy</h1>
              <p className="text-gray-400 text-xs">Gandhinagar, Gujarat</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {step === 'phone' ? 'Welcome Back' : 'Verify OTP'}
            </h2>
            <p className="text-gray-500">
              {step === 'phone'
                ? 'Sign in to your Aspirants Academy account'
                : `We sent an OTP to +91 ${phone}`}
            </p>
          </div>

          {userInfo && step === 'otp' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800 text-sm">{userInfo.name}</p>
                <p className="text-green-600 text-xs capitalize">{userInfo.role} Account</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="phone">Mobile Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-gray-500 text-sm">🇮🇳 +91</span>
                    <div className="w-px h-4 bg-gray-200" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="9265720004"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full pl-24 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition text-sm"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Send OTP</span><ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="otp">Enter 6-digit OTP</label>
                <input
                  id="otp"
                  type="text"
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition text-center text-2xl font-bold tracking-[0.5em]"
                  required
                  autoFocus
                  maxLength={6}
                />
                <p className="text-xs text-gray-400 mt-2">💡 Development mode: Use OTP <strong>123456</strong></p>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Verify & Login</span><ArrowRight className="w-5 h-5" /></>}
              </button>
              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition"
              >
                ← Change Phone Number
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Your data is secured with end-to-end encryption</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-400 text-center">
            Not registered? Contact{' '}
            <a href="tel:9265720004" className="text-blue-600 font-semibold hover:underline">
              Nitin Sir — 9265720004
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
