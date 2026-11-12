const BASE_ULR='https://image.tmdb.org/t/p';

export function posterUrl(path,size='w500'){
    return path ? `${BASE_ULR}/${size}${path}`: null;
}

export function backdropUrl(path,size='w1280'){
    return path ? `${BASE_ULR}/${size}${path}` : null;
}