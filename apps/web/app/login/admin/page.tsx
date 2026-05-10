import { Suspense } from 'react'
import LoginForm from '@/app/login/LoginForm'

export default function AdminLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm 
        expectedRole="admin" 
        portalName="Admin Portal" 
        bannerImage="15f5c671-c1e3-4654-900b-1ed072013fcb.jpg" 
      />
    </Suspense>
  )
}
