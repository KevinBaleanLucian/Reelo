import { useCallback } from 'react';
import { useToast } from '../hooks/useToast.js';
import { useWatchlistErrors,useWatchlistNotices } from '../hooks/useWatchlist.js';


function WatchlistErrorToasts() {
  const { show } = useToast();

  useWatchlistErrors(useCallback((message) => show(message, { tone: 'error' }), [show]));
  useWatchlistNotices(useCallback((message) => show(message), [show]));

  return null;
}

export default WatchlistErrorToasts;