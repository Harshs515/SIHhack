import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://odrcqeegkfscjunlpwmg.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcmNxZWVna2ZzY2p1bmxwd21nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTg3MjIsImV4cCI6MjEwMzMzNDcyMn0.hGAk00-ibmBEGJJxolCVrHFNXoRnC01NhXfX-uTC_6c';

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : {
      channel: () => ({
        on: () => ({
          subscribe: () => ({})
        })
      }),
      removeChannel: () => {}
    };
