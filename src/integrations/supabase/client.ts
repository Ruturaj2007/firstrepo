import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rixirvhezeiwsnromykx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeGlydmhlemVpd3Nucm9teWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NzM4NTAsImV4cCI6MjA3NTE0OTg1MH0.Y1onc2g2BIzMIL1yay9RfP9Wg36wgi8uChegTDI_vHI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);