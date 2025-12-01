import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signInWithPassword } from '../../services/auth';
import { useRedirectIfAuthed } from '@/hooks/useRedirectIfAuthed';

export default function Login() {
  const router = useRouter();

  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const ready = useRedirectIfAuthed();
  if (!ready) return null;

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const email = emailRef.current?.value?.trim() || '';
    const password = passwordRef.current?.value?.trim() || '';

    const { data, error } = await signInWithPassword(
      email,
      password
    );

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push('/');
    }
  };

  return (
    <main>
      <h1>Log In</h1>
      <form onSubmit={signIn}>
        <input
          type="email"
          placeholder="Email"
          ref={emailRef}
          required
        />
        <input
          type="password"
          placeholder="Password"
          ref={passwordRef}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log In'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <p>
        No account? <Link href="/auth/signup">Sign up</Link>
      </p>
      <p>
        Or go <Link href="/">home</Link>.
      </p>
    </main>
  );
}
