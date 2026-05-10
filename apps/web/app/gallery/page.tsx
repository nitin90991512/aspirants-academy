import { createClient } from '@/lib/supabase/server'
import PublicHeader from '@/components/public/PublicHeader'
import { Image as ImageIcon, Camera } from 'lucide-react'

export const metadata = {
  title: 'Gallery - Aspirants Academy',
}

async function getGalleryImages() {
  const supabase = await createClient()
  // Fetch from banners or a dedicated gallery table if we had one
  // For now, let's use all active banners as the gallery source
  const { data } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  return data || []
}

export default async function GalleryPage() {
  const images = await getGalleryImages()

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-2xl mb-4 shadow-sm">
            <Camera className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 font-[Poppins] mb-4">Our Campus Gallery</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore the vibrant life at Aspirants Academy. From science labs to sports meets, 
            see how we prepare students for excellence.
          </p>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((image) => (
            <div key={image.id} className="relative group overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-500">
              <img 
                src={`/banners/${image.image_url}`} 
                alt={image.title} 
                className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-6 flex flex-col justify-end">
                <h3 className="text-white font-bold text-lg">{image.title || 'Academy Life'}</h3>
                <p className="text-blue-100 text-sm line-clamp-2">{image.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No gallery images available yet.</p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">© 2026 Aspirants Academy Gandhinagar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
