import { useAuth } from './useAuth.js';
import { useAuthLinkState } from './useAuthLinkState.js';

export function useWatchlistLink() {
  const { status } = useAuth();
  const authState = useAuthLinkState();

  if (status === 'authenticated') {
    return { to: '/watchlist' };
  }

  return { to: '/login', state: { ...authState, from: { pathname: '/watchlist' } } };
}