import bcrypt from 'bcrypt';
import pool from '../db/pool.js';
import { signToken } from '../utils/jwt.js';

const SALT_ROUNDS=12;

const DUMMY_HASH=bcrypt.hashSync('dummy-password-for-timing',SALT_ROUNDS);

function toPublicUser(row){
    return {
        id:row.id,
        username:row.username,
        firstName:row.first_name,
        lastName:row.lastName,
        email:row.email,
        country:row.country,
        createdAt:row.created_at,
    };

}

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

export async function login(req,res){
    const {email,password,rememberMe}=req.body;

    const result=await pool.query(
        `SELECT id,username,first_name,last_name,email,country,created_at,password_hash
        FROM users
        WHERE email =$1`,
        [email]
    );
    const user=result.rows[0];

    const passwordMatches=await bcrypt.compare(
        password, user ? user.password_hash : DUMMY_HASH
    );
    if(!user || !passwordMatches){
        return res.status(401).json({message: 'Invalid email or password'});
    }
    const token=signToken(user.id, rememberMe ? process.env.JWT_EXPIRES_IN || '7d' : '1d');

    return res.json({
        token,
        user:toPublicUser(user),
    });


}

export async function getMe(req,res){
    const result=await pool.query(
        `SELECT id,username,first_name,last_name,email,date_of_birth,country,city,bio,avatar_url,favorite_title_id,created_at FROM users WHERE id=$1`,
        [req.user.id]  
    );

    const row=result.rows[0];
    if(!row){
        return res.status(401).json({message: 'Invalid token'});

    }
    return res.json({
    user: {
      id: row.id,
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      dateOfBirth: row.date_of_birth,
      country: row.country,
      city: row.city,
      bio: row.bio,
      avatarUrl: row.avatar_url,
      favoriteTitleId: row.favorite_title_id,
      createdAt: row.created_at,
    },
 });

}