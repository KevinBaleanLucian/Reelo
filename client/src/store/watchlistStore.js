import {deleteWatchlistEntry,getWatchlistSummary,lookupWatchlist,putWatchlistEntry,} from '../services/watchlistApi.js';

const LOOKUP_LIMIT = 60;
const SUMMARY_FIELDS = { to_watch: 'toWatch', watching: 'watching', watched: 'watched' };

export function watchlistKey(item) {
  return `${item.mediaType}:${item.tmdbId}`;
}

export function createWatchlistStore() {
  let enabled = false;
  let generation = 0;
  let statuses = new Map();
  let summary = null;

  const wanted = new Set();
  const pending = new Set();
  const inFlight = new Set();
  const versions = new Map();
  const chains = new Map();
  const listeners = new Set();
  const errorListeners = new Set();
  const afterLogin=new Map();
  const applying=new Set();
  const noticeListeners=new Set();

  let flushTimer = null;
  let summaryTimer = null;

  function emit() {
    for (const listener of listeners) listener();
  }

  function emitNotice(message){
    for (const listener of noticeListeners) listener(message);
  }

  function emitError(message) {
    for (const listener of errorListeners) listener(message);
  }

  function adjustSummary(from, to) {
    if (!summary) return;

    const next = { ...summary };
    if (from) next[SUMMARY_FIELDS[from]] -= 1;
    if (to) next[SUMMARY_FIELDS[to]] += 1;
    next.total = next.toWatch + next.watching + next.watched;
    summary = next;
  }

  async function loadSummary() {
    const current = generation;

    try {
      const result = await getWatchlistSummary();
      if (current !== generation) return;
      summary = result;
      emit();
    } catch {

    }
  }

  function refreshSummarySoon() {
    clearTimeout(summaryTimer);
    summaryTimer = setTimeout(loadSummary, 600);
  }

  async function flush() {
    flushTimer = null;
    if (!enabled) return;

    const keys = [...pending].filter((key) => !statuses.has(key));
    pending.clear();
    const current = generation;

    for (let i = 0; i < keys.length; i += LOOKUP_LIMIT) {
      const chunk = keys.slice(i, i + LOOKUP_LIMIT);
      chunk.forEach((key) => inFlight.add(key));

      try {
        const found = await lookupWatchlist(chunk);
        if (current !== generation) return;

        let changed = false;
        for (const key of chunk) {
          if (!statuses.has(key)) {
            statuses.set(key, found[key] ?? null);
            changed = true;
          }
        }
        if (changed) emit();
      } catch {

      } finally {
        chunk.forEach((key) => inFlight.delete(key));
      }
    }
  }

  function queue(keys) {
    for (const key of keys) {
      if (!statuses.has(key) && !inFlight.has(key)) pending.add(key);
    }

    if (pending.size > 0 && !flushTimer) {
      flushTimer = setTimeout(flush, 0);
    }
  }

  function change(item, status) {
    if (!enabled) {
      return Promise.resolve(false);
    }

    const key = watchlistKey(item);
    const known = statuses.has(key);
    const previous = statuses.get(key) ?? null;
    if (known && previous === status) {
      return Promise.resolve(true);
    }

    const version = (versions.get(key) ?? 0) + 1;
    versions.set(key, version);

    statuses.set(key, status);
    if (known) adjustSummary(previous, status);
    emit();

    const current = generation;
    const send = () =>
      status ? putWatchlistEntry(item.mediaType, item.tmdbId, status) : deleteWatchlistEntry(item.mediaType, item.tmdbId);

    const request = (chains.get(key) ?? Promise.resolve()).then(send);
    chains.set(key, request.catch(() => {}));

    request
      .then(() => {
        if (current === generation) refreshSummarySoon();
      })
      .catch((error) => {
        if (current !== generation || versions.get(key) !== version) return;

        if (known) {
          statuses.set(key, previous);
          adjustSummary(status, previous);
        } else {
          statuses.delete(key);
          queue([key]);
        }
        emit();

        emitError(
          error.response?.status === 404
            ? 'This title is no longer available.'
            : 'We couldn’t update your watchlist. Please try again.'
        );
      });


      return request.then(
        () => true,
        () => false
      );
  }

  async function applyAfterLogin(item) {
    const key=watchlistKey(item);
    const current=generation;
    applying.add(key);

    try{
      let found;
      try {
        found = await lookupWatchlist([key]);
      } catch {
        if(current === generation){
          emitError(`We couldn't add ${item.title} to your watchlist. Please try again`);
        }
        return;
      }
      if(current !==generation) return;

      if(found[key]){
        if(!versions.has(key)){
          statuses.set(key,found[key]);
          emit();
        }
        emitNotice(`${item.title} is already in your watchlist`);
        return;
      }

      if(!statuses.has(key)) {
        statuses.set(key,null);
      }

      const added=await change(item,'to_watch');
      if(added && current === generation) {
        emitNotice(`Added ${item.title} to your watchlist`);
      }
    } finally {
      applying.delete(key);
    }
  }

  function flushAfterLogin(){
    for(const item of afterLogin.values()) applyAfterLogin(item);
    afterLogin.clear();
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    subscribeErrors(listener) {
      errorListeners.add(listener);
      return () => errorListeners.delete(listener);
    },

    subscribeNotices(listener){
      noticeListeners.add(listener);
      return () => noticeListeners.delete(listener);
    },

    addAfterLogin(item) {
      const key=watchlistKey(item);
      if(afterLogin.has(key) || applying.has(key)) return;

      afterLogin.set(key,item);
      if(enabled) {
        flushAfterLogin();
      }
    },

    getStatus(key) {
      return enabled ? statuses.get(key) : null;
    },

    getSummary() {
      return summary;
    },

    isEnabled() {
      return enabled;
    },

    request(keys) {
      keys.forEach((key) => wanted.add(key));
      if (enabled) queue(keys);
    },

    seed(items) {
      if (!enabled) return;

      let changed = false;
      for (const item of items) {
        const key = watchlistKey(item);
        if (chains.has(key)) continue;
        statuses.set(key, item.watchlist?.status ?? null);
        changed = true;
      }
      if (changed) emit();
    },

    setStatus(item, status) {
      change(item, status);
    },

    remove(item) {
      change(item, null);
    },

    enable() {
      if (enabled) return;
      enabled = true;
      emit();
      loadSummary();
      queue([...wanted]);
      flushAfterLogin();
    },

    reset() {
      generation += 1;
      enabled = false;
      statuses = new Map();
      summary = null;
      pending.clear();
      inFlight.clear();
      versions.clear();
      chains.clear();
      afterLogin.clear();
      clearTimeout(flushTimer);
      clearTimeout(summaryTimer);
      flushTimer = null;
      emit();
    },
  };
}