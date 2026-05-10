-- =============================================
-- 011: ROW LEVEL SECURITY (RLS)
-- Aspirants Academy ERP
-- Run LAST after all tables are created
-- =============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table students enable row level security;
alter table parents enable row level security;
alter table student_parents enable row level security;
alter table teachers enable row level security;
alter table classes enable row level security;
alter table batches enable row level security;
alter table subjects enable row level security;
alter table academic_years enable row level security;
alter table attendance enable row level security;
alter table attendance_summary enable row level security;
alter table exam_results enable row level security;
alter table exams enable row level security;
alter table exam_schedule enable row level security;
alter table exam_rankings enable row level security;
alter table fee_invoices enable row level security;
alter table fee_payments enable row level security;
alter table fee_structures enable row level security;
alter table notices enable row level security;
alter table notice_reads enable row level security;
alter table banners enable row level security;
alter table announcements enable row level security;
alter table messages enable row level security;
alter table homework enable row level security;
alter table online_tests enable row level security;
alter table test_attempts enable row level security;
alter table test_answers enable row level security;
alter table timetable enable row level security;
alter table study_materials enable row level security;
alter table student_remarks enable row level security;
alter table gallery enable row level security;
alter table achievements enable row level security;
alter table website_content enable row level security;
alter table enquiries enable row level security;
alter table notification_log enable row level security;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================
create or replace function get_user_role()
returns user_role as $$
  select role from profiles where id = auth.uid()
$$ language sql security definer stable;

create or replace function is_admin()
returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$ language sql security definer stable;

create or replace function is_teacher()
returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
$$ language sql security definer stable;

create or replace function get_student_id()
returns uuid as $$
  select s.id from students s where s.profile_id = auth.uid()
$$ language sql security definer stable;

create or replace function get_teacher_id()
returns uuid as $$
  select t.id from teachers t where t.profile_id = auth.uid()
$$ language sql security definer stable;

create or replace function get_parent_student_ids()
returns uuid[] as $$
  select array_agg(sp.student_id) 
  from student_parents sp
  join parents pa on sp.parent_id = pa.id
  where pa.profile_id = auth.uid()
$$ language sql security definer stable;

-- =============================================
-- PROFILES POLICIES
-- =============================================
create policy "Users read own profile"
  on profiles for select using (id = auth.uid());

create policy "Admin read all profiles"
  on profiles for select using (is_admin());

create policy "Admin manage profiles"
  on profiles for all using (is_admin());

create policy "Users update own profile"
  on profiles for update using (id = auth.uid());

-- =============================================
-- PUBLIC READ POLICIES (no auth required)
-- =============================================

-- Banners public read
create policy "Banners public read"
  on banners for select using (is_active = true);

-- Announcements public read
create policy "Announcements public read"
  on announcements for select using (is_active = true);

-- Achievements public read
create policy "Achievements public read"
  on achievements for select using (is_published = true);

-- Gallery public read
create policy "Gallery public read"
  on gallery for select using (is_published = true);

-- Website content public read
create policy "Website content public read"
  on website_content for select using (true);

-- Subjects public read
create policy "Subjects public read"
  on subjects for select using (is_active = true);

-- Academic years public read
create policy "Academic years public read"
  on academic_years for select using (true);

-- =============================================
-- STUDENTS POLICIES
-- =============================================
create policy "Student view own record"
  on students for select using (profile_id = auth.uid());

create policy "Parent view children"
  on students for select using (id = any(get_parent_student_ids()));

create policy "Teacher view class students"
  on students for select using (
    exists (
      select 1 from teachers t
      join teacher_class_assignments tca on t.id = tca.teacher_id
      where t.profile_id = auth.uid()
      and tca.class_id = students.class_id
    )
  );

create policy "Admin full student access"
  on students for all using (is_admin());

-- =============================================
-- ATTENDANCE POLICIES
-- =============================================
create policy "Student view own attendance"
  on attendance for select using (student_id = get_student_id());

create policy "Parent view children attendance"
  on attendance for select using (student_id = any(get_parent_student_ids()));

create policy "Teacher view class attendance"
  on attendance for select using (
    exists (
      select 1 from teachers t
      join teacher_class_assignments tca on t.id = tca.teacher_id
      where t.profile_id = auth.uid()
      and tca.class_id = attendance.class_id
    )
  );

create policy "Teacher mark attendance"
  on attendance for insert with check (marked_by = auth.uid() and is_teacher());

create policy "Teacher update own marked attendance"
  on attendance for update using (marked_by = auth.uid());

create policy "Admin full attendance access"
  on attendance for all using (is_admin());

-- Attendance summary
create policy "Student view own summary"
  on attendance_summary for select using (student_id = get_student_id());

create policy "Parent view children summary"
  on attendance_summary for select using (student_id = any(get_parent_student_ids()));

create policy "Admin teacher view all summaries"
  on attendance_summary for select using (is_admin() or is_teacher());

-- =============================================
-- EXAM RESULTS POLICIES
-- =============================================
create policy "Student view own published results"
  on exam_results for select using (
    student_id = get_student_id() and
    exists (select 1 from exams e where e.id = exam_id and e.is_published = true)
  );

create policy "Parent view children published results"
  on exam_results for select using (
    student_id = any(get_parent_student_ids()) and
    exists (select 1 from exams e where e.id = exam_id and e.is_published = true)
  );

