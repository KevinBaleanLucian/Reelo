import 'dotenv/config';
import pool from '../db/pool.js';
import {
  deleteMyReview,
  getMyReview,
  listReviews,
  saveMyReview,
  setHelpful,
} from '../services/reviewService.js';

const [userA, userB] = process.argv.slice(2).map(Number);

if (!userA || !userB) {
  console.log('Usage: node scripts/tryReviews.js USER_A USER_B');
  process.exit(1);
}

try {
  await pool.query(
    `DELETE FROM watchlist w USING titles t
     WHERE w.title_id = t.id AND t.tmdb_id = 550 AND t.media_type = 'movie' AND w.user_id IN ($1, $2)`,
    [userA, userB]
  );
  await pool.query(
    `DELETE FROM reviews r USING titles t
     WHERE r.title_id = t.id AND t.tmdb_id = 550 AND t.media_type = 'movie' AND r.user_id IN ($1, $2)`,
    [userA, userB]
  );

  let r = await saveMyReview(userA, 'movie', 550, { rating: 9, text: 'A classic.', containsSpoilers: false });
  console.log('1. A reviews Fight Club:', r.created, r.review.rating, r.watchlist);

  r = await saveMyReview(userA, 'movie', 550, { rating: 8, text: 'Still a classic.', containsSpoilers: true });
  console.log('2. A edits the review:', r.created, r.review.rating, r.review.containsSpoilers, r.watchlist);

  r = await saveMyReview(userB, 'movie', 550, { rating: 6, text: null, containsSpoilers: true });
  console.log('3. B rates without text:', r.review.text, r.review.containsSpoilers, r.watchlist);

  let list = await listReviews('movie', 550, {});
  console.log('4. Visitor list:', list.stats.count, list.stats.average, list.totalResults, list.results.map((x) => x.author.username));
  console.log('   Distribution 6 and 8:', list.stats.distribution[6], list.stats.distribution[8]);

  list = await listReviews('movie', 550, { viewerId: userA });
  console.log('5. A sees the list without own review:', list.totalResults);

  const reviewId = (await getMyReview(userA, 'movie', 550)).id;

  console.log('6. B votes helpful:', await setHelpful(userB, reviewId, true));
  console.log('7. B votes again:', await setHelpful(userB, reviewId, true));

  list = await listReviews('movie', 550, { viewerId: userB, sort: 'helpful' });
  console.log('8. B sees the vote:', list.results[0]?.helpfulCount, list.results[0]?.votedHelpful);

  try {
    await setHelpful(userA, reviewId, true);
  } catch (error) {
    console.log('9. A votes own review:', error.status, error.message);
  }

  try {
    await setHelpful(userB, 999999999, true);
  } catch (error) {
    console.log('10. Unknown review:', error.status, error.message);
  }

  console.log('11. B removes the vote:', await setHelpful(userB, reviewId, false));

  console.log('12. Unknown title list:', await listReviews('movie', 99999999, {}));

  try {
    await saveMyReview(userA, 'movie', 99999999, { rating: 5, text: null, containsSpoilers: false });
  } catch (error) {
    console.log('13. Review an unknown title:', error.name, error.status);
  }

  console.log('14. A deletes the review:', await deleteMyReview(userA, 'movie', 550));
  console.log('15. A has no review now:', await getMyReview(userA, 'movie', 550));

  const left = await pool.query(
    `SELECT w.user_id, w.status FROM watchlist w JOIN titles t ON t.id = w.title_id
     WHERE t.tmdb_id = 550 AND t.media_type = 'movie' AND w.user_id IN ($1, $2) ORDER BY w.user_id`,
    [userA, userB]
  );
  console.log('16. Watchlist after delete:', left.rows);
} finally {
  await pool.end();
}