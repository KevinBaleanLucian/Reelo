import {tmdbFetch} from '../utils/tmdb.js';
import {normalizeListItem} from './titleService.js';

const EXTRAS_TTL_MS=6*60*60*1000;
const MAX_CACHED=500;
const YOUTUBE_KEY= /^[A-Za-z0-9_-]{11}$/;
const SAFE_LINK= /^https:\/\/www\.themoviedb\.org\//;
const cache=new Map();

function watchRegion() {
    const value=(process.env.WATCH_REGION || 'GB').toUpperCase();
    return /^[A-Z]{2}$/.test(value) ? value : 'GB';
}

function pickTrailer(videos){
    const score=(video) => (video.type ==='Trailer' ? 0:2) + (video.official ? 0:1);

    const best =(videos || []).filter((video) => 
        video.site ==='YouTube' &&
        YOUTUBE_KEY.test(video.key || '') &&
        (video.type === 'Trailer' || video.type ==='Teaser')
    )
    .sort((a,b) => score(a)-score(b) || String(b.published_at).localeCompare(String(a.published_at)))[0];

    return best ? {key:best.key, name:best.name} : null;
}

function person(source,job){
    return {id: source.id, name:source.name, job, profilePath: source.profile_path || null};
}

function pickCrew(data,mediaType) {
    if(mediaType ==='tv'){
        return (data.created_by || []).slice(0,2).map((creator) => person(creator,'Creator'));
    }

    const directors=[];
    for(const member of data.credits?.crew || []){
        if(member.job ==='Director' && !directors.some((d) => d.id ===member.id)){
            directors.push(person(member,'Director'));
        }
    }
    return directors.slice(0,2);
}

function pickCertification(data,mediaType,region){
    if(mediaType==='tv'){
        const entry=(data.content_ratings?.results || []).find((r) => r.iso_3166_1 ===region);
        return entry?.rating || null;
    }

    const entry=(data.release_dates?.results || []).find((r) => r.iso_3166_1 === region);
    return (entry?.release_dates || []).find((r)=> r.certification)?.certification || null;
}

function pickSimilar(data,mediaType){
    const pool=data.recommendations?.results?.length ? data.recommendations.results : data.similar?.results || [];

    return pool.filter((item)=> item.poster_path).slice(0,12).map((item) => normalizeListItem(item,mediaType));
}

function pickWatch(providers,region) {
    const entry=providers?.results?.[region];

    const list=(items) => (items || []).slice().sort((a,b) => (a.display_priority ?? 999)-(b.display_priority ?? 999))
    .map((p) => ({id:p.provider_id, name:p.provider_name,logoPath:p.logo_path || null}));

    return {
        region,
        link: entry?.link && SAFE_LINK.test(entry.link) ? entry.link : null,
        groups: {
            stream: list(entry?.flatrate),
            free: list(entry?.free),
            ads: list(entry?.ads),
            rent: list(entry?.rent),
            buy: list(entry?.buy),
        },
    };
}

async function load(tmdbId,mediaType,region) {
    const append= mediaType==='movie' ? 'credits,videos,recommendations,similar,release_dates' : 'credits,videos,recommendations,similar,content_ratings';

    const [data,providers]=await Promise.all([
        tmdbFetch(`/${mediaType}/${tmdbId}`, {
            append_to_response: append,
            include_video_language: 'en,null',
        }),
        tmdbFetch(`/${mediaType}/${tmdbId}/watch/providers`).catch(() => null),
    ]);

  return {
    tagline: data.tagline || null,
    certification: pickCertification(data, mediaType, region),
    trailer: pickTrailer(data.videos?.results),
    cast: (data.credits?.cast || []).slice(0, 8).map((member) => ({
      id: member.id,
      name: member.name,
      character: member.character || null,
      profilePath: member.profile_path || null,
    })),
    crew: pickCrew(data, mediaType),
    similar: pickSimilar(data, mediaType),
    watch: pickWatch(providers, region),
  };
}

export function getTitleExtras(tmdbId, mediaType, requestedRegion) {
  const region = requestedRegion || watchRegion();
  const key = `${mediaType}:${tmdbId}:${region}`;

  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < EXTRAS_TTL_MS) {
    return hit.promise;
  }

  const promise = load(tmdbId, mediaType, region).catch((error) => {
    cache.delete(key);
    throw error;
  });

  cache.set(key, { promise, at: Date.now() });

  if (cache.size > MAX_CACHED) {
    cache.delete(cache.keys().next().value);
  }

  return promise;
}