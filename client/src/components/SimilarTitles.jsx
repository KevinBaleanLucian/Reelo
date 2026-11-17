import { useId } from 'react';
import { Link } from 'react-router';
import MovieCard from './MovieCard.jsx';
import MovieCardSkeleton from './MovieCardSkeleton.jsx';
import { ArrowUpRightIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx';
import { useCarousel } from '../hooks/useCarousel.js';
import { formatGenreNames } from '../utils/format.js';
import { useRowColumns } from '../hooks/useRowColumns.js';
import './TitleRow.css';
import './SimilarTitles.css';


function SimilarTitles({ title, status, items = [], genreMap }) {
  const headingId = useId();
  const { columns, pageSize, skeletons } = useRowColumns();
  const { trackRef, canPrev, canNext, scrollPage } = useCarousel(
    pageSize,
    `${title.mediaType}-${title.tmdbId}:${status}`
  );

  if (status === 'error') return null;
  if (status === 'ready' && items.length === 0) return null;

  const isSeries = title.mediaType === 'tv';
  const kind = isSeries ? 'series' : 'movies';
  const genreNames = formatGenreNames(title.genres, 2);
  const firstGenre = title.genres?.[0];

  const subtitle = genreNames
    ? `Similar ${kind}, chosen for fans of ${genreNames}.`
    : `Similar ${kind} you might enjoy.`;

  return (
    <section className="title-row" aria-labelledby={headingId}>
      <div className="title-row__header">
        <div>
          <p className="eyebrow">More like this</p>
          <h2 id={headingId} className="title-row__title">
            Stay beyond the ordinary.
          </h2>
          <p className="similar__subtitle">{subtitle}</p>
        </div>

        <div className="title-row__controls">
          {firstGenre && (
            <Link
              to={`${isSeries ? '/series' : '/movies'}?genre=${firstGenre.tmdbId}`}
              className="title-row__link"
            >
              Explore {formatGenreNames(title.genres, 1)}
              <ArrowUpRightIcon size={16} />
            </Link>
          )}

          <div className="title-row__arrows">
            <button
              type="button"
              className="title-row__arrow"
              aria-label="Previous similar titles"
              disabled={!canPrev}
              onClick={() => scrollPage(-1)}
            >
              <ChevronLeftIcon size={18} />
            </button>
            <button
              type="button"
              className="title-row__arrow"
              aria-label="Next similar titles"
              disabled={!canNext}
              onClick={() => scrollPage(1)}
            >
              <ChevronRightIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      <div
        className="title-row__track"
        ref={trackRef}
        style={{ '--columns': columns }}
        aria-busy={status === 'loading'}
      >
        {status === 'loading'
          ? Array.from({ length: skeletons }, (_, index) => <MovieCardSkeleton key={index} />)
          : items.map((item) => (
              <MovieCard key={`${item.mediaType}-${item.tmdbId}`} item={item} genreMap={genreMap} />
            ))}
      </div>
    </section>
  );
}

export default SimilarTitles;