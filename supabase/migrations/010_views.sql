-- =============================================
-- 010: UTILITY VIEWS
-- Aspirants Academy ERP
-- =============================================

-- Student full profile view
create view student_full_view as
select 
  s.id,
  s.admission_number,
  s.roll_number,
  s.is_navodaya_aspirant,
  s.navodaya_target_year,
  s.father_name,
  s.mother_name,
  s.admission_date,
  s.blood_group,
  s.is_active as student_is_active,
  p.full_name,
  p.phone,
  p.email,
  p.avatar_url,
  p.gender,
  p.date_of_birth,
  p.address,
  c.name as class_name,
  c.standard,
  c.section,
  b.name as batch_name,
  ay.name as academic_year,
  ay.id as academic_year_id
from students s
join profiles p on s.profile_id = p.id
left join classes c on s.class_id = c.id
left join batches b on s.batch_id = b.id
left join academic_years ay on s.academic_year_id = ay.id;

-- Attendance percentage view (last 30 days)
create view attendance_percentage_view as
select 
  s.id as student_id,
  p.full_name,
  c.name as class_name,
  count(*) filter (where a.status = 'present') as present_count,
  count(*) filter (where a.status = 'absent') as absent_count,
  count(*) filter (where a.status = 'late') as late_count,
  count(*) as total_count,
  round(
    count(*) filter (where a.status = 'present')::numeric / 
    nullif(count(*), 0) * 100, 2
  ) as percentage
from students s
join profiles p on s.profile_id = p.id
left join classes c on s.class_id = c.id
left join attendance a on s.id = a.student_id 
  and a.date >= current_date - interval '30 days'
group by s.id, p.full_name, c.name;

-- Pending fees view
create view pending_fees_view as
select 
  fi.id as invoice_id,
  fi.invoice_number,
  fi.total_amount,
  fi.due_date,
  fi.status,
  fi.month,
  fi.year,
  p.full_name as student_name,
  p.phone as student_phone,
  c.name as class_name,
  s.id as student_id,
  s.admission_number
from fee_invoices fi
join students s on fi.student_id = s.id
join profiles p on s.profile_id = p.id
left join classes c on s.class_id = c.id
where fi.status in ('pending', 'overdue', 'partial')
order by fi.due_date;

-- Today's attendance view (for admin dashboard)
create view todays_attendance_summary as
select
  c.id as class_id,
  c.name as class_name,
  c.standard,
  count(distinct s.id) as total_students,
  count(distinct a.student_id) filter (where a.status = 'present') as present_count,
  count(distinct a.student_id) filter (where a.status = 'absent') as absent_count,
  count(distinct a.student_id) filter (where a.status = 'late') as late_count,
  count(distinct a.id) as marked_count,
  round(
    count(distinct a.student_id) filter (where a.status = 'present')::numeric / 
    nullif(count(distinct s.id), 0) * 100, 2
  ) as attendance_percentage
from classes c
left join students s on s.class_id = c.id and s.is_active = true
left join attendance a on a.student_id = s.id and a.date = current_date
where c.is_active = true
group by c.id, c.name, c.standard;
