import { useEffect,useState } from "react";
import { getGenreMap } from "../services/genreService.js";

export function useGenreMap() {
    const [genreMap,setGenreMap]=useState(null);

    useEffect(() => {
        let active=true;

        getGenreMap().then((map)=>{
            if(active) setGenreMap(map);
        }).catch(()=>{});

        return () =>{
            active=false;
        };
        
    }, []);

    return genreMap;
}