import app from './app.js';
import pool from './db/pool.js';

const PORT=process.env.PORT || 5000;

async function start(){
    try{
        await pool.query('SELECT 1');
        console.log('Database connected');

        app.listen(PORT, () =>{
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err){
        console.error('Could not connect to the database:', err.message);
        process.exit(1);
    }
}

start();