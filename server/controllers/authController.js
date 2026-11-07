import bcrypt from 'bcrypt';
import pool from '../db/pool.js';

const SALT_ROUNDS=12;

export async function register(req,res){
    const {firstName, lastName, username, email, password, dateOfBirth, country}=req.body;

    const existing=await pool.query(
        'SELECT email, username FROM users WHERE email = $1 OR username = $2',
        [email,username]
    );

    if(existing.rows.length>0){
        const errors={};
        for(const row of existing.rows){
            if (row.email === email) errors.email = 'This email is already registered';
            if (row.username === username) errors.username = 'This username is taken';
        }
        return res.status(409).json({message: 'Account already exists',errors});
    }

    const passwordHash=await bcrypt.hash(password,SALT_ROUNDS);

    try {
    const result = await pool.query(
      `INSERT INTO users
         (username, first_name, last_name, email, password_hash, date_of_birth, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, username, first_name, last_name, email, country, created_at`,
      [username, firstName, lastName, email, passwordHash, dateOfBirth ?? null, country || null]
    );

    const user=result.rows[0];

    return res.status(201).json({
        user: {
            id: user.id,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            country: user.country,
            createdAt: user.created_at,
        },
    });

    } catch (err){
        if(err.code==='23505'){
            return res.status(409).json({message:'Account already exists'});
        }
        throw err;
    }
}