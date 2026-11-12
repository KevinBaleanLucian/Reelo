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