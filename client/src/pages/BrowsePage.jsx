import { useState } from 'react';
import { useSearchParams } from 'react-router';
import Button from '../components/Button.jsx';
import { SlidersIcon } from '../components/Icons.jsx';
import Select from '../components/Select.jsx';
import TitleGrid from '../components/TitleGrid.jsx';
import { useGenreMap } from '../hooks/useGenreMap.js';
import { usePagedTitles } from '../hooks/usePagedTitles.js';
import { useTypeGenres } from '../hooks/useTypeGenres.js';
import { getDiscover } from '../services/titleApi.js';
import {
  LANGUAGE_OPTIONS,
  RATING_OPTIONS,
  RUNTIME_OPTIONS,
  SORT_OPTIONS,
  pickOption,
} from '../utils/browseOptions.js';
import './BrowsePage.css';

const FIRST_YEAR = 1950;
const LAST_YEAR = new Date().getFullYear() + 1;

const yearOptions = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, i) => {
  const year = String(LAST_YEAR - i);
  return { value: year, label: year };
});

function parseNumber(value, min, max) {
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : undefined;
}

function BrowsePage({ type }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreMap = useGenreMap();
  const typeGenres = useTypeGenres(type);

  const genre = parseNumber(searchParams.get('genre'), 1, 999999);
  const year = parseNumber(searchParams.get('year'), FIRST_YEAR, LAST_YEAR);
  const sort = pickOption(searchParams.get('sort'), SORT_OPTIONS);
  const rating = pickOption(searchParams.get('rating'), RATING_OPTIONS);
  const lang = pickOption(searchParams.get('lang'), LANGUAGE_OPTIONS);
  const runtime =
    type === 'movie' ? pickOption(searchParams.get('runtime'), RUNTIME_OPTIONS) : undefined;

  const advancedCount = [sort, rating, runtime, lang].filter(Boolean).length;
  const hasFilters = genre !== undefined || year !== undefined || advancedCount > 0;

  const [panelOpen, setPanelOpen] = useState(advancedCount > 0);

  const list = usePagedTitles(
    `${type}:${genre ?? ''}:${year ?? ''}:${sort ?? ''}:${rating ?? ''}:${runtime ?? ''}:${lang ?? ''}`,
    (page) => getDiscover(type, { genre, year, sort, rating, runtime, lang, page })
  );

  function setFilter(name, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next);
  }

  const genreOptions = typeGenres.map((g) => ({ value: String(g.tmdbId), label: g.name }));
  const heading = type === 'movie' ? 'Movies' : 'Series';

  return (
    <div className="container browse">
      <header className="browse__header">
        <p className="eyebrow">Browse</p>
        <h1 className="browse__title">{heading}</h1>
      </header>

      <div className="browse__filters">
        <Select
          label="Genre"
          placeholder="All genres"
          options={genreOptions}
          value={genre ? String(genre) : ''}
          onChange={(value) => setFilter('genre', value)}
        />
        <Select
          label="Year"
          placeholder="Any year"
          options={yearOptions}
          value={year ? String(year) : ''}
          onChange={(value) => setFilter('year', value)}
        />

        <Button
          variant="secondary"
          aria-expanded={panelOpen}
          aria-controls="advanced-filters"
          onClick={() => setPanelOpen((open) => !open)}
        >
          <SlidersIcon size={18} />
          Filters
          {advancedCount > 0 && <span className="browse__badge">{advancedCount}</span>}
        </Button>

        {hasFilters && (
          <Button variant="secondary" onClick={() => setSearchParams({})}>
            Clear filters
          </Button>
        )}
      </div>

      <div id="advanced-filters" className="browse__panel" hidden={!panelOpen}>
        <Select
          label="Sort by"
          placeholder="Most popular"
          options={SORT_OPTIONS}
          value={sort ?? ''}
          onChange={(value) => setFilter('sort', value)}
        />
        <Select
          label="Minimum rating"
          placeholder="Any rating"
          options={RATING_OPTIONS}
          value={rating ?? ''}
          onChange={(value) => setFilter('rating', value)}
        />
        {type === 'movie' && (
          <Select
            label="Runtime"
            placeholder="Any length"
            options={RUNTIME_OPTIONS}
            value={runtime ?? ''}
            onChange={(value) => setFilter('runtime', value)}
          />
        )}
        <Select
          label="Original language"
          placeholder="Any language"
          options={LANGUAGE_OPTIONS}
          value={lang ?? ''}
          onChange={(value) => setFilter('lang', value)}
        />
      </div>

      <TitleGrid
        items={list.items}
        status={list.status}
        genreMap={genreMap}
        hasMore={list.hasMore}
        loadingMore={list.loadingMore}
        moreFailed={list.moreFailed}
        onLoadMore={list.loadMore}
        onRetry={list.retry}
        emptyMessage="No titles match these filters."
      />
    </div>
  );
}

export default BrowsePage;