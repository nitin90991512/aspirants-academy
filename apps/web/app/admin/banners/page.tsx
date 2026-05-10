'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Image as ImageIcon, Plus, Loader2, 
  X, Save, Trash2, Edit2, Layout
} from 'lucide-react'

interface Banner {
  id: string
  image_url: string
  title: string
  subtitle: string
  order_index: number
  is_active: boolean
}

export default function AdminBannersPage() {
  const supabase = createClient()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    order_index: 0,
    is_active: true,
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  async function fetchBanners() {
    setLoading(true)
    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('order_index', { ascending: true })
    
    if (data) setBanners(data)
    setLoading(false)
  }

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const { error: insertError } = await supabase.from('banners').insert([form])
      if (insertError) throw insertError

      setShowAddModal(false)
      setForm({ title: '', subtitle: '', image_url: '', order_index: 0, is_active: true })
      fetchBanners()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add banner')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    await supabase.from('banners').delete().eq('id', id)
    fetchBanners()
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('banners').update({ is_active: !currentStatus }).eq('id', id)
    fetchBanners()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[Poppins]">Home Banners</h1>
          <p className="text-gray-500 text-sm">Manage the sliding banners on the homepage hero section</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Banner</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="aspect-[21/9] relative group">
                <img 
                  src={banner.image_url} 
                  alt={banner.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 rounded text-[10px] font-bold uppercase">
                  Order: {banner.order_index}
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{banner.title || 'No Title'}</h3>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{banner.subtitle || 'No Subtitle'}</p>
                </div>
                <button 
                  onClick={() => toggleStatus(banner.id, banner.is_active)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                    banner.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {banner.is_active ? 'Active' : 'Hidden'}
                </button>
              </div>
            </div>
          ))}
          
          {banners.length === 0 && (
            <div className="col-span-full py-24 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <Layout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No banners added yet</p>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 font-[Poppins]">Add New Banner</h2>
            </div>

            <form onSubmit={handleAddBanner} className="p-6 space-y-4">
              <Input label="Title" value={form.title} onChange={(v: string) => setForm({...form, title: v})} placeholder="e.g. Empowering Your Dreams" />
              <Input label="Subtitle" value={form.subtitle} onChange={(v: string) => setForm({...form, subtitle: v})} placeholder="e.g. Best coaching for competitive exams" />
              <Input label="Image URL *" value={form.image_url} onChange={(v: string) => setForm({...form, image_url: v})} required placeholder="/banners/banner1.jpg" />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Order Index" type="number" value={form.order_index} onChange={(v: string) => setForm({...form, order_index: parseInt(v) || 0})} />
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={form.is_active} 
                      onChange={(e) => setForm({...form, is_active: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-xs font-bold text-gray-500 uppercase">Active</span>
                  </label>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Banner</span>
                </button>
              </div>
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
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
    </div>
  )
}