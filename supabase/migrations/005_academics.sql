-- =============================================
-- 005: ACADEMICS TABLES
-- Aspirants Academy ERP
-- =============================================

-- =============================================
-- TIMETABLE
-- =============================================
create table timetable (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id),
  batch_id uuid references batches(id),
  day day_of_week not null,
  period_number integer not null check (period_number between 1 and 10),
  subject_id uuid references subjects(id),
  teacher_id uuid references teachers(id),
  start_time time not null,
  end_time time not null,
  room_number text,
  is_active boolean default true,
  effective_from date default current_date,
  effective_till date,
  created_at timestamptz default now(),
  unique(class_id, day, period_number, effective_from)
);

-- =============================================
-- HOMEWORK
-- =============================================
create table homework (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  class_id uuid references classes(id),
  batch_id uuid references batches(id),
  subject_id uuid references subjects(id),
  teacher_id uuid references teachers(id),
  assigned_date date default current_date,
  due_date date not null,
  attachment_urls text[],
  is_active boolean default true,
  created_at timestamptz default now()
);

-- HOMEWORK SUBMISSIONS
create table homework_submissions (
  id uuid primary key default uuid_generate_v4(),
  homework_id uuid references homework(id),
  student_id uuid references students(id),
  submitted_at timestamptz default now(),
  attachment_urls text[],
  remarks text,
  marks_obtained numeric(5,2),
  unique(homework_id, student_id)
);

-- =============================================
-- EXAMS
-- =============================================
create table exams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  exam_type exam_type not null,
  class_id uuid references classes(id),
  academic_year_id uuid references academic_years,
  start_date date,
  end_date date,
  is_published boolean default false,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- EXAM SCHEDULE (subject-wise)
create table exam_schedule (
  id uuid primary key default uuid_generate_v4(),
  exam_id uuid references exams(id) on delete cascade,
  subject_id uuid references subjects(id),
  exam_date date,
  start_time time,
  end_time time,
  max_marks integer not null default 100,
  passing_marks integer default 33,
  room_number text,
  created_at timestamptz default now()
);

-- EXAM RESULTS
create table exam_results (
  id uuid primary key default uuid_generate_v4(),
  exam_id uuid references exams(id),
  exam_schedule_id uuid references exam_schedule(id),
  student_id uuid references students(id),
  subject_id uuid references subjects(id),
  marks_obtained numeric(5,2),
  max_marks integer default 100,
  is_absent boolean default false,
  grade text,
  remarks text,
  entered_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(exam_id, student_id, subject_id)
);

-- Auto-calculate grade
create or replace function calculate_grade()
returns trigger as $$
declare
  percentage numeric;
begin
  if new.max_marks > 0 and new.marks_obtained is not null then
    percentage := (new.marks_obtained / new.max_marks) * 100;
    new.grade := case
      when percentage >= 90 then 'A+'
      when percentage >= 80 then 'A'
      when percentage >= 70 then 'B+'
      when percentage >= 60 then 'B'
      when percentage >= 50 then 'C'
      when percentage >= 33 then 'D'
      else 'F'
    end;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger auto_grade
  before insert or update on exam_results
  for each row execute function calculate_grade();

-- EXAM RANKINGS
create table exam_rankings (
  id uuid primary key default uuid_generate_v4(),
  exam_id uuid references exams(id),
  student_id uuid references students(id),
  class_id uuid references classes(id),
  total_marks numeric(6,2),
  max_total_marks numeric(6,2),
  percentage numeric(5,2),
  class_rank integer,
  batch_rank integer,
  overall_rank integer,
  created_at timestamptz default now(),
  unique(exam_id, student_id)
);

-- =============================================
-- STUDY MATERIALS
-- =============================================
create table study_materials (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  class_id uuid references classes(id),
  subject_id uuid references subjects(id),
  teacher_id uuid references teachers(id),
  file_url text not null,
  file_type text,
  file_size_kb integer,
  is_published boolean default true,
  created_at timestamptz default now()
);
