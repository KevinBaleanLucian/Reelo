
import { useCallback,useEffect,useRef,useState } from "react";

function mergeUnique(current,incoming){
    const seen=new Set(current.map((item) => `${item.mediaType}-${item.tmdbId}`));
    const fresh=incoming.filter((item)=> !seen.has(`${item.mediaType}-${item.tmdbId}`));

    return [...current,...fresh];
}

const emptyState={
    key:null,
    items: [],
    page: 0,
    totalPages: 0,
    failed: false,
    loadingMore: false,
    moreFailed: false,
};

export function usePagedTitles(key,fetchPage){
    const fetchRef=useRef(fetchPage);
    const [attempt, setAttempt]=useState(0);
    const [state,setState]=useState(emptyState);

    useEffect(() => {
        fetchRef.current=fetchPage;
    });

    const requestKey= `${key}:${attempt}`;

    useEffect(() => {
        let active= true;

        fetchRef.current(1).then((data) => {
            if (!active) return;
            setState({
                ...emptyState,
                key: requestKey,
                items: mergeUnique([],data.results),
                page: data.page,
                totalPages: data.totalPages,
            });
        })
        .catch(() => {
            if (active) setState({...emptyState, key: requestKey, failed:true});
        });

        return () =>{
            active=false;
        };
    }, [requestKey]);

    const loadMore=useCallback(() => {
        if(state.key !== requestKey || state.failed || state.loadingMore) return;
        if(state.page >= state.totalPages) return;

        setState((current)=> ({...current,loadingMore: true,moreFailed: false}));

        fetchRef.current(state.page+1)
        .then((data)=> {
            setState((current) => current.key !== requestKey ? current : {
                ...current, 
                items:mergeUnique(current.items,data.results),
                page:data.page,
                totalPages:data.totalPages,
                loadingMore:false,
            }
        );
        })
        .catch(()=> {
            setState((current) => current.key !== requestKey ? current : {...current, loadingMore: false, moreFailed: true}
        );
        });
    }, [state,requestKey]);
    
    const retry=useCallback(() => setAttempt((n)=> n+1), []);

    const status=state.key !== requestKey ? 'loading' : state.failed ? 'error' : 'ready';

    return {
        items: status ==='ready' ? state.items : [],
        status,
        hasMore: status ==='ready' && state.page < state.totalPages,
        loadingMore: state.loadingMore,
        moreFailed: state.moreFailed,
        loadMore,
        retry,
    };


}