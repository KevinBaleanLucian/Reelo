import api from "./api.js";

let cache=null;

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