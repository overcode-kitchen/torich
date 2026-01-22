import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // refresh token이 없을 때 조용히 실패
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // 에러를 콘솔에 조용히 처리
        debug: false
      }
    }
  )
}