create policy "Teacher enter marks"
  on exam_results for insert with check (entered_by = auth.uid() and is_teacher());

create policy "Teacher update marks"
  on exam_results for update using (entered_by = auth.uid());

create policy "Admin full results access"
  on exam_results for all using (is_admin());

-- Exams (schedule visibility)
create policy "Published exams visible to students parents"
  on exams for select using (
    is_published = true or is_admin() or is_teacher()
  );

-- =============================================
-- FEE INVOICES POLICIES
-- =============================================
create policy "Student view own invoices"
  on fee_invoices for select using (student_id = get_student_id());

create policy "Parent view children invoices"
  on fee_invoices for select using (student_id = any(get_parent_student_ids()));

create policy "Admin full fees access"
  on fee_invoices for all using (is_admin());

create policy "Admin full payment access"
  on fee_payments for all using (is_admin());

create policy "Student view own payments"
  on fee_payments for select using (student_id = get_student_id());

create policy "Parent view children payments"
  on fee_payments for select using (student_id = any(get_parent_student_ids()));

-- Fee structures (admin + teachers can read)
create policy "Fee structures read"
  on fee_structures for select using (is_admin() or is_teacher());

create policy "Admin manage fee structures"
  on fee_structures for all using (is_admin());

-- =============================================
-- NOTICES POLICIES
-- =============================================
create policy "Published notices for all"
  on notices for select using (
    is_published = true and (
      target_audience = 'all' or
      (target_audience = 'students' and get_user_role() = 'student') or
      (target_audience = 'parents' and get_user_role() = 'parent') or
      (target_audience = 'teachers' and get_user_role() = 'teacher') or
      is_admin()
    )
  );

create policy "Admin manage notices"
  on notices for all using (is_admin());

create policy "Teacher create notices"
  on notices for insert with check (
    is_teacher() and target_audience in ('students', 'class_specific')
  );

create policy "Notice reads own"
  on notice_reads for all using (user_id = auth.uid());

-- =============================================
-- MESSAGES POLICIES
-- =============================================
create policy "Users see own messages"
  on messages for select using (sender_id = auth.uid() or receiver_id = auth.uid());

create policy "Users send messages"
  on messages for insert with check (sender_id = auth.uid());

-- =============================================
-- HOMEWORK POLICIES
-- =============================================
create policy "Students see class homework"
  on homework for select using (
    class_id in (select class_id from students where profile_id = auth.uid()) or
    is_admin() or is_teacher()
  );

create policy "Parents see children homework"
  on homework for select using (
    class_id in (
      select s.class_id from students s 
      where s.id = any(get_parent_student_ids())
    )
  );

create policy "Teacher manage homework"
  on homework for all using (
    teacher_id = get_teacher_id() or is_admin()
  );

-- =============================================
-- ONLINE TESTS POLICIES
-- =============================================
create policy "Published tests visible"
  on online_tests for select using (
    is_published = true or is_admin() or is_teacher()
  );

create policy "Test attempts own"
  on test_attempts for select using (
    student_id = get_student_id() or is_admin() or is_teacher()
  );

create policy "Student create own attempt"
  on test_attempts for insert with check (student_id = get_student_id());

create policy "Student update own attempt"
  on test_attempts for update using (student_id = get_student_id());

-- =============================================
-- TIMETABLE POLICIES
-- =============================================
create policy "Timetable public read"
  on timetable for select using (is_active = true);

create policy "Admin manage timetable"
  on timetable for all using (is_admin());

-- =============================================
-- ENQUIRIES (public insert, admin read)
-- =============================================
create policy "Anyone can submit enquiry"
  on enquiries for insert with check (true);

create policy "Admin read enquiries"
  on enquiries for select using (is_admin());

create policy "Admin manage enquiries"
  on enquiries for update using (is_admin());

-- =============================================
-- CLASSES & BATCHES (authenticated read)
-- =============================================
create policy "Authenticated read classes"
  on classes for select using (auth.uid() is not null or is_active = true);

create policy "Admin manage classes"
  on classes for all using (is_admin());

create policy "Authenticated read batches"
  on batches for select using (auth.uid() is not null or is_active = true);

create policy "Admin manage batches"
  on batches for all using (is_admin());

-- =============================================
-- TEACHERS (read policy)
-- =============================================
create policy "Teacher read own record"
  on teachers for select using (profile_id = auth.uid() or is_admin());

create policy "Admin manage teachers"
  on teachers for all using (is_admin());

-- Student remarks
create policy "Student remarks read"
  on student_remarks for select using (
    student_id = get_student_id() or
    student_id = any(get_parent_student_ids()) or
    teacher_id = get_teacher_id() or
    is_admin()
  );

create policy "Teacher add remarks"
  on student_remarks for insert with check (teacher_id = get_teacher_id() or is_admin());

-- Notification log
create policy "Notification log own"
  on notification_log for select using (recipient_id = auth.uid() or is_admin());

create policy "Service role insert notifications"
  on notification_log for insert with check (true);

-- Study materials
create policy "Study materials read authenticated"
  on study_materials for select using (
    is_published = true and auth.uid() is not null
  );

create policy "Teacher manage study materials"
  on study_materials for all using (teacher_id = get_teacher_id() or is_admin());
