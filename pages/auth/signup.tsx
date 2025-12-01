import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signUpWithEmail } from '../../services/auth';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const { data, error } = await signUpWithEmail(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.user) {
      setMessage('Check your email to confirm your account.');
      router.push('/auth/login');
    }
  };

  return (
    <main>
      <h1>Sign Up</h1>
      <form onSubmit={signUp}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing up…' : 'Create Account'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}
      </form>
      <p>
        Already have an account? <Link href="/auth/login">Log in</Link>
      </p>
      <p>
        Or go <Link href="/">home</Link>.
      </p>
    </main>
  );
}
