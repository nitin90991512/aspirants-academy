import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import HeroBannerSlider from '@/components/public/HeroBannerSlider'
import AnnouncementTicker from '@/components/public/AnnouncementTicker'
import {
  Trophy, Users, BookOpen, Star, Target, CheckCircle2,
  MapPin, Phone, MessageSquare, Mail, ArrowRight, Calendar, Bell, Brain, Calculator, Languages
} from 'lucide-react'
import { Notice, Achievement, GalleryItem, WebsiteContent } from '@/lib/types'
import { formatDate, getNoticePriorityColor, timeAgo } from '@/lib/utils'

async function getHomePageData() {
  try {
    const supabase = await createClient()
    const now = new Date().toISOString()

    const [
      { data: banners },
      { data: notices },
      { data: announcements },
      { data: achievements },
      { data: gallery },
      { data: content },
    ] = await Promise.all([
      supabase.from('banners').select('*').eq('is_active', true).lte('display_from', now).order('sort_order').limit(5),
      supabase.from('notices').select('*').eq('is_published', true).in('target_audience', ['all', 'students', 'parents']).order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(5),
      supabase.from('announcements').select('*').eq('is_active', true).order('priority', { ascending: false }),
      supabase.from('achievements').select('*').eq('is_published', true).order('sort_order').limit(6),
      supabase.from('gallery').select('*').eq('is_published', true).order('sort_order').limit(12),
      supabase.from('website_content').select('*'),
    ])

    const contentMap = (content || []).reduce((acc: Record<string, WebsiteContent>, item: WebsiteContent) => {
      acc[item.section] = item
      return acc
    }, {})

    return { banners: banners || [], notices: notices || [], announcements: announcements || [], achievements: achievements || [], gallery: gallery || [], contentMap }
  } catch {
    return { banners: [], notices: [], announcements: [], achievements: [], gallery: [], contentMap: {} }
  }
}

const NOTICE_PRIORITY_STYLES: Record<string, string> = {
  emergency: 'notice-emergency',
  urgent: 'notice-urgent',
  important: 'notice-important',
  normal: 'notice-normal',
}

