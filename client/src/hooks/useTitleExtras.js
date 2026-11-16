import { useCallback, useEffect, useState } from 'react';
import { getTitleExtras } from '../services/titleApi.js';

export function useTitleExtras(type, id, region, enabled = true) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, failed: false });

  const key = `${type}:${id}:${region ?? ''}:${attempt}`;

  useEffect(() => {
    if (!enabled) return undefined;

    let active = true;

    getTitleExtras(type, id, region)
      .then((data) => {
        if (active) setResult({ key, data, failed: false });
      })
      .catch(() => {
        if (active) setResult({ key, data: null, failed: true });
      });

    return () => {
      active = false;
    };
  }, [key, type, id, region, enabled]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  let status = 'loading';
  if (enabled && result.key === key) {
    status = result.failed ? 'error' : 'ready';
  }

  return { data: status === 'ready' ? result.data : null, status, retry };
}