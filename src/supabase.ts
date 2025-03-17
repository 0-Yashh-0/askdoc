// // lib/supabase.ts
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// // const supabase = createClient(supabaseUrl, supabaseKey);

// // export { supabase };
// export function createClerkSupabaseClient({session}:{session: ActiveS}) {
//     return createClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_KEY!,
//       {
//         global: {
//           // Get the custom Supabase token from Clerk
//           fetch: async (url, options = {}) => {
//               // The Clerk `session` object has the getToken() method      
//             const clerkToken = await session?.getToken({
//                 // Pass the name of the JWT template you created in the Clerk Dashboard
//                 // For this tutorial, you named it 'supabase'
//               template: 'supabase',
//             })
            
//             // Insert the Clerk Supabase token into the headers
//               const headers = new Headers(options?.headers)
//             headers.set('Authorization', `Bearer ${clerkToken}`)
            
//             // Call the default fetch
//             return fetch(url, {
//               ...options,
//               headers,
//             })
//           },
//         },
//       },
//     )
//   }


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