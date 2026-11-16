import bcrypt from 'bcrypt';
import pool from '../db/pool.js';
import { signToken } from '../utils/jwt.js';
import {getTitle} from '../services/titleService.js';
import { TmdbError } from '../utils/tmdb.js';

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

async function getUserGenres(userId){
    const result =await pool.query(
        `SELECT g.id, g.tmdb_id, g.name
        FROM user_genres ug
        JOIN genres g ON g.id = ug.genre_id
        WHERE ug.user_id = $1
        ORDER BY g.name`,
        [userId]
    );
    return result.rows.map((g)=> ({id: g.id, tmdbId:g.tmdb_id, name:g.name}));
}

export async function register(req, res) {
  const {firstName,lastName,username,email,password,dateOfBirth,country,genreIds,favoriteTitle,} = req.body;

  if (genreIds.length > 0) {
    const found = await pool.query('SELECT id FROM genres WHERE id = ANY($1::int[])', [genreIds]);

    if (found.rows.length !== genreIds.length) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: { genreIds: 'One or more genres are invalid' },
      });
    }
  }

  const existing = await pool.query(
    'SELECT email, username FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );

  if (existing.rows.length > 0) {
    const errors = {};
    for (const row of existing.rows) {
      if (row.email === email) errors.email = 'This email is already registered';
      if (row.username === username) errors.username = 'This username is taken';
    }
    return res.status(409).json({ message: 'Account already exists', errors });
  }

  let favoriteTitleId = null;

  if (favoriteTitle) {
    try {
      const title = await getTitle(favoriteTitle.tmdbId, favoriteTitle.mediaType);
      favoriteTitleId = title.id;
    } catch (err) {
      if (err instanceof TmdbError && err.status === 404) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: { favoriteTitle: 'We couldn’t find this title' },
        });
      }
      throw err;
    }
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO users
         (username, first_name, last_name, email, password_hash, date_of_birth, country, favorite_title_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, username, first_name, last_name, email, country, created_at`,
      [
        username,
        firstName,
        lastName,
        email,
        passwordHash,
        dateOfBirth ?? null,
        country || null,
        favoriteTitleId,
      ]
    );

    const user = result.rows[0];

    if (genreIds.length > 0) {
      await client.query(
        `INSERT INTO user_genres (user_id, genre_id)
         SELECT $1, UNNEST($2::int[])`,
        [user.id, genreIds]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({
      user: { ...toPublicUser(user), genres: await getUserGenres(user.id) },
    });
  } catch (err) {
    await client.query('ROLLBACK');

    if (err.code === '23505') {
      return res.status(409).json({ message: 'Account already exists' });
    }
    throw err;
  } finally {
    client.release();
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

export async function getMe(req, res) {
  const result = await pool.query(
    `SELECT u.id, u.username, u.first_name, u.last_name, u.email, u.date_of_birth,
            u.country, u.city, u.bio, u.avatar_url, u.favorite_title_id, u.created_at,
            t.tmdb_id AS fav_tmdb_id, t.media_type AS fav_media_type,
            t.title AS fav_title, t.poster_path AS fav_poster_path
     FROM users u
     LEFT JOIN titles t ON t.id = u.favorite_title_id
     WHERE u.id = $1`,
    [req.user.id]
  );

  const row = result.rows[0];

  if (!row) {
    return res.status(401).json({ message: 'Invalid token' });
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
      favoriteTitle: row.favorite_title_id
        ? {
            id: row.favorite_title_id,
            tmdbId: row.fav_tmdb_id,
            mediaType: row.fav_media_type,
            title: row.fav_title,
            posterPath: row.fav_poster_path,
          }
        : null,
      createdAt: row.created_at,
      genres: await getUserGenres(row.id),
    },
  });
}