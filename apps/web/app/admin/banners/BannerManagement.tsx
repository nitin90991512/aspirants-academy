'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Image as ImageIcon, Trash2, CheckCircle2, XCircle, ExternalLink, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Banner {
  id: string
  title: string
  subtitle: string
  image_url: string
  target_audience: string
  is_active: boolean
  sort_order: number
  stat_students: string
  stat_selections: string
  stat_years: string
}

export default function BannerManagement({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState(initialBanners)
  const [loading, setLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    target_audience: 'all',
    stat_students: '500+',
    stat_selections: '200+',
    stat_years: '10+'
  })
  const router = useRouter()
  const supabase = createClient()

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('banners')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (!error) {
      setBanners(banners.map(b => b.id === id ? { ...b, is_active: !currentStatus } : b))
      router.refresh()
    }
  }

  const deleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return

    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id)

    if (!error) {
      setBanners(banners.filter(b => b.id !== id))
      router.refresh()
    }
  }

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase
      .from('banners')
      .insert([newBanner])
      .select()

    if (!error && data) {
      setBanners([...banners, data[0]])
      setIsAdding(false)
      setNewBanner({ 
        title: '', 
        subtitle: '', 
        image_url: '', 
        target_audience: 'all',
        stat_students: '500+',
        stat_selections: '200+',
        stat_years: '10+'
      })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Login Banners</h1>
          <p className="text-gray-500 text-sm">Manage background images for role-specific login portals.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          Add New Banner
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-md animate-fade-in-up">
          <h2 className="text-lg font-bold mb-4">Add New Banner</h2>
          <form onSubmit={handleAddBanner} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title (Optional)</label>
              <input 
                type="text" 
                value={newBanner.title}
                onChange={e => setNewBanner({...newBanner, title: e.target.value})}
                placeholder="e.g. Welcome Teachers"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subtitle (Optional)</label>
              <input 
                type="text" 
                value={newBanner.subtitle}
                onChange={e => setNewBanner({...newBanner, subtitle: e.target.value})}
                placeholder="e.g. Access your classroom portal"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-red-600">Image Filename *</label>
              <input 
                type="text" 
                required
                value={newBanner.image_url}
                onChange={e => setNewBanner({...newBanner, image_url: e.target.value})}
                placeholder="e.g. science-lab.jpg"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-[10px] text-gray-400">Must match a file in /public/banners/</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <select 
                value={newBanner.target_audience}
                onChange={e => setNewBanner({...newBanner, target_audience: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin Only</option>
                <option value="teacher">Teachers Only</option>
                <option value="parent">Parents Only</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Students Stat</label>
              <input 
                type="text" 
                value={newBanner.stat_students}
                onChange={e => setNewBanner({...newBanner, stat_students: e.target.value})}
                placeholder="e.g. 500+"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Selections Stat</label>
              <input 
                type="text" 
                value={newBanner.stat_selections}
                onChange={e => setNewBanner({...newBanner, stat_selections: e.target.value})}
                placeholder="e.g. 200+"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Years Stat</label>
              <input 
                type="text" 
                value={newBanner.stat_years}
                onChange={e => setNewBanner({...newBanner, stat_years: e.target.value})}
                placeholder="e.g. 10+"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Banner
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="aspect-video relative overflow-hidden bg-gray-100">
              <img 
                src={`/banners/${banner.image_url}`} 
                alt={banner.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Not+Found'
                }}
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`badge ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {banner.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="badge bg-blue-100 text-blue-700 capitalize">
                  {banner.target_audience}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-gray-900 mb-1">{banner.title || 'Untitled Banner'}</h3>
              <p className="text-xs text-gray-500 mb-4">{banner.subtitle || 'No subtitle provided'}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleStatus(banner.id, banner.is_active)}
                    className={`p-2 rounded-lg transition ${banner.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                    title={banner.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {banner.is_active ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => deleteBanner(banner.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-[10px] font-mono text-gray-400 truncate max-w-[120px]">
                  {banner.image_url}
                </div>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No banners found. Start by adding one!</p>
          </div>
        )}
      </div>
    </div>
  )
}
