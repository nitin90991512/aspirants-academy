-- =============================================
-- 004: ATTENDANCE TABLES
-- Aspirants Academy ERP
-- =============================================

-- =============================================
-- ATTENDANCE
-- =============================================
create table attendance (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) not null,
  class_id uuid references classes(id) not null,
  date date not null default current_date,
  status attendance_status not null default 'present',
  check_in_time time,
  check_out_time time,
  marked_by uuid references profiles(id),
  remarks text,
  parent_notified boolean default false,
  notification_sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(student_id, date)
);

create index idx_attendance_date on attendance(date);
create index idx_attendance_student on attendance(student_id);
create index idx_attendance_class on attendance(class_id);

-- =============================================
-- ATTENDANCE SUMMARY (monthly aggregation)
-- =============================================
create table attendance_summary (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id),
  month integer not null check (month between 1 and 12),
  year integer not null,
  total_days integer default 0,
  present_days integer default 0,
  absent_days integer default 0,
  late_days integer default 0,
  percentage numeric(5,2),
  updated_at timestamptz default now(),
  unique(student_id, month, year)
);

-- =============================================
-- TEACHER ATTENDANCE
-- =============================================
create table teacher_attendance (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid references teachers(id),
  date date not null default current_date,
  status attendance_status not null,
  check_in_time time,
  check_out_time time,
  remarks text,
  created_at timestamptz default now(),
  unique(teacher_id, date)
);

-- =============================================
-- FUNCTION: Update attendance summary on insert/update
-- =============================================
create or replace function update_attendance_summary()
returns trigger as $$
declare
  v_month integer;
  v_year integer;
begin
  v_month := extract(month from new.date);
  v_year := extract(year from new.date);

  insert into attendance_summary (student_id, month, year, total_days, present_days, absent_days, late_days, percentage)
  select 
    new.student_id,
    v_month,
    v_year,
    count(*),
    count(*) filter (where status = 'present'),
    count(*) filter (where status = 'absent'),
    count(*) filter (where status = 'late'),
    round(count(*) filter (where status = 'present')::numeric / nullif(count(*), 0) * 100, 2)
  from attendance
  where student_id = new.student_id
    and extract(month from date) = v_month
    and extract(year from date) = v_year
  on conflict (student_id, month, year) do update set
    total_days = excluded.total_days,
    present_days = excluded.present_days,
    absent_days = excluded.absent_days,
    late_days = excluded.late_days,
    percentage = excluded.percentage,
    updated_at = now();

  return new;
end;
$$ language plpgsql;

create trigger trg_update_attendance_summary
  after insert or update on attendance
  for each row execute function update_attendance_summary();
