
import pool from '../db/pool.js';
import {getTitle} from './titleService.js';

const PAGE_SIZE=20;

function toItem(row){
    return {
        tmdbId: row.tmdb_id,
        mediaType: row.media_type,
        title: row.title,
        posterPath: row.poster_path,
        backdropPath: row.backdrop_path,
        releaseDate: row.release_date,
        tmdbRating: row.tmdb_rating === null ? null : Number(row.tmdb_rating),
        genreIds: row.genre_ids ?? [],
        watchlist: {
            status: row.status,
            addedAt: row.added_at,
            updatedAt: row.updated_at,
        },
    };
}

const ENTRY_COLUMNS = `
  w.status, w.added_at, w.updated_at,
  t.tmdb_id, t.media_type, t.title, t.poster_path, t.backdrop_path,
  t.release_date, t.tmdb_rating,
  (
    SELECT COALESCE(array_agg(g.tmdb_id ORDER BY g.tmdb_id), '{}')
    FROM title_genres tg
    JOIN genres g ON g.id = tg.genre_id
    WHERE tg.title_id = t.id
  ) AS genre_ids
`;

export async function upsertEntry(userId,mediaType,tmdbId,status) {
    const title=await getTitle(tmdbId,mediaType);

    const result = await pool.query(
        `INSERT INTO watchlist (user_id, title_id, status)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, title_id) DO UPDATE
            SET status = EXCLUDED.status,
                updated_at = CASE
                    WHEN watchlist.status = EXCLUDED.status THEN watchlist.updated_at
                    ELSE NOW()
                END
        RETURNING (xmax = 0) AS created`,
        [userId, title.id, status]
  );

  const entry= await pool.query(
    `SELECT ${ENTRY_COLUMNS}
    FROM watchlist w
    JOIN titles t ON t.id = w.title_id
    WHERE w.user_id = $1 AND w.title_id = $2`,
    [userId,title.id]
  );

  return {created: result.rows[0].created, item: toItem(entry.rows[0])};
}

export async function removeEntry(userId, mediaType, tmdbId) {
  const result = await pool.query(
    `DELETE FROM watchlist w
     USING titles t
     WHERE w.title_id = t.id
       AND w.user_id = $1
       AND t.tmdb_id = $2
       AND t.media_type = $3`,
    [userId, tmdbId, mediaType]
  );

  return result.rowCount > 0;
}

export async function listEntries(userId, { status, page = 1 }) {
  const result = await pool.query(
    `SELECT ${ENTRY_COLUMNS}, COUNT(*) OVER () AS total
     FROM watchlist w
     JOIN titles t ON t.id = w.title_id
     WHERE w.user_id = $1
       AND ($2::text IS NULL OR w.status = $2)
     ORDER BY w.updated_at DESC, w.title_id DESC
     LIMIT $3 OFFSET $4`,
    [userId, status ?? null, PAGE_SIZE, (page - 1) * PAGE_SIZE]
  );

  let total= result.rows.length > 0 ? Number(result.rows[0].total) : 0;

  if(result.rows.length === 0 && page > 1){
    const count = await pool.query(
        `SELECT COUNT(*) AS total FROM watchlist
        WHERE user_id = $1 AND ($2::text IS NULL OR status = $2)`,
        [userId, status ?? null]
    );
    total=Number(count.rows[0].total);
  }

  return {
    page,
    totalPages: Math.ceil(total/PAGE_SIZE),
    totalResults: total,
    results: result.rows.map(toItem),
  };
}

export async function getSummary(userId){
    const result=await pool.query(
        `SELECT status, COUNT(*)::int AS count
        FROM watchlist
        WHERE user_id = $1
        GROUP BY status`,
        [userId]
    );

    const counts={to_watch: 0,watching: 0,watched: 0};
    for(const row of result.rows) counts[row.status] = row.count;

    return {
        toWatch: counts.to_watch,
        watching: counts.watching,
        watched: counts.watched,
        total: counts.to_watch + counts.watching + counts.watched,
    };
}

export async function lookupStatuses(userId, items) {
  const result = await pool.query(
    `SELECT t.media_type, t.tmdb_id, w.status
     FROM watchlist w
     JOIN titles t ON t.id = w.title_id
     WHERE w.user_id = $1
       AND (t.media_type, t.tmdb_id) IN (
         SELECT * FROM unnest($2::text[], $3::int[])
       )`,
    [userId, items.map((item) => item.mediaType), items.map((item) => item.tmdbId)]
  );

  const statuses = {};
  for (const row of result.rows) statuses[`${row.media_type}:${row.tmdb_id}`] = row.status;

  return statuses;
}