const GENRE_LABELS={
    'Science Fiction' : 'Sci-fi',
};

export function formatYear(releaseDate){
    return releaseDate ? releaseDate.slice(0,4) : '';
}

export function formatRating(rating){
    return typeof rating ==='number' ? rating.toFixed(1) : null;
}

export function formatGenres(genreIds,genreMap,limit=2){
    if(!genreMap || !genreIds) return '';

    return genreIds.map((id)=> genreMap.get(id)).filter(Boolean).slice(0,limit)
    .map((name)=> GENRE_LABELS[name] || name).join(' / ');
}

const regionNames=new Intl.DisplayNames(['en'], {type: 'region',fallback: 'code'});

export function formatRuntime(minutes) {
    if(!minutes || minutes<=0) return '';

    const hours=Math.floor(minutes/60);
    const rest=minutes%60;

    if(hours===0) return `${rest}m`;
    return rest ===0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export function formatSeasons(count) {
    if(!count) return '';
    return `${count} ${count === 1 ? 'season' : 'seasons'}`;
}

export function formatGenreNames(genres,limit=3){
    return (genres || []).slice(0,limit).map((genre) => GENRE_LABELS[genre.name] || genre.name).join(' / ');
}

export function formatRegionName(code) {
    try {
        return regionNames.of(code) || code;
    } catch {
        return code;
    }
}