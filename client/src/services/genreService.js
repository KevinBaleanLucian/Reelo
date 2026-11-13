import api from "./api.js";
import { getTypeGenres } from "./titleApi.js";
let cache=null;
const typeCache=new Map();

export function getGenreMap(){
    if(!cache){
        cache=api.get('/genres').then(({data})=>{
            const map=new Map();
            for (const genre of data.genres){
                map.set(genre.tmdbId,genre.name);
            }
            return map;
        })
        .catch((error) => {
            cache=null;
            throw error;
        });
    }
    return cache;
}

export function getTypeGenreList(type){
    if(!typeCache.has(type)) {
        const promise=getTypeGenres(type).catch((error) => {
            typeCache.delete(type);
            throw error;
        });
        typeCache.set(type,promise);
    }

    return typeCache.get(type);
}

