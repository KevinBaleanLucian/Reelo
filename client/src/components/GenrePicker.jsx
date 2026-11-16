import { useId } from 'react';
import Button from './Button.jsx';
import { CheckIcon, PlusIcon } from './Icons.jsx';
import { useGenreList } from '../hooks/useGenreList.js';
import { genreLabel } from '../utils/format.js';
import './MovieCard.css';
import './GenrePicker.css';

const ORDER = [18, 35, 53, 878, 28, 10749, 27, 12, 9648, 99, 16, 14];

function rank(genre) {
  const index = ORDER.indexOf(genre.tmdbId);
  return index === -1 ? ORDER.length : index;
}

function GenrePicker({ value, onChange }) {
  const headingId = useId();
  const { genres, status, retry } = useGenreList();

  const featured = genres
    .filter((genre) => genre.featured)
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));

  function toggle(id) {
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  }

  return (
    <div className="genre-picker" role="group" aria-labelledby={headingId}>
      <div className="genre-picker__head">
        <p id={headingId} className="genre-picker__title">
          What do you love to watch?
        </p>
        <span className="genre-picker__count" aria-live="polite">
          {value.length > 0 ? `${value.length} selected` : ''}
        </span>
      </div>

      <p className="genre-picker__hint">Select all the genres you like. We’ll make it personal.</p>

      {status === 'loading' && (
        <div className="genre-picker__list" aria-hidden="true">
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index} className="skeleton genre-picker__skeleton" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="genre-picker__message" role="alert">
          <p>We couldn’t load the genres. You can skip this step.</p>
          <Button variant="secondary" onClick={retry}>
            Try again
          </Button>
        </div>
      )}

      {status === 'ready' && featured.length === 0 && (
        <p className="genre-picker__message">Genres aren’t available right now. You can skip this step.</p>
      )}

      {status === 'ready' && featured.length > 0 && (
        <ul className="genre-picker__list">
          {featured.map((genre) => {
            const selected = value.includes(genre.id);

            return (
              <li key={genre.id}>
                <button
                  type="button"
                  className="genre-chip"
                  aria-pressed={selected}
                  onClick={() => toggle(genre.id)}
                >
                  {selected ? <CheckIcon size={14} /> : <PlusIcon size={14} />}
                  {genreLabel(genre.name)}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default GenrePicker;