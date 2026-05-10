-- =============================================
-- 001: EXTENSIONS & SETUP
-- Aspirants Academy ERP
-- Run this FIRST in Supabase SQL Editor
-- =============================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Set timezone to IST
alter database postgres set timezone = 'Asia/Kolkata';
