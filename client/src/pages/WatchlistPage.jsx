import PlaceholderPage from './PlaceholderPage.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

function WatchlistPage() {
  useDocumentTitle('Watchlist');

  return <PlaceholderPage title="Watchlist" />;
}

export default WatchlistPage;