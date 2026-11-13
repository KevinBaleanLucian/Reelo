import { useEffect,useState } from "react";
import {searchTitles} from '../services/titleApi.js';
import { useDebouncedValue } from "./useDebouncedValue.js";

const MIN_LENGTH=2;

export function useSearchSuggestions(term,limit=6){
    const debounced=useDebouncedValue(term,300);
    const [result,setResult]=useState({key:null, items:[],failed:false});

    useEffect(() => {
        if(debounced.length < MIN_LENGTH) return undefined;

        let active=true;

        searchTitles(debounced).then((data)=> {
            if(active) setResult({key:debounced,items:data.results.slice(0,limit),failed:false});
        })
        .catch(() => {
            if(active) setResult({key:debounced,items:[],failed:true});
        });

        return () =>{
            active =false;
        };
    }, [debounced,limit]);

    let status='idle';
    if(term.length >= MIN_LENGTH){
        status=debounced !== term || result.key !== debounced ? 'loading' : result.failed ? 'error' : 'ready';
    }
    return {items:status ==='ready' ? result.items : [], status};
}
