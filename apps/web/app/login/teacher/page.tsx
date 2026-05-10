import LoginForm from '@/app/login/LoginForm'

export default function TeacherLogin() {
  return (
    <LoginForm 
      expectedRole="teacher" 
      portalName="Teacher Portal" 
      bannerImage="0236be8a-7f1b-4230-bd6b-77c888fdbf6c.jpg" 
    />
  )
}
