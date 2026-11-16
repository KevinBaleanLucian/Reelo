import api from './api.js';
import { getTypeGenres } from './titleApi.js';

let listPromise = null;

export function getGenreList() {
  if (!listPromise) {
    listPromise = api
      .get('/genres')
      .then(({ data }) => data.genres)
      .catch((error) => {
        listPromise = null;
        throw error;
      });
  }

  return listPromise;
}

let mapPromise = null;

export function getGenreMap() {
  if (!mapPromise) {
    mapPromise = getGenreList()
      .then((genres) => new Map(genres.map((genre) => [genre.tmdbId, genre.name])))
      .catch((error) => {
        mapPromise = null;
        throw error;
      });
  }

  return mapPromise;
}

const typeCache = new Map();

export function getTypeGenreList(type) {
  if (!typeCache.has(type)) {
    const promise = getTypeGenres(type).catch((error) => {
      typeCache.delete(type);
      throw error;
    });
    typeCache.set(type, promise);
  }

  return typeCache.get(type);
}