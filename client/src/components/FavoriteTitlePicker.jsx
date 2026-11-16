import { useEffect, useId, useRef, useState } from 'react';
import { XIcon } from './Icons.jsx';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions.js';
import { formatYear } from '../utils/format.js';
import { posterUrl } from '../utils/images.js';
import './Input.css';
import './FavoriteTitlePicker.css';

function describe(item) {
  return [formatYear(item.releaseDate), item.mediaType === 'tv' ? 'Series' : 'Movie']
    .filter(Boolean)
    .join(' · ');
}

function Thumb({ path, className }) {
  const src = posterUrl(path, 'w92');
  return src ? (
    <img src={src} alt="" className={className} />
  ) : (
    <span className={className} aria-hidden="true" />
  );
}

function FavoriteTitlePicker({ value, onChange,error }) {
  const uid = useId();
  const inputId = `${uid}-input`;
  const hintId = `${uid}-hint`;
  const errorId=`${uid}-error`;
  const listId = `${uid}-list`;
  const optionId = (index) => `${uid}-option-${index}`;

  const inputRef = useRef(null);
  const removeRef = useRef(null);
  const focusAfterChange = useRef(null);

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);

  const term = query.trim();
  const { items, status } = useSearchSuggestions(term);

  useEffect(() => {
    const target = focusAfterChange.current;
    focusAfterChange.current = null;

    if (target === 'remove') removeRef.current?.focus();
    if (target === 'input') inputRef.current?.focus();
  }, [value]);

  const options = status === 'ready' ? items : [];
  const showPanel = open && term.length > 0;
  const showList = showPanel && options.length > 0;

  let message = '';
  if (term.length === 1) message = 'Keep typing to see suggestions.';
  else if (status === 'loading') message = 'Searching…';
  else if (status === 'error') message = 'We couldn’t load suggestions. Try again in a moment.';
  else if (status === 'ready' && items.length === 0) message = `No results for “${term}”.`;

  const announcement = message || (options.length > 0 ? `${options.length} suggestions available.` : '');

  function choose(item) {
    focusAfterChange.current = 'remove';
    setQuery('');
    setActive(-1);
    setOpen(false);

    onChange({
      tmdbId: item.tmdbId,
      mediaType: item.mediaType,
      title: item.title,
      posterPath: item.posterPath,
      releaseDate: item.releaseDate,
    });
  }

  function remove() {
    focusAfterChange.current = 'input';
    onChange(null);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (active >= 0 && options[active]) choose(options[active]);
      return;
    }

    if (event.key === 'Escape') {
      if (showPanel) {
        event.preventDefault();
        setOpen(false);
      }
      return;
    }

    if (options.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((current) => (current + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActive((current) => (current <= 0 ? options.length - 1 : current - 1));
    }
  }

  function handleBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }

  if (value) {
    return (
      <div className="input">
        <span className="input__label">Your all-time favorite</span>

        <div className="fav-picker__selected">
          <Thumb path={value.posterPath} className="fav-picker__thumb" />

          <span className="fav-picker__text">
            <span className="fav-picker__name">{value.title}</span>
            <span className="fav-picker__meta">{describe(value)}</span>
          </span>

          <button
            ref={removeRef}
            type="button"
            className="fav-picker__remove"
            aria-label={`Remove ${value.title} as your favorite`}
            data-invalid={error ? 'true' : undefined}
            onClick={remove} 
          >
            <XIcon size={16} />
          </button>

          {error && (
            <p className="input_error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="input" onBlur={handleBlur}>
      <label htmlFor={inputId} className="input__label">
        Your all-time favorite
        <span className="fav-picker__optional">Optional</span>
      </label>

      <div className="input__wrap">
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          role="combobox"
          className={`input__control ${error ? 'input__control--error' : ''}`.trim()}
          aria-invalid={error ? 'true' :undefined}
          placeholder="Search movies and series"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={showList ? listId : undefined}
          aria-activedescendant={showList && active >= 0 && active < options.length ? optionId(active) : undefined}
          aria-describedby={error ? errorId : hintId}
          value={query}
          maxLength={100}
          autoComplete="off"
          spellCheck={false}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />

        {showPanel && (
          <div className="fav-picker__panel">
            {message && <p className="fav-picker__message">{message}</p>}

            {showList && (
              <ul
                id={listId}
                role="listbox"
                aria-label="Suggestions"
                className="fav-picker__list"
                onMouseDown={(event) => event.preventDefault()}
              >
                {options.map((item, index) => (
                  <li
                    key={`${item.mediaType}-${item.tmdbId}`}
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === active}
                    className={`fav-picker__option ${index === active ? 'fav-picker__option--active' : ''}`.trim()}
                    onClick={() => choose(item)}
                  >
                    <Thumb path={item.posterPath} className="fav-picker__thumb" />
                    <span className="fav-picker__text">
                      <span className="fav-picker__name">{item.title}</span>
                      <span className="fav-picker__meta">{describe(item)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      
      
      <p id={hintId} className="input__hint">
        Search for a movie or series. You can change it later.
      </p>

      <p className="visually-hidden" role="status">
        {announcement}
      </p>
    </div>
  );
}

export default FavoriteTitlePicker;