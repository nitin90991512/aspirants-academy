// =============================================
// Aspirants Academy — Shared TypeScript Types
// =============================================

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent'
export type GenderType = 'male' | 'female' | 'other'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'holiday'
export type FeeStatus = 'paid' | 'pending' | 'partial' | 'overdue' | 'waived'
export type NoticeTarget = 'all' | 'students' | 'parents' | 'teachers' | 'admin' | 'class_specific'
export type NoticePriority = 'normal' | 'important' | 'urgent' | 'emergency'
export type ExamType = 'unit_test' | 'mid_term' | 'final' | 'weekly_test' | 'navodaya_mock' | 'assignment'
export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'fill_blank'
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'razorpay' | 'cheque'
export type LeaveStatus = 'pending' | 'approved' | 'rejected'
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone: string
  email?: string
  avatar_url?: string
  date_of_birth?: string
  gender?: GenderType
  address?: string
  city: string
  state: string
  is_active: boolean
  fcm_token?: string
  whatsapp_opt_in: boolean
  sms_opt_in: boolean
  preferred_language: string
  created_at: string
  updated_at: string
}

export interface AcademicYear {
  id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
}

export interface Class {
  id: string
  name: string
  standard: number
  section?: string
  academic_year_id?: string
  class_teacher_id?: string
  room_number?: string
  capacity: number
  is_active: boolean
  created_at: string
  academic_years?: AcademicYear
  profiles?: Profile
}

export interface Batch {
  id: string
  name: string
  class_id?: string
  timing_start?: string
  timing_end?: string
  days?: string[]
  max_students: number
  is_active: boolean
  created_at: string
}

export interface Subject {
  id: string
  name: string
  code?: string
  applicable_classes?: number[]
  is_navodaya_subject: boolean
  max_marks: number
  passing_marks: number
  is_active: boolean
  created_at: string
}

export interface Student {
  id: string
  profile_id: string
  admission_number: string
  roll_number?: string
  class_id?: string
  batch_id?: string
  academic_year_id?: string
  admission_date: string
  father_name?: string
  mother_name?: string
  guardian_name?: string
  is_navodaya_aspirant: boolean
  navodaya_target_year?: number
  previous_school?: string
  blood_group?: string
  medical_notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
  classes?: Class
  batches?: Batch
  academic_years?: AcademicYear
}

export interface StudentFullView {
  id: string
  admission_number: string
  roll_number?: string
  is_navodaya_aspirant: boolean
  navodaya_target_year?: number
  father_name?: string
  mother_name?: string
  admission_date: string
  blood_group?: string
  student_is_active: boolean
  full_name: string
  phone: string
  email?: string
  avatar_url?: string
  gender?: GenderType
  date_of_birth?: string
  address?: string
  class_name?: string
  standard?: number
  section?: string
  batch_name?: string
  academic_year?: string
  academic_year_id?: string
}

export interface Teacher {
  id: string
  profile_id: string
  employee_id?: string
  qualification?: string
  specialization?: string[]
  joining_date?: string
  salary_amount?: number
  salary_type: string
  bank_account_number?: string
  bank_ifsc?: string
  is_active: boolean
  created_at: string
  profiles?: Profile
}

export interface Attendance {
  id: string
  student_id: string
  class_id: string
  date: string
  status: AttendanceStatus
  check_in_time?: string
  check_out_time?: string
  marked_by?: string
  remarks?: string
  parent_notified: boolean
  notification_sent_at?: string
  created_at: string
  updated_at: string
  students?: Student
  profiles?: Profile
}

export interface AttendanceSummary {
  id: string
  student_id: string
  month: number
  year: number
  total_days: number
  present_days: number
  absent_days: number
  late_days: number
  percentage: number
  updated_at: string
}

export interface Exam {
  id: string
  name: string
  exam_type: ExamType
  class_id?: string
  academic_year_id?: string
  start_date?: string
  end_date?: string
  is_published: boolean
  created_by?: string
  created_at: string
  classes?: Class
}

