import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Document = {
  id: string;
  staff_name: string;
  title: string;
  category: string;
  date: string;
  storage_path: string;
  created_at: string;
};
