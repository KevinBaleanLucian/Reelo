import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import Button from '../components/Button.jsx';
import FilterTabs from '../components/FilterTabs.jsx';
import TitleGrid from '../components/TitleGrid.jsx';
import WatchlistCard from '../components/WatchlistCard.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useGenreMap } from '../hooks/useGenreMap.js';
import { usePagedTitles } from '../hooks/usePagedTitles.js';
import { useWatchlistActions, useWatchlistSummary } from '../hooks/useWatchlist.js';
import { getWatchlist } from '../services/watchlistApi.js';
import { STATUS_LABELS, STATUS_ORDER } from '../utils/watchlist.js';
import './WatchlistPage.css';

const SUMMARY_FIELDS = { to_watch: 'toWatch', watching: 'watching', watched: 'watched' };

function withCount(label, count) {
  return typeof count === 'number' ? `${label} · ${count}` : label;
}

function WatchlistPage() {
  useDocumentTitle('Watchlist');

  const [searchParams, setSearchParams] = useSearchParams();
  const genreMap = useGenreMap();
  const summary = useWatchlistSummary();
  const { seed } = useWatchlistActions();

  const requested = searchParams.get('status');
  const tab = STATUS_ORDER.includes(requested) ? requested : undefined;

  const list = usePagedTitles(`watchlist:${tab ?? 'all'}`, (page) => getWatchlist({ status: tab, page }));

  useEffect(() => {
    if (list.items.length > 0) seed(list.items);
  }, [list.items, seed]);

  const options = [
    { value: 'all', label: withCount('All', summary?.total) },
    ...STATUS_ORDER.map((value) => ({
      value,
      label: withCount(STATUS_LABELS[value], summary?.[SUMMARY_FIELDS[value]]),
    })),
  ];

  function changeTab(value) {
    setSearchParams(value === 'all' ? {} : { status: value });
  }

  const empty = list.status === 'ready' && list.items.length === 0;

  return (
    <div className="container watchlist-page">
      <header className="watchlist-page__header">
        <p className="eyebrow">Your list</p>
        <h1 className="watchlist-page__title">Watchlist</h1>
        <p className="watchlist-page__subtitle">
          Everything you want to see, are watching, or have already loved.
        </p>
      </header>

      <FilterTabs label="Filter your watchlist" options={options} value={tab ?? 'all'} onChange={changeTab} />

      {empty && !tab && (
        <section className="watchlist-page__empty">
          <h2 className="watchlist-page__empty-title">Your watchlist is empty</h2>
          <p>Tap the + on any movie or series to save it here.</p>
          <Button to="/">Discover titles</Button>
        </section>
      )}

      {empty && tab && (
        <p className="watchlist-page__empty-tab">
          Nothing marked as {STATUS_LABELS[tab]} yet.
        </p>
      )}

      {!empty && (
        <TitleGrid
          items={list.items}
          status={list.status}
          genreMap={genreMap}
          hasMore={list.hasMore}
          loadingMore={list.loadingMore}
          moreFailed={list.moreFailed}
          onLoadMore={list.loadMore}
          onRetry={list.retry}
          renderItem={(item) => <WatchlistCard item={item} genreMap={genreMap} tab={tab} />}
        />
      )}
    </div>
  );
}

export default WatchlistPage;