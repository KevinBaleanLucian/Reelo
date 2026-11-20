import { useContext,useEffect,useSyncExternalStore } from "react";
import { WatchlistContext } from "../context/WatchlistContext.js";
import { watchlistKey } from "../store/watchlistStore.js";

function useWatchlistStore() {
    const store=useContext(WatchlistContext);

    if(!store){
        throw new Error('Watchlist hooks must be used inside <WatchlistProvider>');
    }

    return store;
}

export function useWatchlistStatus(item) {
  const store = useWatchlistStore();
  const key = watchlistKey(item);

  useEffect(() => {
    store.request([key]);
  }, [store, key]);

  return useSyncExternalStore(
    store.subscribe,
    () => store.getStatus(key),
    () => undefined
  );
}

export function useWatchlistSummary() {
  const store = useWatchlistStore();
  return useSyncExternalStore(store.subscribe, store.getSummary, () => null);
}

export function useWatchlistActions() {
  const store = useWatchlistStore();
  return { 
    setStatus: store.setStatus,
    remove: store.remove,
    seed: store.seed,
    addAfterLogin:store.addAfterLogin,
  };
}

export function useWatchlistErrors(onError) {
  const store = useWatchlistStore();

  useEffect(() => store.subscribeErrors(onError), [store, onError]);
}

export function useWatchlistNotices(onNotice){
  const store=useWatchlistStore();

  useEffect(() => store.subscribeNotices(onNotice), [store,onNotice]);
}