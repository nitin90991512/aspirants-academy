'use client'

import { useState, useEffect, useCallback } from 'react'
import { Banner } from '@/lib/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HeroBannerSliderProps {
  banners: Banner[]
}

const FALLBACK_BANNERS = [
  {
    id: '1',
    title: 'Aspirants Academy',
    subtitle: "Gandhinagar's Premier Coaching Institute",
    image_url: '',
    link_url: '#contact',
    gradient: 'from-blue-900 via-blue-800 to-indigo-900',
  },
  {
    id: '2',
    title: 'Navodaya Specialists',
    subtitle: '85% Success Rate in Navodaya Entrance Examinations',
    image_url: '',
    link_url: '#navodaya',
    gradient: 'from-indigo-900 via-purple-800 to-blue-900',
  },
  {
    id: '3',
    title: 'Excellence in Education',
    subtitle: 'Classes 6th to 12th | Expert Faculty | Regular Mock Tests',
    image_url: '',
    link_url: '#contact',
    gradient: 'from-slate-900 via-blue-900 to-slate-900',
  },
]

export default function HeroBannerSlider({ banners }: HeroBannerSliderProps) {
  const [current, setCurrent] = useState(0)
  const displayBanners = banners.length > 0 ? banners : null
  const slides = displayBanners || FALLBACK_BANNERS

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length])
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length)

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background */}
          {(slide as Banner).image_url ? (
            <img
              src={(slide as Banner).image_url}
              alt={(slide as Banner).title || 'Banner'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${(slide as typeof FALLBACK_BANNERS[0]).gradient || 'from-blue-900 to-blue-700'}`} />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-0 hero-pattern" />

          {/* Decorative dots */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-amber-300 text-sm font-medium">Navodaya Specialists | Gandhinagar</span>
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight font-[Poppins] mb-6 animate-fade-in-up">
                  {(slide as Banner).title || 'Aspirants'}
                  <span className="block gradient-text-gold">
                    Academy
                  </span>
                </h1>

                <p className="text-xl text-blue-100 mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  {(slide as Banner).subtitle || "Empowering students to achieve their dreams"}
                </p>

                <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <a
                    href={((slide as Banner).link_url) || '#contact'}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
                  >
                    Enroll Now
                  </a>
                  <a
                    href="tel:9265720004"
                    className="px-8 py-4 glass border border-white/30 text-white rounded-xl font-semibold transition-all hover:bg-white/20 flex items-center gap-2"
                  >
                    📞 Call Now
                  </a>
                </div>

                {/* Stats row */}
                <div className="flex gap-8 mt-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  {[
                    { value: '500+', label: 'Students' },
                    { value: '200+', label: 'Navodaya Selections' },
                    { value: '10+', label: 'Years' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="text-2xl font-black text-white font-[Poppins]">{stat.value}</div>
                      <div className="text-blue-300 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-full flex items-center justify-center text-white hover:bg-white/20 transition"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-full flex items-center justify-center text-white hover:bg-white/20 transition"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`transition-all rounded-full ${
                  idx === current ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
