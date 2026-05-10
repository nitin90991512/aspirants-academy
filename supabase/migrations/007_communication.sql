-- =============================================
-- 007: COMMUNICATION TABLES
-- Aspirants Academy ERP
-- =============================================

-- =============================================
-- NOTICES
-- =============================================
create table notices (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  target_audience notice_target not null default 'all',
  target_class_ids uuid[],
  priority notice_priority default 'normal',
  attachment_urls text[],
  is_published boolean default false,
  publish_at timestamptz,
  expires_at timestamptz,
  created_by uuid references profiles(id),
  view_count integer default 0,
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NOTICE READ TRACKING
create table notice_reads (
  id uuid primary key default uuid_generate_v4(),
  notice_id uuid references notices(id) on delete cascade,
  user_id uuid references profiles(id),
  read_at timestamptz default now(),
  unique(notice_id, user_id)
);

-- =============================================
-- BANNERS (Home Page Dynamic Banners)
-- =============================================
create table banners (
  id uuid primary key default uuid_generate_v4(),
  title text,
  subtitle text,
  image_url text not null,
  link_url text,
  target_audience notice_target default 'all',
  is_active boolean default true,
  sort_order integer default 0,
  display_from timestamptz default now(),
  display_till timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- =============================================
-- ANNOUNCEMENTS (Ticker text)
-- =============================================
create table announcements (
  id uuid primary key default uuid_generate_v4(),
  text text not null,
  is_active boolean default true,
  priority integer default 0,
  created_by uuid references profiles(id),
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- =============================================
-- MESSAGES (Teacher-Parent Chat)
-- =============================================
create table messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references profiles(id),
  receiver_id uuid references profiles(id),
  student_id uuid references students(id),
  content text not null,
  attachment_url text,
  is_read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index idx_messages_sender on messages(sender_id);
create index idx_messages_receiver on messages(receiver_id);

-- =============================================
-- NOTIFICATION LOG
-- =============================================
create table notification_log (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  recipient_id uuid references profiles(id),
  channel text not null,
  title text,
  body text,
  status text default 'sent',
  external_id text,
  metadata jsonb,
  sent_at timestamptz default now()
);

-- =============================================
-- ENQUIRIES (from public home page contact form)
-- =============================================
create table enquiries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  email text,
  student_class text,
  message text,
  is_navodaya_interest boolean default false,
  status text default 'new',
  notes text,
  created_at timestamptz default now()
);

-- Seed sample announcements
insert into announcements (text, is_active, priority) values
  ('🎉 Admission Open for Academic Year 2025-26 | Classes 6th to 12th | Contact: 9265720004', true, 10),
  ('📚 Navodaya Vidyalaya Entrance Preparation — Special Batch Starting Soon!', true, 8),
  ('🏆 Aspirants Academy — Gandhinagar''s Most Trusted Coaching Institute', true, 5);
