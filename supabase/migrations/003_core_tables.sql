-- =============================================
-- 003: CORE TABLES
-- Aspirants Academy ERP
-- =============================================

-- =============================================
-- PROFILES (extends Supabase auth.users)
-- =============================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role user_role not null,
  full_name text not null,
  phone text unique not null,
  email text,
  avatar_url text,
  date_of_birth date,
  gender gender_type,
  address text,
  city text default 'Gandhinagar',
  state text default 'Gujarat',
  is_active boolean default true,
  fcm_token text,
  whatsapp_opt_in boolean default true,
  sms_opt_in boolean default true,
  preferred_language text default 'hi',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- ACADEMIC YEARS
-- =============================================
create table academic_years (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  start_date date not null,
  end_date date not null,
  is_current boolean default false,
  created_at timestamptz default now()
);

create unique index one_current_year on academic_years (is_current) where is_current = true;

-- =============================================
-- CLASSES / STANDARDS
-- =============================================
create table classes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  standard integer not null check (standard between 1 and 12),
  section text,
  academic_year_id uuid references academic_years,
  class_teacher_id uuid references profiles(id),
  room_number text,
  capacity integer default 40,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(standard, section, academic_year_id)
);

-- =============================================
-- BATCHES
-- =============================================
create table batches (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  class_id uuid references classes,
  timing_start time,
  timing_end time,
  days text[],
  max_students integer default 30,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- SUBJECTS
-- =============================================
create table subjects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text,
  applicable_classes integer[],
  is_navodaya_subject boolean default false,
  max_marks integer default 100,
  passing_marks integer default 33,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- STUDENTS
-- =============================================
create table students (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) unique not null,
  admission_number text unique not null,
  roll_number text,
  class_id uuid references classes,
  batch_id uuid references batches,
  academic_year_id uuid references academic_years,
  admission_date date default current_date,
  father_name text,
  mother_name text,
  guardian_name text,
  is_navodaya_aspirant boolean default false,
  navodaya_target_year integer,
  previous_school text,
  blood_group text,
  medical_notes text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- PARENTS
-- =============================================
create table parents (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) unique not null,
  relation text,
  occupation text,
  annual_income text,
  created_at timestamptz default now()
);

-- STUDENT-PARENT RELATIONSHIP
create table student_parents (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) on delete cascade,
  parent_id uuid references parents(id) on delete cascade,
  is_primary boolean default false,
  unique(student_id, parent_id)
);

-- =============================================
-- TEACHERS
-- =============================================
create table teachers (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) unique not null,
  employee_id text unique,
  qualification text,
  specialization text[],
  joining_date date,
  salary_amount numeric(10,2),
  salary_type text default 'monthly',
  bank_account_number text,
  bank_ifsc text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- TEACHER-CLASS ASSIGNMENT
create table teacher_class_assignments (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid references teachers(id),
  class_id uuid references classes(id),
  subject_id uuid references subjects(id),
  academic_year_id uuid references academic_years,
  created_at timestamptz default now(),
  unique(teacher_id, class_id, subject_id, academic_year_id)
);

-- Seed default subjects
insert into subjects (name, code, applicable_classes, is_navodaya_subject, max_marks, passing_marks) values
  ('Mathematics', 'MATH', '{6,7,8,9,10,11,12}', true, 100, 33),
  ('Science', 'SCI', '{6,7,8,9,10}', true, 100, 33),
  ('Social Science', 'SST', '{6,7,8,9,10}', true, 100, 33),
  ('English', 'ENG', '{6,7,8,9,10,11,12}', true, 100, 33),
  ('Hindi', 'HIN', '{6,7,8,9,10,11,12}', true, 100, 33),
  ('Gujarati', 'GUJ', '{6,7,8,9,10,11,12}', false, 100, 33),
  ('Physics', 'PHY', '{11,12}', false, 100, 33),
  ('Chemistry', 'CHEM', '{11,12}', false, 100, 33),
  ('Biology', 'BIO', '{11,12}', false, 100, 33),
  ('Mental Ability', 'MA', '{6,7,8}', true, 50, 17),
  ('Arithmetic', 'ARITH', '{6,7,8}', true, 50, 17),
  ('Computer Science', 'CS', '{9,10,11,12}', false, 100, 33);
