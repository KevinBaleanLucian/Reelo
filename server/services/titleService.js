import pool from "../db/pool.js";
import { tmdbFetch, TmdbError } from "../utils/tmdb.js";

const CACHE_TTL_MS=7*24*60*60*1000;

export function normalizeListItem(item,mediaType){
    const isMovie = mediaType==='movie';
    return {
    tmdbId: item.id,
    mediaType,
    title: isMovie ? item.title : item.name,
    overview: item.overview || null,
    posterPath: item.poster_path || null,
    backdropPath: item.backdrop_path || null,
    releaseDate: (isMovie ? item.release_date : item.first_air_date) || null,
    tmdbRating: item.vote_count > 0 ? Math.round(item.vote_average * 10) / 10 : null,
    genreIds: item.genre_ids || [],
  };
}

function normalizeDetail(data,mediaType){
    const isMovie=mediaType==='movie';
    return {
    tmdbId: data.id,
    mediaType,
    title: isMovie ? data.title : data.name,
    originalTitle: (isMovie ? data.original_title : data.original_name) || null,
    overview: data.overview || null,
    posterPath: data.poster_path || null,
    backdropPath: data.backdrop_path || null,
    releaseDate: (isMovie ? data.release_date : data.first_air_date) || null,
    tmdbRating: data.vote_count > 0 ? Math.round(data.vote_average * 10) / 10 : null,
    runtime: isMovie ? data.runtime || null : null,
    numberOfSeasons: isMovie ? null : data.number_of_seasons ?? null,
    numberOfEpisodes: isMovie ? null : data.number_of_episodes ?? null,
    genreIds: (data.genres || []).map((g) => g.id),
  };
}

async function saveTitle(detail) {
    const client=await pool.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query(
            `INSERT INTO titles
                (tmdb_id, media_type, title, original_title, overview, poster_path, backdrop_path,
                release_date, tmdb_rating, runtime, number_of_seasons, number_of_episodes, fetched_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            ON CONFLICT (tmdb_id, media_type) DO UPDATE SET
                title = EXCLUDED.title,
                original_title = EXCLUDED.original_title,
                overview = EXCLUDED.overview,
                poster_path = EXCLUDED.poster_path,
                backdrop_path = EXCLUDED.backdrop_path,
                release_date = EXCLUDED.release_date,
                tmdb_rating = EXCLUDED.tmdb_rating,
                runtime = EXCLUDED.runtime,
                number_of_seasons = EXCLUDED.number_of_seasons,
                number_of_episodes = EXCLUDED.number_of_episodes,
                fetched_at = NOW()
       RETURNING *`,
      [
        detail.tmdbId, detail.mediaType, detail.title, detail.originalTitle, detail.overview,
        detail.posterPath, detail.backdropPath, detail.releaseDate, detail.tmdbRating,
        detail.runtime, detail.numberOfSeasons, detail.numberOfEpisodes,
      ]
    );
    const row=result.rows[0];
    await client.query('DELETE FROM title_genres WHERE title_id = $1',[row.id]);
    await client.query(
        `INSERT INTO title_genres (title_id, genre_id)
        SELECT $1, id FROM genres WHERE tmdb_id = ANY($2::int[])`,
        [row.id,detail.genreIds]
    );

    await client.query('COMMIT');
    return row;
    } catch (err){
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

async function toResponse(row){
    const genres=await pool.query(
        `SELECT g.id, g.tmdb_id, g.name
        FROM title_genres tg JOIN genres g ON g.id = tg.genre_id
        WHERE tg.title_id = $1
        ORDER BY g.name`,
        [row.id]

    );

    return {
    id: row.id,
    tmdbId: row.tmdb_id,
    mediaType: row.media_type,
    title: row.title,
    originalTitle: row.original_title,
    overview: row.overview,
    posterPath: row.poster_path,
    backdropPath: row.backdrop_path,
    releaseDate: row.release_date,
    tmdbRating: row.tmdb_rating === null ? null : Number(row.tmdb_rating),
    runtime: row.runtime,
    numberOfSeasons: row.number_of_seasons,
    numberOfEpisodes: row.number_of_episodes,
    genres: genres.rows.map((g) => ({ id: g.id, tmdbId: g.tmdb_id, name: g.name })),
  };

}

export async function getTitle(tmdbId,mediaType){
    const cached=await pool.query(
        'SELECT * FROM titles WHERE tmdb_id = $1 AND media_type = $2',
        [tmdbId,mediaType]
    );
    const cachedRow=cached.rows[0];

    if (cachedRow && Date.now() - new Date(cachedRow.fetched_at).getTime() < CACHE_TTL_MS){
        return toResponse(cachedRow);
    }
    try {
        const data=await tmdbFetch(`/${mediaType}/${tmdbId}`);
        const row=await saveTitle(normalizeDetail(data,mediaType));
        return toResponse(row);
    } catch (err){
        const tmdbUnavailable= err instanceof TmdbError && err.status !== 404;
        if (cachedRow && tmdbUnavailable){
            return toResponse(cachedRow);
        }
        throw err;
    }
}

export async function listTitles(mediaType,category,page){
    const data=await tmdbFetch(`/${mediaType}/${category}`, {page});
    return {
        page: data.page,
        totalPages: Math.min(data.total_pages,500),
        results: data.results.map((item)=> normalizeListItem(item,mediaType)),
    };


}
export async function searchTitles(query,page){
    const data=await tmdbFetch('/search/multi',{query, page, include_adult: 'false'});

    const results=data.results
    .filter((item)=> item.media_type ==='movie' || item.media_type ==='tv')
    .map((item)=> normalizeListItem(item,item.media_type));

    return {
        page: data.page,
        totalPages: Math.min(data.total_pages,500),
        results,
    };
}

export async function trendingTitles(type,page){
    const data= await tmdbFetch(`/trending/${type}/week`,{page});
    const results=data.results.map((item) => ({
        item,
        mediaType: item.media_type || (type==='all' ? null : type),
    }))
    .filter(({mediaType}) => mediaType ==='movie' || mediaType==='tv')
    .map(({item,mediaType}) => normalizeListItem(item,mediaType));

    return {
        page:data.page,
        totalPages: Math.min(data.total_pages,500),
        results,
    };
}
