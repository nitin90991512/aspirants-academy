-- =============================================
-- 002: ENUMS
-- Aspirants Academy ERP
-- =============================================

-- User roles
create type user_role as enum ('admin', 'teacher', 'student', 'parent');

-- Gender
create type gender_type as enum ('male', 'female', 'other');

-- Attendance status
create type attendance_status as enum ('present', 'absent', 'late', 'half_day', 'holiday');

-- Fee status
create type fee_status as enum ('paid', 'pending', 'partial', 'overdue', 'waived');

-- Notice target audience
create type notice_target as enum ('all', 'students', 'parents', 'teachers', 'admin', 'class_specific');

-- Notice priority
create type notice_priority as enum ('normal', 'important', 'urgent', 'emergency');

-- Exam types
create type exam_type as enum ('unit_test', 'mid_term', 'final', 'weekly_test', 'navodaya_mock', 'assignment');

-- Test question types
create type question_type as enum ('mcq', 'true_false', 'short_answer', 'fill_blank');

-- Payment methods
create type payment_method as enum ('cash', 'upi', 'bank_transfer', 'razorpay', 'cheque');

-- Leave status
create type leave_status as enum ('pending', 'approved', 'rejected');

-- Day of week
create type day_of_week as enum ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
