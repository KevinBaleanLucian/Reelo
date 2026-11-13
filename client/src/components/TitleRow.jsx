import { useId } from 'react';
import { Link } from 'react-router';
import Button from './Button.jsx';
import MovieCard from './MovieCard.jsx';
import MovieCardSkeleton from './MovieCardSkeleton.jsx';
import { ArrowUpRightIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx';
import { useCarousel } from '../hooks/useCarousel.js';
import { useTitleList } from '../hooks/useTitleList.js';
import './TitleRow.css';

function TitleRow({
  eyebrow,
  title,
  linkTo,
  linkLabel,
  source,
  type,
  limit,
  variant = 'poster',
  genreMap,
  filters,
}) {
  const headingId = useId();
  const columns = variant === 'wide' ? 3 : 5;
  const loadCount = limit ?? (variant === 'wide' ? 9 : 20);

  const { items, status, retry } = useTitleList(source, type, loadCount);
  const { trackRef, canPrev, canNext, scrollPage } = useCarousel(columns, `${status}:${type}`);

  return (
    <section className="title-row" aria-labelledby={headingId}>
      <div className="title-row__header">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 id={headingId} className="title-row__title">
            {title}
          </h2>
        </div>

        <div className="title-row__controls">
          {linkTo && (
            <Link to={linkTo} className="title-row__link">
              {linkLabel}
              <ArrowUpRightIcon size={16} />
            </Link>
          )}

          <div className="title-row__arrows">
            <button
              type="button"
              className="title-row__arrow"
              aria-label="Previous titles"
              disabled={!canPrev}
              onClick={() => scrollPage(-1)}
            >
              <ChevronLeftIcon size={18} />
            </button>
            <button
              type="button"
              className="title-row__arrow"
              aria-label="Next titles"
              disabled={!canNext}
              onClick={() => scrollPage(1)}
            >
              <ChevronRightIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {filters}

      {status === 'error' ? (
        <div className="title-row__message" role="alert">
          <p>We couldn’t load these titles.</p>
          <Button variant="secondary" onClick={retry}>
            Try again
          </Button>
        </div>
      ) : status === 'ready' && items.length === 0 ? (
        <p className="title-row__message">Nothing to show yet.</p>
      ) : (
        <div
          className="title-row__track"
          ref={trackRef}
          style={{ '--columns': columns }}
          aria-busy={status === 'loading'}
        >
          {status === 'loading'
            ? Array.from({ length: columns }, (_, i) => <MovieCardSkeleton key={i} variant={variant} />)
            : items.map((item) => (
                <MovieCard
                  key={`${item.mediaType}-${item.tmdbId}`}
                  item={item}
                  genreMap={genreMap}
                  variant={variant}
                />
              ))}
        </div>
      )}
    </section>
  );
}

export default TitleRow;