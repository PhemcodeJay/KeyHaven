import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_SUPABASE_URL || 'https://qneeldfsysuhlzfpvkwb.databasepad.com';
const supabaseKey = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjJhNDVhMzZjLTkyMWUtNGMzZi1hNTgyLTg4NmRkYjM5ZTkyOSJ9.eyJwcm9qZWN0SWQiOiJxbmVlbGRmc3lzdWhsemZwdmt3YiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcxNjI5NzA3LCJleHAiOjIwODY5ODk3MDcsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.dz1P27AmTOEPHkoHuhzBc-kZjj01jGnlhLRflkLuOwM';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };