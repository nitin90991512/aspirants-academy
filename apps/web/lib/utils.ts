import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  return phone
}

export function getAttendanceColor(percentage: number | null | undefined): string {
  if (percentage == null) return 'text-gray-500'
  if (percentage >= 85) return 'text-green-500'
  if (percentage >= 75) return 'text-yellow-500'
  return 'text-red-500'
}

export function getAttendanceBadgeColor(percentage: number | null | undefined): string {
  if (percentage == null) return 'bg-gray-100 text-gray-600'
  if (percentage >= 85) return 'bg-green-100 text-green-700'
  if (percentage >= 75) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

export function getFeeStatusColor(status: string): string {
  const colors: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    partial: 'bg-orange-100 text-orange-700',
    overdue: 'bg-red-100 text-red-700',
    waived: 'bg-blue-100 text-blue-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-600'
}

export function getNoticePriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    emergency: 'bg-red-500 text-white',
    urgent: 'bg-orange-500 text-white',
    important: 'bg-yellow-500 text-white',
    normal: 'bg-blue-500 text-white',
  }
  return colors[priority] || 'bg-gray-500 text-white'
}

export function getGradeColor(grade: string | null | undefined): string {
  if (!grade) return 'text-gray-500'
  if (grade === 'A+' || grade === 'A') return 'text-green-600 font-bold'
  if (grade === 'B+' || grade === 'B') return 'text-blue-600 font-bold'
  if (grade === 'C') return 'text-yellow-600 font-bold'
  if (grade === 'D') return 'text-orange-600 font-bold'
  if (grade === 'F') return 'text-red-600 font-bold'
  return 'text-gray-600'
}

export function generateAdmissionNumber(): string {
  const year = new Date().getFullYear().toString().slice(-2)
  const random = Math.floor(Math.random() * 9000 + 1000)
  return `AA${year}${random}`
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1] || ''
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function isToday(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(dateString)
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const CLASS_STANDARDS = [
  { value: '6', label: 'Class 6' },
  { value: '7', label: 'Class 7' },
  { value: '8', label: 'Class 8' },
  { value: '9', label: 'Class 9' },
  { value: '10', label: 'Class 10' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' },
]
