import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { getSession, onAuthChange, sendMagicLink, signOut } from '../services/auth';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    getSession().then((s) => setSession(s));
    const unsub = onAuthChange((s) => setSession(s));
    return () => unsub();
  }, []);

  const signInWithEmail = async () => {
    if (!email) return;
    await sendMagicLink(email);
    alert('Check your email for the login link.');
  };

  const doSignOut = async () => {
    await signOut();
  };

  return (
    <main>
      <h1>Homestay App</h1>
      {!session ? (
        <div>
          <p>
            <a href="/auth/login">Log in</a> · <a href="/auth/signup">Sign up</a>
          </p>
        </div>
      ) : (
        <div>
          <p>Signed in as {session.user.email}</p>
          <Button variant="secondary" onClick={doSignOut}>Sign Out</Button>
        </div>
      )}
    </main>
  );
}