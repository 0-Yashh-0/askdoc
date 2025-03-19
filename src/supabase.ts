import { createClient } from "@supabase/supabase-js";

export function createClerkSupabaseClient(token:string|null|undefined) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(
    supabaseUrl,
    supabaseKey,
    {
      global: {
        // Get the custom Supabase token from Clerk
        fetch: async (url, options = {}) => {
          
          // Insert the Clerk Supabase token into the headers
          const headers = new Headers(options?.headers);
          headers.set('Authorization', `Bearer ${token}`);
          
          // Call the default fetch
          return fetch(url, {
            ...options,
            headers,
          })
        },
      },
    },
  )
}