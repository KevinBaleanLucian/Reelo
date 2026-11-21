import pool from '../db/pool.js';
import { getTitle } from './titleService.js';
import { HttpError } from '../utils/httpError.js';

const PAGE_SIZE = 10;

const ORDER_BY = {
  recent: 'r.created_at DESC, r.id DESC',
  helpful: 'helpful_count DESC, r.created_at DESC, r.id DESC',
};

function toReview(row) {
  return {
    id: row.id,
    rating: row.rating,
    text: row.review_text,
    containsSpoilers: row.contains_spoilers,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    helpfulCount: row.helpful_count ?? 0,
    votedHelpful: row.voted ?? false,
    author: {
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      avatarUrl: row.avatar_url,
    },
  };
}

const REVIEW_COLUMNS = `
  r.id, r.rating, r.review_text, r.contains_spoilers, r.created_at, r.updated_at,
  u.username, u.first_name, u.last_name, u.avatar_url,
  (SELECT COUNT(*)::int FROM review_helpful h WHERE h.review_id = r.id) AS helpful_count
`;

async function findTitleId(mediaType, tmdbId) {
  const result = await pool.query('SELECT id FROM titles WHERE tmdb_id = $1 AND media_type = $2', [
    tmdbId,
    mediaType,
  ]);
  return result.rows[0]?.id ?? null;
}

async function getStats(titleId) {
  const distribution = {};
  for (let rating = 1; rating <= 10; rating += 1) distribution[rating] = 0;

  if (!titleId) return { count: 0, average: null, distribution };

  const result = await pool.query(
    'SELECT rating, COUNT(*)::int AS count FROM reviews WHERE title_id = $1 GROUP BY rating',
    [titleId]
  );

  let count = 0;
  let sum = 0;
  for (const row of result.rows) {
    distribution[row.rating] = row.count;
    count += row.count;
    sum += row.rating * row.count;
  }

  return {
    count,
    average: count > 0 ? Math.round((sum / count) * 10) / 10 : null,
    distribution,
  };
}

export async function listReviews(mediaType, tmdbId, { sort = 'recent', page = 1, viewerId = null }) {
  const titleId = await findTitleId(mediaType, tmdbId);
  const stats = await getStats(titleId);

  if (!titleId) {
    return { stats, page, totalPages: 0, totalResults: 0, results: [] };
  }

  const result = await pool.query(
    `SELECT ${REVIEW_COLUMNS},
            EXISTS (
              SELECT 1 FROM review_helpful h WHERE h.review_id = r.id AND h.user_id = $2
            ) AS voted,
            COUNT(*) OVER () AS total
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.title_id = $1
       AND r.review_text IS NOT NULL
       AND ($2::int IS NULL OR r.user_id <> $2)
     ORDER BY ${ORDER_BY[sort]}
     LIMIT $3 OFFSET $4`,
    [titleId, viewerId, PAGE_SIZE, (page - 1) * PAGE_SIZE]
  );

  let total = result.rows.length > 0 ? Number(result.rows[0].total) : 0;

  if (result.rows.length === 0 && page > 1) {
    const count = await pool.query(
      `SELECT COUNT(*)::int AS total FROM reviews
       WHERE title_id = $1 AND review_text IS NOT NULL AND ($2::int IS NULL OR user_id <> $2)`,
      [titleId, viewerId]
    );
    total = count.rows[0].total;
  }

  return {
    stats,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
    totalResults: total,
    results: result.rows.map(toReview),
  };
}

export async function getMyReview(userId, mediaType, tmdbId) {
  const result = await pool.query(
    `SELECT ${REVIEW_COLUMNS}
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     JOIN titles t ON t.id = r.title_id
     WHERE r.user_id = $1 AND t.tmdb_id = $2 AND t.media_type = $3`,
    [userId, tmdbId, mediaType]
  );

  return result.rows[0] ? toReview(result.rows[0]) : null;
}

export async function saveMyReview(userId, mediaType, tmdbId, { rating, text, containsSpoilers }) {
  const title = await getTitle(tmdbId, mediaType);
  const spoilers = text ? containsSpoilers : false;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const saved = await client.query(
      `INSERT INTO reviews (user_id, title_id, rating, review_text, contains_spoilers)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, title_id) DO UPDATE
         SET rating = EXCLUDED.rating,
             review_text = EXCLUDED.review_text,
             contains_spoilers = EXCLUDED.contains_spoilers,
             updated_at = NOW()
       RETURNING (xmax = 0) AS created`,
      [userId, title.id, rating, text, spoilers]
    );

    const previous = await client.query(
      'SELECT status FROM watchlist WHERE user_id = $1 AND title_id = $2 FOR UPDATE',
      [userId, title.id]
    );
    const previousStatus = previous.rows[0]?.status ?? null;

    if (previousStatus !== 'watched') {
      await client.query(
        `INSERT INTO watchlist (user_id, title_id, status)
         VALUES ($1, $2, 'watched')
         ON CONFLICT (user_id, title_id) DO UPDATE
           SET status = 'watched', updated_at = NOW()`,
        [userId, title.id]
      );
    }

    await client.query('COMMIT');

    return {
      created: saved.rows[0].created,
      review: await getMyReview(userId, mediaType, tmdbId),
      watchlist: { status: 'watched', previousStatus },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteMyReview(userId, mediaType, tmdbId) {
  const result = await pool.query(
    `DELETE FROM reviews r
     USING titles t
     WHERE r.title_id = t.id AND r.user_id = $1 AND t.tmdb_id = $2 AND t.media_type = $3`,
    [userId, tmdbId, mediaType]
  );

  return result.rowCount > 0;
}

export async function setHelpful(userId, reviewId, helpful) {
  const review = await pool.query('SELECT user_id FROM reviews WHERE id = $1', [reviewId]);

  if (!review.rows[0]) {
    throw new HttpError(404, 'Review not found');
  }

  if (review.rows[0].user_id === userId) {
    throw new HttpError(403, 'You can’t vote on your own review');
  }

  if (helpful) {
    await pool.query(
      'INSERT INTO review_helpful (review_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [reviewId, userId]
    );
  } else {
    await pool.query('DELETE FROM review_helpful WHERE review_id = $1 AND user_id = $2', [reviewId, userId]);
  }

  const count = await pool.query('SELECT COUNT(*)::int AS count FROM review_helpful WHERE review_id = $1', [
    reviewId,
  ]);

  return { helpfulCount: count.rows[0].count, votedHelpful: helpful };
}