import LoginForm from '@/app/login/LoginForm'

export default function AdminLogin() {
  return (
    <LoginForm 
      expectedRole="admin" 
      portalName="Admin Portal" 
      bannerImage="15f5c671-c1e3-4654-900b-1ed072013fcb.jpg" 
    />
  )
}