export interface ExamResult {
  id: string
  exam_id: string
  exam_schedule_id?: string
  student_id: string
  subject_id: string
  marks_obtained?: number
  max_marks: number
  is_absent: boolean
  grade?: string
  remarks?: string
  entered_by?: string
  created_at: string
  updated_at: string
  subjects?: Subject
  students?: Student
}

export interface FeeInvoice {
  id: string
  invoice_number?: string
  student_id: string
  fee_structure_id?: string
  academic_year_id?: string
  amount: number
  late_fee: number
  discount: number
  discount_reason?: string
  total_amount: number
  status: FeeStatus
  due_date: string
  month?: number
  year?: number
  created_at: string
  students?: Student
}

export interface FeePayment {
  id: string
  invoice_id: string
  student_id: string
  amount_paid: number
  payment_method: PaymentMethod
  transaction_id?: string
  razorpay_payment_id?: string
  receipt_number?: string
  paid_at: string
  collected_by?: string
  notes?: string
  created_at: string
}

export interface Notice {
  id: string
  title: string
  content: string
  target_audience: NoticeTarget
  target_class_ids?: string[]
  priority: NoticePriority
  attachment_urls?: string[]
  is_published: boolean
  publish_at?: string
  expires_at?: string
  created_by?: string
  view_count: number
  is_pinned: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Banner {
  id: string
  title?: string
  subtitle?: string
  image_url: string
  link_url?: string
  target_audience: NoticeTarget
  is_active: boolean
  sort_order: number
  display_from: string
  display_till?: string
  created_by?: string
  created_at: string
}

export interface Announcement {
  id: string
  text: string
  is_active: boolean
  priority: number
  created_by?: string
  expires_at?: string
  created_at: string
}

export interface Achievement {
  id: string
  student_name: string
  achievement_text: string
  image_url?: string
  year?: number
  class_standard?: number
  is_published: boolean
  sort_order: number
  created_at: string
}

export interface GalleryItem {
  id: string
  title?: string
  image_url: string
  category?: string
  is_published: boolean
  sort_order: number
  created_by?: string
  created_at: string
}

export interface WebsiteContent {
  id: string
  section: string
  title?: string
  subtitle?: string
  content?: string
  metadata?: Record<string, unknown>
  updated_by?: string
  updated_at: string
}

export interface Homework {
  id: string
  title: string
  description?: string
  class_id?: string
  batch_id?: string
  subject_id?: string
  teacher_id?: string
  assigned_date: string
  due_date: string
  attachment_urls?: string[]
  is_active: boolean
  created_at: string
  subjects?: Subject
  classes?: Class
  teachers?: Teacher
}

export interface OnlineTest {
  id: string
  title: string
  description?: string
  class_id?: string
  subject_id?: string
  created_by?: string
  duration_minutes: number
  total_marks?: number
  passing_marks?: number
  negative_marking: boolean
  negative_marks_per_wrong: number
  shuffle_questions: boolean
  shuffle_options: boolean
  is_navodaya_style: boolean
  scheduled_start?: string
  scheduled_end?: string
  is_published: boolean
  max_attempts: number
  show_answers_after: boolean
  show_leaderboard: boolean
  created_at: string
}

export interface Enquiry {
  id: string
  name: string
  phone: string
  email?: string
  student_class?: string
  message?: string
  is_navodaya_interest: boolean
  status: string
  notes?: string
  created_at: string
}

// Dashboard types
export interface DashboardStats {
  total_students: number
  total_teachers: number
  total_classes: number
  todays_present: number
  todays_absent: number
  todays_attendance_percentage: number
  fees_collected_this_month: number
  fees_pending_total: number
  active_notices: number
  upcoming_exams: number
}

export interface AttendancePercentageView {
  student_id: string
  full_name: string
  class_name?: string
  present_count: number
  absent_count: number
  late_count: number
  total_count: number
  percentage: number
}

export interface PendingFeesView {
  invoice_id: string
  invoice_number?: string
  total_amount: number
  due_date: string
  status: FeeStatus
  month?: number
  year?: number
  student_name: string
  student_phone: string
  class_name?: string
  student_id: string
  admission_number: string
}
