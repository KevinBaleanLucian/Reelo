import { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckIcon } from './Icons.jsx';
import { STATUS_LABELS, STATUS_ORDER } from '../utils/watchlist.js';
import './WatchlistMenu.css';

const GAP = 6;
const MARGIN = 8;

function WatchlistMenu({ id, anchorRef,align='end', status, title, onChoose, onRemove, onClose }) {
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    const anchor = anchorRef.current?.getBoundingClientRect();
    if (!menu || !anchor) return;

    const { offsetWidth: width, offsetHeight: height } = menu;
    const preferred = align === 'start' ? anchor.left : anchor.right - width;
    const left = Math.min(Math.max(preferred, MARGIN), window.innerWidth - width - MARGIN);
    let top = anchor.bottom + GAP;

    if (top + height > window.innerHeight - MARGIN && anchor.top - GAP - height >= MARGIN) {
      top = anchor.top - GAP - height;
    }

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.visibility = 'visible';

    const current = menu.querySelector('[aria-checked="true"]') ?? menu.querySelector('[role^="menuitem"]');
    current?.focus();
  }, [anchorRef,align]);

  useEffect(() => {
    function closeOutside(event) {
      const inside = menuRef.current?.contains(event.target) || anchorRef.current?.contains(event.target);
      if (!inside) onClose({ restoreFocus: false });
    }

    function closeOnScroll(event) {
      if (!menuRef.current?.contains(event.target)) onClose({ restoreFocus: false });
    }

    function closeOnResize() {
      onClose({ restoreFocus: false });
    }

    document.addEventListener('pointerdown', closeOutside);
    window.addEventListener('scroll', closeOnScroll, true);
    window.addEventListener('resize', closeOnResize);

    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      window.removeEventListener('scroll', closeOnScroll, true);
      window.removeEventListener('resize', closeOnResize);
    };
  }, [anchorRef, onClose]);

  function handleKeyDown(event) {
    const items = [...menuRef.current.querySelectorAll('[role^="menuitem"]')];
    const index = items.indexOf(document.activeElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[(index + 1) % items.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1]?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose({ restoreFocus: true });
    } else if (event.key === 'Tab') {
      event.preventDefault();
      onClose({ restoreFocus: true });
    }
  }

  return createPortal(
    <div
      ref={menuRef}
      id={id}
      role="menu"
      aria-label={`Watchlist status for ${title}`}
      className="watchlist-menu"
      onKeyDown={handleKeyDown}
    >
      {STATUS_ORDER.map((value) => (
        <button
          key={value}
          type="button"
          role="menuitemradio"
          aria-checked={value === status}
          className="watchlist-menu__item"
          tabIndex={-1}
          onClick={() => onChoose(value)}
        >
          {STATUS_LABELS[value]}
          {value === status && <CheckIcon size={16} />}
        </button>
      ))}

      <div className="watchlist-menu__separator" role="separator" />

      <button
        type="button"
        role="menuitem"
        className="watchlist-menu__item watchlist-menu__item--danger"
        tabIndex={-1}
        onClick={onRemove}
      >
        Remove from watchlist
      </button>
    </div>,
    document.body
  );
}

export default WatchlistMenu;