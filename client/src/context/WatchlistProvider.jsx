import { useEffect,useState } from "react";
import { WatchlistContext } from "./WatchlistContext.js";
import {useAuth} from '../hooks/useAuth.js';
import { createWatchlistStore } from "../store/watchlistStore.js";

export function WatchlistProvider({children}) {
    const {status,user}=useAuth();
    const [store]=useState(createWatchlistStore);
    const userId=status === 'authenticated' ? user?.id : null;

    useEffect(() => {
        if(userId==null){
            store.reset();
            return undefined;
        }

        store.enable();
        return () => store.reset();
    }, [store,userId]);

    return <WatchlistContext.Provider value={store}>{children}</WatchlistContext.Provider>;
}