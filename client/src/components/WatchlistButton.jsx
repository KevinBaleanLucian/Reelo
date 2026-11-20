import { useCallback, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckIcon, ChevronDownIcon, PlusIcon } from './Icons.jsx';
import WatchlistMenu from './WatchlistMenu.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useAuthLinkState } from '../hooks/useAuthLinkState.js';
import { useWatchlistActions, useWatchlistStatus } from '../hooks/useWatchlist.js';
import { STATUS_LABELS } from '../utils/watchlist.js';

function WatchlistButton({ item, variant = 'icon', className = '', activeClassName = '' }) {
  const { status: authStatus } = useAuth();
  const authState = useAuthLinkState();
  const navigate = useNavigate();
  const status = useWatchlistStatus(item);
  const { setStatus, remove } = useWatchlistActions();

  const menuId = useId();
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(({ restoreFocus }) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  const full = variant === 'full';
  const title = item.title;
  const inList = typeof status === 'string';
  const checking = authStatus === 'loading' || (authStatus === 'authenticated' && status === undefined);

  function handleClick(event) {
    event.currentTarget.focus();

    if (authStatus === 'anonymous') {
      navigate('/login', {
        state: {
          ...authState,
          pendingWatchlist: {mediaType: item.mediaType,tmdbId:item.tmdbId,title:item.title},
        },
      });
      return;
    }

    if (inList) {
      setOpen((current) => !current);
    } else {
      setStatus(item, 'to_watch');
    }
  }

  let label;
  if (full) {
    if (inList) label = `${STATUS_LABELS[status]}, in your watchlist. Change status`;
  } else {
    label = `Add ${title} to your watchlist`;
    if (checking) label = `Checking your watchlist for ${title}`;
    if (inList) label = `${title} is in your watchlist as ${STATUS_LABELS[status]}. Change status`;
  }

  let content;
  if (full) {
    content = inList ? (
      <>
        <CheckIcon size={18} />
        {STATUS_LABELS[status]}
        <ChevronDownIcon size={16} className="watchlist-button__chevron" />
      </>
    ) : (
      <>
        <PlusIcon size={18} />
        Add to watchlist
      </>
    );
  } else {
    content = inList ? <CheckIcon size={16} /> : <PlusIcon size={16} />;
  }

  const classes = [className, inList && activeClassName].filter(Boolean).join(' ');

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={classes}
        aria-label={label}
        aria-busy={checking || undefined}
        aria-haspopup={inList ? 'menu' : undefined}
        aria-expanded={inList ? open : undefined}
        aria-controls={inList && open ? menuId : undefined}
        disabled={checking}
        onClick={handleClick}
      >
        {content}
      </button>

      {inList && open && (
        <WatchlistMenu
          id={menuId}
          anchorRef={buttonRef}
          align={full ? 'start' : 'end'}
          status={status}
          title={title}
          onChoose={(value) => {
            setStatus(item, value);
            close({ restoreFocus: true });
          }}
          onRemove={() => {
            remove(item);
            close({ restoreFocus: true });
          }}
          onClose={close}
        />
      )}
    </>
  );
}

export default WatchlistButton;