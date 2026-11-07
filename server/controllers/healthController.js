import pool from "../db/pool.js";

export async function checkHealth(req,res) {
    const result=await pool.query('SELECT NOW() AS time');
    
    res.json({
        status: 'ok',
        database: 'connected',
        time: result.rows[0].time,
    });
}
