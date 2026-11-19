import 'dotenv/config';
import pool from '../db/pool.js';
import {
  getSummary,
  listEntries,
  lookupStatuses,
  removeEntry,
  upsertEntry,
} from '../services/watchlistService.js';

const userId = Number(process.argv[2]);

if (!userId) {
  console.log('Usage: node scripts/tryWatchlist.js USER_ID');
  process.exit(1);
}

try {
  let r = await upsertEntry(userId, 'movie', 550, 'to_watch');
  console.log('1. Add Fight Club:', r.created, r.item.title, r.item.watchlist.status);

  r = await upsertEntry(userId, 'movie', 550, 'to_watch');
  console.log('2. Same status again:', r.created, r.item.watchlist.status);

  r = await upsertEntry(userId, 'movie', 550, 'watched');
  console.log('3. Mark watched:', r.created, r.item.watchlist.status);

  r = await upsertEntry(userId, 'tv', 1396, 'watching');
  console.log('4. Add Breaking Bad:', r.created, r.item.title, r.item.genreIds);

  console.log('5. Summary:', await getSummary(userId));

  const all = await listEntries(userId, {});
  console.log('6. List:', all.totalResults, all.results.map((x) => `${x.title} (${x.watchlist.status})`));

  const watched = await listEntries(userId, { status: 'watched' });
  console.log('7. Only watched:', watched.results.map((x) => x.title));

  console.log('8. Page after the end:', await listEntries(userId, { page: 9 }));

  console.log(
    '9. Lookup:',
    await lookupStatuses(userId, [
      { mediaType: 'movie', tmdbId: 550 },
      { mediaType: 'tv', tmdbId: 1396 },
      { mediaType: 'movie', tmdbId: 27205 },
    ])
  );

  console.log('10. Remove Fight Club:', await removeEntry(userId, 'movie', 550));
  console.log('11. Remove again:', await removeEntry(userId, 'movie', 550));
  console.log('12. Remove Breaking Bad:', await removeEntry(userId, 'tv', 1396));

  try {
    await upsertEntry(userId, 'movie', 99999999, 'to_watch');
  } catch (error) {
    console.log('13. Unknown title:', error.name, error.status);
  }
} finally {
  await pool.end();
}