'use client'

import { useState } from 'react'

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  const [error, setError] = useState(false)

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {/* 
          Note: We are using a circular container to match the official logo shape.
          Replace '/logo.png' with the actual official logo file in public folder.
      */}
      <div className="w-full h-full rounded-full overflow-hidden bg-white border border-gray-100 shadow-sm flex items-center justify-center">
        {!error ? (
          <img 
            src="/logo.png" 
            alt="Aspirants Academy Logo" 
            className="w-full h-full object-contain"
            onError={() => setError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 flex items-center justify-center text-white font-black text-lg select-none">
            A2
          </div>
        )}
      </div>
    </div>
  )
}
