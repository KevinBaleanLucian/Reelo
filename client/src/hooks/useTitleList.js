import { useEffect,useState } from "react";
import { getPopular,getTopRated,getTrending } from "../services/titleApi.js";

function load(source,type){
    if (source==='trending') return getTrending({type});
    if (source==='top-rated') return getTopRated(type);
    return getPopular(type);
}

export function useTitleList(source,type,limit=20){
    const [attempt, setAttempt] = useState(0);
    const [result,setResult]=useState({key:null, items: [],failed:false});

    const key=`${source}:${type}:${attempt}`;

    useEffect(() => {
        let active=true;

        load(source,type)
            .then((data) =>{
                if (active) setResult({key, items: data.results.slice(0,limit), failed:false});
            })
            .catch(() =>{
                if (active) setResult({key, itemd:[],failed:true});
            });
        
            return () =>{
                active=false;
            };
    }, [key,source,type,limit]);

    const status=result.key !== key ? 'loading' : result.failed ? 'error' : 'ready';

    return {
        items: result.items,
        status,
        retry: () => setAttempt((n)=> n+1),
    };

}