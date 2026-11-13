import api from './api.js';

export async function getTrending({type='all',page=1}={}){
    const {data}=await api.get('/titles/trending', {params: {type,page}});
    return data;
}

export async function getPopular(type,page=1){
    const {data}=await api.get(`/titles/${type}/popular`,{params: {page}});
    return data;
}

export async function getTopRated(type,page=1){
    const {data} =await api.get(`/titles/${type}/top-rated`, {params: {page}});
    return data;
}

export async function searchTitles(q,page=1){
    const {data} = await api.get('/titles/search', {params :{q,page}});
    return data;
}

export async function getTitleDetails(type,id){
    const {data} = await api.get(`/titles/${type}/${id}`);
    return data.title;
}

export async function getDiscover(type, { genre, year, sort, rating, runtime, lang, page = 1 } = {}) {
  const { data } = await api.get(`/titles/${type}/discover`, {
    params: { genre, year, sort, rating, runtime, lang, page },
  });
  return data;
}

export async function getTypeGenres(type) {
    const {data} = await api.get(`/titles/${type}/genres`);
    return data.genres;
}