export default async function HomePage() {
  const { banners, notices, announcements, achievements, gallery, contentMap } = await getHomePageData()

  const heroContent = contentMap['hero']
  const navodayaContent = contentMap['navodaya']
  const statsContent = contentMap['stats']
  const contactContent = contentMap['contact']
  const stats = (statsContent?.metadata as Record<string, string>) || {}
  const contact = (contactContent?.metadata as Record<string, string>) || {}

  return (
    <main className="min-h-screen">
      <PublicHeader />

      {/* HERO SLIDER */}
      <HeroBannerSlider banners={banners} />

      {/* ANNOUNCEMENTS TICKER */}
      <AnnouncementTicker announcements={announcements} />

      {/* QUICK STATS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, value: stats.total_students || '500+', label: 'Happy Students', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: Trophy, value: stats.navodaya_selections || '200+', label: 'Navodaya Selections', color: 'text-amber-600', bg: 'bg-amber-50' },
              { icon: BookOpen, value: stats.classes || 'Class 6–12', label: 'Classes Covered', color: 'text-green-600', bg: 'bg-green-50' },
              { icon: Star, value: stats.years_of_excellence || '10+', label: 'Years of Excellence', color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((stat) => (
              <div key={stat.label} className="stat-card text-center hover-lift">
                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className={`text-3xl font-black ${stat.color} font-[Poppins] mb-1`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <BookOpen className="w-4 h-4" />
                About Aspirants Academy
              </div>
              <h2 className="text-4xl font-black text-gray-900 font-[Poppins] leading-tight mb-6">
                {contentMap['about']?.title || 'Shaping Futures Since 2015'}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {contentMap['about']?.content || 'Aspirants Academy is a leading coaching institute in Gandhinagar, Gujarat, specializing in classes 6th to 12th with a special focus on Navodaya Vidyalaya entrance preparation. Under the guidance of Nitin Sir, we have helped hundreds of students achieve their dreams.'}
              </p>
              <div className="space-y-3">
                {[
                  'Expert faculty with 10+ years of experience',
                  'Structured curriculum aligned with board exams',
                  'Regular mock tests and progress tracking',
                  'Personal attention with small batch sizes',
                  'Parent-teacher communication portal',
                ].map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
              <a href="#contact" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5">
                Enquire Now <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            {/* Right side — Info cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Target, title: 'Goal-Oriented', desc: 'Targeted preparation for board exams and competitive entrance tests', color: 'from-blue-500 to-blue-600' },
                { icon: Brain, title: 'Expert Guidance', desc: 'Experienced teachers with deep subject knowledge and teaching skills', color: 'from-purple-500 to-purple-600' },
                { icon: BookOpen, title: 'Rich Study Material', desc: 'Comprehensive notes, practice sheets, and previous year papers', color: 'from-green-500 to-green-600' },
                { icon: Trophy, title: 'Proven Results', desc: '200+ Navodaya selections and consistently strong board exam scores', color: 'from-amber-500 to-amber-600' },
              ].map((card, i) => (
                <div key={card.title} className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover-lift animate-fade-in-up`} style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NOTICE BOARD */}
      <section id="notices" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 rounded-full px-4 py-1.5 text-sm font-medium mb-3">
                <Bell className="w-4 h-4" />
                Live Notice Board
              </div>
              <h2 className="text-3xl font-black text-gray-900 font-[Poppins]">Latest Notices</h2>
            </div>
            <a href="/notices" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {notices.length > 0 ? (
            <div className="space-y-3">
              {notices.map((notice: Notice) => (
                <div key={notice.id} className={`rounded-xl p-4 ${NOTICE_PRIORITY_STYLES[notice.priority] || 'notice-normal'} ${notice.is_pinned ? 'notice-pinned' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {notice.is_pinned && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">📌 Pinned</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getNoticePriorityColor(notice.priority)}`}>
                          {notice.priority.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notice.content}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap mt-1">{timeAgo(notice.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No notices posted yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* NAVODAYA SPECIAL SECTION */}
      <section id="navodaya" className="py-20 navodaya-bg text-white relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 rounded-full px-4 py-1.5 text-sm font-medium text-amber-300 mb-6">
              <Trophy className="w-4 h-4" />
              Navodaya Vidyalaya Specialist
            </div>
            <h2 className="text-4xl font-black font-[Poppins] mb-6">
              {navodayaContent?.title || 'Your Child\'s Gateway to Premier Education'}
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed">
              {navodayaContent?.content || 'Our specialized Navodaya Vidyalaya entrance preparation program has an exceptional success rate. We cover all sections with proven teaching methods and regular mock tests.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Brain, title: 'Mental Ability', desc: 'Pattern recognition, analogies, and logical reasoning — the most critical section of Navodaya exam', color: 'from-blue-400 to-blue-500' },
              { icon: Calculator, title: 'Arithmetic', desc: 'Number systems, fractions, LCM/HCF, geometry and all topics with shortcuts and tricks', color: 'from-green-400 to-green-500' },
              { icon: Languages, title: 'Language Test', desc: 'Passage comprehension, grammar, and vocabulary in Hindi, English, and regional language', color: 'from-purple-400 to-purple-500' },
            ].map((section) => (
              <div key={section.title} className="glass rounded-2xl p-6 hover-lift">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4`}>
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{section.title}</h3>
                <p className="text-blue-200 text-sm leading-relaxed">{section.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 mb-12">
            {[
              { value: '85%', label: 'Success Rate', sub: 'in Navodaya entrance' },
              { value: '4+', label: 'Mock Tests/Month', sub: 'full pattern tests' },
              { value: '200+', label: 'Students Selected', sub: 'across 10 years' },
            ].map((stat) => (
              <div key={stat.label} className="text-center glass rounded-2xl p-6">
                <div className="text-4xl font-black text-amber-400 font-[Poppins] mb-1">{stat.value}</div>
                <div className="text-white font-semibold">{stat.label}</div>
                <div className="text-blue-300 text-sm">{stat.sub}</div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a href="#contact" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-bold text-lg transition-all hover:shadow-xl hover:-translate-y-0.5">
              Enroll for Navodaya Batch <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section id="achievements" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Trophy className="w-4 h-4" />
              Our Achievers
            </div>
            <h2 className="text-4xl font-black text-gray-900 font-[Poppins]">Student Achievements</h2>
            <p className="text-gray-500 mt-3 text-lg">Proud of every student who dared to dream and worked hard</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(achievements.length > 0 ? achievements : [
              { id: '1', student_name: 'Priya Sharma', achievement_text: 'Selected in Navodaya Vidyalaya, Gandhinagar — Class 6', year: 2024, class_standard: 5 },
              { id: '2', student_name: 'Rahul Patel', achievement_text: 'All India Rank 45 in Navodaya Entrance Exam', year: 2024, class_standard: 5 },
              { id: '3', student_name: 'Anjali Mehta', achievement_text: 'First in District — Class 10 Board Exams (98.5%)', year: 2024, class_standard: 10 },
              { id: '4', student_name: 'Karan Shah', achievement_text: 'Selected in Navodaya Vidyalaya, Mehsana', year: 2023, class_standard: 5 },
              { id: '5', student_name: 'Deepa Joshi', achievement_text: 'Science Olympiad State Gold Medalist', year: 2024, class_standard: 8 },
              { id: '6', student_name: 'Amit Trivedi', achievement_text: 'JEE Advanced Qualifier — IIT Dream Fulfilled', year: 2024, class_standard: 12 },
            ] as Achievement[]).map((achievement: Achievement, i) => (
              <div key={achievement.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover-lift animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                    {achievement.image_url ? (
                      <img src={achievement.image_url} alt={achievement.student_name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <Trophy className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{achievement.student_name}</h3>
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">{achievement.achievement_text}</p>
                    {achievement.year && (
                      <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {achievement.year}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      {gallery.length > 0 && (
        <section id="gallery" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-gray-900 font-[Poppins]">Gallery</h2>
              <p className="text-gray-500 mt-3">Moments from Aspirants Academy</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((item: GalleryItem) => (
                <div key={item.id} className="aspect-square rounded-xl overflow-hidden hover-lift group">
                  <img
                    src={item.image_url}
                    alt={item.title || 'Gallery'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left — Contact Info */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Phone className="w-4 h-4" />
                Get In Touch
              </div>
              <h2 className="text-4xl font-black text-gray-900 font-[Poppins] mb-6">
                Ready to Enroll?<br />
                <span className="text-blue-600">Let's Talk!</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Contact us today to learn more about our programs, fee structure, and available batches. Admissions are open for all classes.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Phone, label: 'Call / WhatsApp', value: '+91 9265720004 (Nitin Sir)', href: 'tel:9265720004', color: 'bg-blue-100 text-blue-600' },
                  { icon: MessageSquare, label: 'WhatsApp', value: 'Chat on WhatsApp', href: 'https://wa.me/919265720004', color: 'bg-green-100 text-green-600' },
                  { icon: MapPin, label: 'Address', value: contact.address || 'Aspirants Academy, Gandhinagar, Gujarat – 382010', href: '#', color: 'bg-red-100 text-red-600' },
                ].map((item) => (
                  <a key={item.label} href={item.href} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition group">
                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-medium">{item.label}</div>
                      <div className="font-semibold text-gray-900">{item.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Right — Enquiry Form */}
            <EnquiryForm />
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}

function EnquiryForm() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <h3 className="text-2xl font-bold text-gray-900 font-[Poppins] mb-6">Send an Enquiry</h3>
      <form action="/api/enquiry" method="POST" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Parent/Guardian Name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="10-digit number"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student's Class</label>
            <select
              name="student_class"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
            >
              <option value="">Select Class</option>
              {[6,7,8,9,10,11,12].map(c => <option key={c} value={`Class ${c}`}>Class {c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            name="message"
            rows={4}
            placeholder="Tell us about your child's needs, preferred timing, etc."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition resize-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" name="is_navodaya_interest" id="navodaya" className="w-4 h-4 rounded text-blue-600" />
          <label htmlFor="navodaya" className="text-sm text-gray-600">Interested in Navodaya entrance preparation</label>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          Submit Enquiry <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-xs text-gray-400 text-center">
          We'll contact you within 24 hours. 📞 Nitin Sir: 9265720004
        </p>
      </form>
    </div>
  )
}
