import { useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowUpRightIcon, SearchIcon, XIcon } from './Icons.jsx';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions.js';
import { formatYear } from '../utils/format.js';
import { posterUrl } from '../utils/images.js';
import './NavbarSearch.css';

function MobileSearch() {
  const navigate = useNavigate();
  const uid = useId();
  const listId = `${uid}-list`;
  const optionId = (index) => `${uid}-option-${index}`;
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);

  const term = query.trim();
  const { items, status } = useSearchSuggestions(term);

  const options =
    status === 'ready' && items.length > 0
      ? [...items.map((item) => ({ type: 'title', item })), { type: 'all' }]
      : status === 'error'
        ? [{ type: 'all' }]
        : [];

  let message = '';
  if (term.length === 1) message = 'Keep typing to see suggestions.';
  else if (status === 'loading') message = 'Searching…';
  else if (status === 'error') message = 'We couldn’t load suggestions.';
  else if (status === 'ready' && items.length === 0) message = `No results for “${term}”.`;

  const announcement = message || (options.length > 0 ? `${items.length} suggestions available.` : '');

  function goToTitle(item) {
    navigate(`/title/${item.mediaType}/${item.tmdbId}`);
  }

  function goToSearch() {
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const chosen = active >= 0 ? options[active] : undefined;
    if (chosen?.type === 'title') goToTitle(chosen.item);
    else goToSearch();
  }

  function handleKeyDown(event) {
    if (options.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((current) => (current + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => (current <= 0 ? options.length - 1 : current - 1));
    }
  }

  function handleClear() {
    setQuery('');
    setActive(-1);
    inputRef.current?.focus();
  }

  return (
    <form role="search" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <div className="navbar-search__field">
        <SearchIcon size={18} />

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          className="navbar-search__input"
          placeholder="Search movies and series"
          aria-label="Search movies and series"
          aria-autocomplete="list"
          aria-expanded={options.length > 0}
          aria-controls={options.length > 0 ? listId : undefined}
          aria-activedescendant={active >= 0 ? optionId(active) : undefined}
          value={query}
          maxLength={100}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(-1);
          }}
        />

        {query && (
          <button
            type="button"
            className="navbar-search__clear"
            aria-label="Clear search"
            onClick={handleClear}
          >
            <XIcon size={16} />
          </button>
        )}
      </div>

      {term.length > 0 && (
        <div className="mobile-menu__results">
          {message && <p className="navbar-search__message">{message}</p>}

          {options.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              aria-label="Suggestions"
              className="navbar-search__list"
              onMouseDown={(event) => event.preventDefault()}
            >
              {options.map((option, index) => {
                const isActive = index === active;

                if (option.type === 'all') {
                  return (
                    <li
                      key="all"
                      id={optionId(index)}
                      role="option"
                      aria-selected={isActive}
                      className={`navbar-search__option navbar-search__option--all ${
                        isActive ? 'navbar-search__option--active' : ''
                      }`.trim()}
                      onClick={goToSearch}
                    >
                      <span className="navbar-search__name">See all results for “{term}”</span>
                      <ArrowUpRightIcon size={16} />
                    </li>
                  );
                }

                const { item } = option;
                const poster = posterUrl(item.posterPath, 'w92');
                const meta = [formatYear(item.releaseDate), item.mediaType === 'tv' ? 'Series' : 'Movie']
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <li
                    key={`${item.mediaType}-${item.tmdbId}`}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isActive}
                    className={`navbar-search__option ${isActive ? 'navbar-search__option--active' : ''}`.trim()}
                    onClick={() => goToTitle(item)}
                  >
                    {poster ? (
                      <img src={poster} alt="" className="navbar-search__thumb" />
                    ) : (
                      <span className="navbar-search__thumb" />
                    )}
                    <span className="navbar-search__text">
                      <span className="navbar-search__name">{item.title}</span>
                      <span className="navbar-search__meta">{meta}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <p className="visually-hidden" role="status">
        {announcement}
      </p>
    </form>
  );
}

export default MobileSearch;