# Supabase Auth Setup

This document summarizes how authentication is wired in this project (Pages Router + Supabase).

## 1. Dependency

```bash
npm install @supabase/supabase-js
```

## 2. Environment Variables

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_PUBLIC_ANON_KEY"
```

Restart `npm run dev` after adding them.

## 3. Supabase Client

`lib/supabaseClient.ts` centralizes the client:

```ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon);
```

## 4. Auth Service Abstraction

`services/auth.ts` exposes simple wrappers:

```ts
import { supabase } from '../lib/supabaseClient';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(cb: (s: Session | null) => void) {
  const { data: subscription } = supabase.auth.onAuthStateChange(
    (_event: AuthChangeEvent, session: Session | null) => cb(session)
  );
  return () => subscription.subscription.unsubscribe();
}

export async function sendMagicLink(email: string) {
  return supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
}

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}
```

## 5. Pages

- `pages/index.tsx` shows session info, links to login/signup, and supports magic link.
- `pages/auth/login.tsx` performs email/password sign-in.
- `pages/auth/signup.tsx` performs email/password registration.

All consume the service functions above.

## 6. Redirect Guard (Prevent Visiting Auth Pages When Signed In)

Hook `hooks/useRedirectIfAuthed.ts`:

```ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSession, onAuthChange } from '../services/auth';

export function useRedirectIfAuthed() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    getSession().then((s) => {
      if (s) {
        router.replace('/');
      } else {
        setReady(true);
        unsub = onAuthChange((sess) => {
          if (sess) router.replace('/');
        });
      }
    });
    return () => { if (unsub) unsub(); };
  }, [router]);

  return ready;
}
```

Usage inside login/signup:

```ts
const ready = useRedirectIfAuthed();
if (!ready) return null;
```

This suppresses form rendering until we confirm the user is unauthenticated.

## 7. Session Display / Sign Out

Index page uses:

```ts
const [session, setSession] = useState<Session | null>(null);

useEffect(() => {
  getSession().then(setSession);
  const unsub = onAuthChange(setSession);
  return () => unsub();
}, []);
```

Sign out:

```ts
await signOut();
```

## 8. Magic Link vs Password

- Magic link (`sendMagicLink`) is passwordless; user clicks link in email.
- Email/password (`signInWithPassword` / `signUpWithPassword`) requires enabling Email provider in Supabase Auth settings.

You can keep both or remove one.

## 9. Optional Enhancements

- Add OAuth providers (Google/GitHub) via `supabase.auth.signInWithOAuth`.
- Persist session server-side using `@supabase/auth-helpers-nextjs` if SSR protection is needed.
- Add password reset: `supabase.auth.resetPasswordForEmail(email)` and handle update token.

## 10. Basic Flow Summary

1. Client initializes Supabase with public URL + anon key.
2. On page load, retrieve current session once (`getSession`).
3. Subscribe to auth state changes (`onAuthChange`) to update UI.
4. Redirect away from auth pages when already authenticated.
5. Provide sign in / sign up actions calling Supabase auth methods.
6. Sign out clears session and triggers UI update.

## 11. Troubleshooting

- Empty session: verify env vars are correct and not undefined.
- 401 errors: ensure anon key still valid; rotate if compromised.
- Redirect loop: check that you only redirect when session is truthy.
- Magic link not arriving: enable SMTP or use Supabase email testing; confirm domain settings.

## 12. Security Notes

- Never expose service_role key in client.
- Use RLS policies for data tables.
- Validate user input before passing to database operations beyond auth.

## 13. Next Steps

- Add protected pages (dashboard) with a guard that redirects unauthenticated users to `/auth/login`.
- Centralize user context (React Context) for cleaner prop usage.
- Introduce server-side redirects if SEO or initial protection is required.

End.
