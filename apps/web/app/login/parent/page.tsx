import LoginForm from '@/app/login/LoginForm'

export default function ParentLogin() {
  return (
    <LoginForm 
      expectedRole="parent" 
      portalName="Parent Portal" 
      bannerImage="07a6335c-473b-4d03-aaf5-193222119109.jpg" 
    />
  )
}
