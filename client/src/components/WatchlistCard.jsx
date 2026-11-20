import MovieCard from './MovieCard.jsx';
import { useWatchlistStatus } from '../hooks/useWatchlist.js';
import { STATUS_LABELS } from '../utils/watchlist.js';
import './WatchlistCard.css';

function WatchlistCard({ item, genreMap, tab }) {
  const status = useWatchlistStatus(item);

  let note = '';
  if (status === null) note = 'Removed from watchlist';
  else if (tab && typeof status === 'string' && status !== tab) note = `Moved to ${STATUS_LABELS[status]}`;

  return (
    <div className={`watchlist-card ${note ? 'watchlist-card--stale' : ''}`.trim()}>
      <MovieCard item={item} genreMap={genreMap} />
      {note && (
        <p className="watchlist-card__note" role="status">
          {note}
        </p>
      )}
    </div>
  );
}

export default WatchlistCard;