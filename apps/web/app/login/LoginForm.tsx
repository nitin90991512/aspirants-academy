'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, Shield, Loader2, ArrowRight } from 'lucide-react'
import Logo from '@/components/Logo'

interface LoginFormProps {
  expectedRole: string
  portalName: string
  bannerImage: string
}

export default function LoginForm({ expectedRole, portalName, bannerImage }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/admin/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()
  const [dynamicBanner, setDynamicBanner] = useState({
    image_url: bannerImage,
    stat_students: '500+',
    stat_selections: '200+',
    stat_years: '10+'
  })

  useEffect(() => {
    async function fetchBanner() {
      const { data: banners } = await supabase
        .from('banners')
        .select('image_url, stat_students, stat_selections, stat_years')
        .eq('is_active', true)
        .in('target_audience', [expectedRole, 'all'])

      if (banners && banners.length > 0) {
        const randomBanner = banners[Math.floor(Math.random() * banners.length)]
        setDynamicBanner(randomBanner)
      }
    }
    fetchBanner()
  }, [expectedRole, supabase])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError || !data.user) {
        setError('Invalid email or password.')
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (!profile || profile.role !== expectedRole) {
        await supabase.auth.signOut()
        setError(`Access denied. You do not have permission to access the ${portalName}.`)
        setLoading(false)
        return
      }

      const roleRoutes: Record<string, string> = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        parent: '/parent/dashboard',
        student: '/',
      }
      router.push(roleRoutes[profile.role] || redirectTo)
    } catch {
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side — Branding */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(to right, rgba(30, 58, 138, 0.9), rgba(30, 58, 138, 0.7)), url('/banners/${dynamicBanner.image_url}')` }}
      >
        <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-100px] left-[-50px] w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <Logo className="w-14 h-14" />
            <div>
              <h1 className="text-white font-bold text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>Aspirant's Academy</h1>
              <p className="text-blue-200 text-sm">Gandhinagar</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {portalName}
          </h2>

          <p className="text-blue-100 text-lg leading-relaxed">
            Smart Learning for CBSE Students.<br />
            Science • Commerce • Arts
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
          <div className="pt-8 grid grid-cols-3 gap-6 border-t border-white/10">
            <div>
              <div className="text-2xl font-bold text-white leading-none">{dynamicBanner.stat_students}</div>
              <div className="text-[10px] text-blue-200 uppercase tracking-wider mt-1">Students</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white leading-none">{dynamicBanner.stat_selections}</div>
              <div className="text-[10px] text-blue-200 uppercase tracking-wider mt-1">Navodaya Selections</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white leading-none">{dynamicBanner.stat_years}</div>
              <div className="text-[10px] text-blue-200 uppercase tracking-wider mt-1">Years</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <Logo className="w-12 h-12" />
            <div>
              <h1 className="font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Aspirant's Academy</h1>
              <p className="text-gray-400 text-xs">Gandhinagar</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Welcome Back
            </h2>
            <p className="text-gray-500">
              Sign in to your {portalName}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="admin@aspirantsacademy.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition text-sm"
                required
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all mt-6"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

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
