import pool from '../db/pool.js';
import { tmdbFetch } from '../utils/tmdb.js';

export async function syncGenres() {
    const [movie,tv]=await Promise.all([
        tmdbFetch('/genre/movie/list'),
        tmdbFetch('/genre/tv/list'),
    ]);

    const byId=new Map();
    for(const genre of [...movie.genres, ...tv.genres]){
        if(!byId.has(genre.id)){
            byId.set(genre.id,genre.name);
        }
    }

    const ids= [...byId.keys()];
    const names=[...byId.values()];

    await pool.query(
        `INSERT INTO genres (tmdb_id, name)
        SELECT * FROM unnest($1::int[], $2::text[])
        ON CONFLICT (tmdb_id) DO UPDATE SET name = EXCLUDED.name`,
        [ids,names]
        
    );
    return ids.length;
}