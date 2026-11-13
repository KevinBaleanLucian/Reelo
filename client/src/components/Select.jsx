import { useEffect, useId, useRef, useState } from 'react';
import { CheckIcon, ChevronDownIcon } from './Icons.jsx';
import './Select.css';

function Select({ label, value, onChange, options, placeholder, className = '' }) {
  const uid = useId();
  const buttonId = `${uid}-button`;
  const labelId = `${uid}-label`;
  const listId = `${uid}-list`;
  const optionId = (index) => `${uid}-option-${index}`;

  const rootRef = useRef(null);
  const typedRef = useRef({ text: '', timer: null });
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = [{ value: '', label: placeholder }, ...options];
  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.value === value)
  );
  const selected = items[selectedIndex];

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      document.getElementById(`${uid}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, activeIndex, uid]);

  function openList() {
    setActiveIndex(selectedIndex);
    setOpen(true);
  }

  function choose(index) {
    onChange(items[index].value);
    setOpen(false);
  }

  function moveTo(index) {
    setActiveIndex(Math.min(Math.max(index, 0), items.length - 1));
  }

  function typeAhead(char, from) {
    const state = typedRef.current;
    clearTimeout(state.timer);
    state.text += char.toLowerCase();
    state.timer = setTimeout(() => {
      state.text = '';
    }, 600);

    const offset = state.text.length === 1 ? from + 1 : from;
    for (let step = 0; step < items.length; step += 1) {
      const index = (offset + step) % items.length;
      if (items[index].label.toLowerCase().startsWith(state.text)) {
        setActiveIndex(index);
        return;
      }
    }
  }

  function handleKeyDown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const { key } = event;
    const isCharacter = /^[\p{L}\p{N}]$/u.test(key);

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(key)) {
        event.preventDefault();
        openList();
      } else if (isCharacter) {
        openList();
        typeAhead(key, selectedIndex);
      }
      return;
    }

    if (key === 'ArrowDown') {
      event.preventDefault();
      moveTo(activeIndex + 1);
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      moveTo(activeIndex - 1);
    } else if (key === 'Home') {
      event.preventDefault();
      moveTo(0);
    } else if (key === 'End') {
      event.preventDefault();
      moveTo(items.length - 1);
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      choose(activeIndex);
    } else if (key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    } else if (key === 'Tab') {
      setOpen(false);
    } else if (isCharacter) {
      typeAhead(key, activeIndex);
    }
  }

  function handleClick(event) {
    if (event.detail === 0) return;
    if (open) setOpen(false);
    else openList();
  }

  return (
    <div className={`select ${className}`.trim()} ref={rootRef}>
      <label id={labelId} htmlFor={buttonId} className="select__label">
        {label}
      </label>

      <button
        id={buttonId}
        type="button"
        role="combobox"
        className={`select__control ${open ? 'select__control--open' : ''}`.trim()}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={`${labelId} ${buttonId}`}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onBlur={() => setOpen(false)}
      >
        <span className={`select__value ${value === '' ? 'select__value--placeholder' : ''}`.trim()}>
          {selected.label}
        </span>
        <ChevronDownIcon size={16} className="select__chevron" />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          className="select__list"
          onMouseDown={(event) => event.preventDefault()}
        >
          {items.map((item, index) => (
            <li
              key={item.value || 'placeholder'}
              id={optionId(index)}
              role="option"
              aria-selected={index === selectedIndex}
              className={[
                'select__option',
                index === activeIndex ? 'select__option--active' : '',
                index === selectedIndex ? 'select__option--selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(index)}
            >
              <span>{item.label}</span>
              {index === selectedIndex && <CheckIcon size={16} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Select;