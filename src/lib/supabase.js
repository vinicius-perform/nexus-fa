import { createClient } from '@supabase/supabase-js'

// Hardcoded for stability on local Vite dev server
// Proof of concept showed import.meta.env was triggering an infinite reload loop
const supabaseUrl = 'https://ohutgzmsekniqldhhcek.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9odXRnem1zZWtuaXFsZGhoY2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MzgxMzIsImV4cCI6MjA5MDIxNDEzMn0.h9g3BY91UCWVjqtmUmtkuqu_-AE-lAIx1EmB6nBRjoA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
