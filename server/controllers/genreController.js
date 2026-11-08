import pool from "../db/pool.js";

const SIGNUP_GENRE_IDS=new Set([18,35,53,878,28,10749,27,12,9648,99,16,14]);

export async function listGenres(req,res){
    const result=await pool.query('SELECT id, tmdb_id, name FROM genres ORDER BY name');

    res.json({
        genres: result.rows.map((row)=> ({
            id: row.id,
            tmdbId: row.tmdb_id,
            name: row.name,
            featured: SIGNUP_GENRE_IDS.has(row.tmdb_id),
        })),
    });
}
