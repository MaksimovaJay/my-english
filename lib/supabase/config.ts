// Public values: the publishable key is meant to ship in the browser. Env vars override them.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://duiqducynpxhastctfee.supabase.co';
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_A-J2lk_i7OX_qUQ-buYqEw_Q2OEGxrx';
