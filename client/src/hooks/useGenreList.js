import { useCallback, useEffect, useState } from 'react';
import { getGenreList } from '../services/genreService.js';

export function useGenreList() {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ attempt: null, genres: [], failed: false });

  useEffect(() => {
    let active = true;

    getGenreList()
      .then((genres) => {
        if (active) setResult({ attempt, genres, failed: false });
      })
      .catch(() => {
        if (active) setResult({ attempt, genres: [], failed: true });
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  let status = 'loading';
  if (result.attempt === attempt) {
    status = result.failed ? 'error' : 'ready';
  }

  return { genres: status === 'ready' ? result.genres : [], status, retry };
}