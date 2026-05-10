-- =============================================
-- 009: STAFF & CONTENT TABLES
-- Aspirants Academy ERP
-- =============================================

-- LEAVE APPLICATIONS
create table leave_applications (
  id uuid primary key default uuid_generate_v4(),
  applicant_id uuid references profiles(id),
  applicant_role user_role,
  leave_type text,
  from_date date not null,
  to_date date not null,
  total_days integer,
  reason text not null,
  attachment_url text,
  status leave_status default 'pending',
  approved_by uuid references profiles(id),
  approval_remarks text,
  applied_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TEACHER REMARKS (about students)
create table student_remarks (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id),
  teacher_id uuid references teachers(id),
  remark_text text not null,
  remark_type text,
  is_shared_with_parent boolean default true,
  created_at timestamptz default now()
);

-- GALLERY
create table gallery (
  id uuid primary key default uuid_generate_v4(),
  title text,
  image_url text not null,
  category text,
  is_published boolean default true,
  sort_order integer default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ACHIEVEMENTS (for home page)
create table achievements (
  id uuid primary key default uuid_generate_v4(),
  student_name text not null,
  achievement_text text not null,
  image_url text,
  year integer,
  class_standard integer,
  is_published boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- WEBSITE CONTENT (dynamic sections)
create table website_content (
  id uuid primary key default uuid_generate_v4(),
  section text unique not null,
  title text,
  subtitle text,
  content text,
  metadata jsonb,
  updated_by uuid references profiles(id),
  updated_at timestamptz default now()
);

-- Seed default website content
insert into website_content (section, title, subtitle, content, metadata) values
(
  'hero',
  'Aspirants Academy',
  'Gandhinagar''s Premier Coaching Institute for Classes 6th–12th',
  'Empowering students with quality education and Navodaya Vidyalaya preparation.',
  '{"cta_text": "Enroll Now", "cta_link": "#contact", "badge": "Navodaya Specialists"}'::jsonb
),
(
  'about',
  'About Aspirants Academy',
  'Shaping Futures Since 2015',
  'Aspirants Academy is a leading coaching institute in Gandhinagar, Gujarat, specializing in classes 6th to 12th with a special focus on Navodaya Vidyalaya entrance preparation. Under the guidance of Nitin Sir, we have helped hundreds of students achieve their dreams.',
  '{"founded": "2015", "location": "Gandhinagar, Gujarat"}'::jsonb
),
(
  'stats',
  null,
  null,
  null,
  '{"total_students": "500+", "classes": "6th to 12th", "navodaya_selections": "200+", "years_of_excellence": "10+"}'::jsonb
),
(
  'navodaya',
  'Navodaya Vidyalaya Specialist',
  'Your Child''s Gateway to Premier Education',
  'Our specialized Navodaya Vidyalaya entrance preparation program has an exceptional success rate. We cover all sections: Mental Ability, Arithmetic, and Language with proven teaching methods and regular mock tests.',
  '{"success_rate": "85%", "mock_tests_per_month": "4", "subjects": ["Mental Ability", "Arithmetic", "Language"]}'::jsonb
),
(
  'contact',
  'Get In Touch',
  'We''d love to hear from you',
  null,
  '{"phone": "9265720004", "whatsapp": "9265720004", "email": "info@aspirantsacademy.in", "address": "Aspirants Academy, Gandhinagar, Gujarat - 382010", "maps_embed": ""}'::jsonb
);

-- Seed sample achievements
insert into achievements (student_name, achievement_text, year, class_standard, is_published, sort_order) values
  ('Priya Sharma', 'Selected in Navodaya Vidyalaya, Gandhinagar — Class 6', 2024, 5, true, 1),
  ('Rahul Patel', 'All India Rank 45 in Navodaya Entrance Exam', 2024, 5, true, 2),
  ('Anjali Mehta', 'First in District — Class 10 Board Exams (98.5%)', 2024, 10, true, 3),
  ('Karan Shah', 'Selected in Navodaya Vidyalaya, Mehsana', 2023, 5, true, 4),
  ('Deepa Joshi', 'Science Olympiad State Gold Medalist', 2024, 8, true, 5),
  ('Amit Trivedi', 'JEE Advanced Qualifier — IIT Dream Fulfilled', 2024, 12, true, 6);
