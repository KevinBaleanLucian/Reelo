import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';

export async function authOptional(req,res,next){
    const [scheme,token]=(req.get('Authorization') ?? '').split(' ');

    if(scheme !== 'Bearer' || !token){
        return next();
    }

    try {
        const payload=jwt.verify(token,process.env.JWT_SECRET, {algorithms: ['HS256']});
        const userId=Number(payload.userId);

        if(Number.isInteger(userId)){
            const result=await pool.query('SELECT id FROM users WHERE id = $1',[userId]);
            if(result.rows[0]) req.user={id: result.rows[0].id};
        }
    } catch (error) {
        console.log('authOptional error:', error.message);
    }
    return next();
}