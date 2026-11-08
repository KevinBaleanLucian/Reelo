import 'dotenv/config';
import pool from '../db/pool.js';
import { syncGenres } from '../services/genreService.js';

try {
    const count=await syncGenres();
    console.log(`Synced ${count} genres`);
} catch (err){
    console.error('Genre sync failed',err);
    process.exitCode=1;
} finally {
    await pool.end();
}