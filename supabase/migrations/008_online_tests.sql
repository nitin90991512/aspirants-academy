-- =============================================
-- 008: ONLINE TEST SYSTEM
-- Aspirants Academy ERP
-- =============================================

-- =============================================
-- ONLINE TESTS
-- =============================================
create table online_tests (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  class_id uuid references classes(id),
  subject_id uuid references subjects(id),
  created_by uuid references teachers(id),
  duration_minutes integer not null default 30,
  total_marks integer,
  passing_marks integer,
  negative_marking boolean default false,
  negative_marks_per_wrong numeric(3,2) default 0.25,
  shuffle_questions boolean default true,
  shuffle_options boolean default true,
  is_navodaya_style boolean default false,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  is_published boolean default false,
  max_attempts integer default 1,
  show_answers_after boolean default true,
  show_leaderboard boolean default true,
  created_at timestamptz default now()
);

-- TEST QUESTIONS
create table test_questions (
  id uuid primary key default uuid_generate_v4(),
  test_id uuid references online_tests(id) on delete cascade,
  question_type question_type default 'mcq',
  question_text text not null,
  question_image_url text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  correct_answer text not null,
  explanation text,
  marks numeric(4,2) default 1,
  difficulty text default 'medium',
  topic text,
  sort_order integer,
  created_at timestamptz default now()
);

-- TEST ATTEMPTS
create table test_attempts (
  id uuid primary key default uuid_generate_v4(),
  test_id uuid references online_tests(id),
  student_id uuid references students(id),
  started_at timestamptz default now(),
  submitted_at timestamptz,
  time_taken_seconds integer,
  score numeric(6,2),
  total_marks numeric(6,2),
  percentage numeric(5,2),
  correct_answers integer,
  wrong_answers integer,
  skipped_answers integer,
  rank integer,
  status text default 'in_progress',
  created_at timestamptz default now(),
  unique(test_id, student_id)
);

-- TEST ANSWERS (per question)
create table test_answers (
  id uuid primary key default uuid_generate_v4(),
  attempt_id uuid references test_attempts(id) on delete cascade,
  question_id uuid references test_questions(id),
  selected_answer text,
  is_correct boolean,
  marks_obtained numeric(4,2),
  time_spent_seconds integer,
  created_at timestamptz default now(),
  unique(attempt_id, question_id)
);
