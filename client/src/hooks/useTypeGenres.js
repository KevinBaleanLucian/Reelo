import { useEffect,useState } from "react";
import { getTypeGenreList } from "../services/genreService.js";

export function useTypeGenres(type) {
    const [result,setResult]=useState({type:null, genres: []});

    useEffect(() => {
        let active=true;

        getTypeGenreList(type)
        .then((genres) => {
            if (active) setResult({type,genres});
        })
        .catch(()=>{});

        return () =>{
            active=false;
        };
    }, [type]);

    return result.type === type ? result.genres : [];
}