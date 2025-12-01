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

    return () => {
      if (unsub) unsub();
    };
  }, [router]);
  
  return ready;
}