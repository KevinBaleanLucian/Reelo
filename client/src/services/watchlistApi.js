import api from './api.js';

export async function putWatchlistEntry(type,tmdbId,status){
    const {data} = await api.put(`/watchlist/${type}/${tmdbId}`, {status});
    return data.item;
}

export async function deleteWatchlistEntry(type,tmdbId){
    await api.delete(`/watchlist/${type}/${tmdbId}`);
}

export async function getWatchlist({status, page=1} = {}){
    const {data} = await api.get('/watchlist', {params: {status,page}});
    return data;
}

export async function getWatchlistSummary() {
    const {data} = await api.get('/watchlist/summary');
    return data.summary;
}

export async function lookupWatchlist(keys) {
    const {data} = await api.get('/watchlist/lookup', {params: {items: keys.join(',')}});
    return data.statuses;
}