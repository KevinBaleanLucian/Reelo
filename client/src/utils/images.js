const BASE_URL = 'https://image.tmdb.org/t/p';

function imageUrl(path, size) {
  return path ? `${BASE_URL}/${size}${path}` : null;
}

export function posterUrl(path, size = 'w500') {
  return imageUrl(path, size);
}

export function backdropUrl(path, size = 'w1280') {
  return imageUrl(path, size);
}

export function profileUrl(path, size = 'w185') {
  return imageUrl(path, size);
}

export function logoUrl(path, size = 'w92') {
  return imageUrl(path, size);
}