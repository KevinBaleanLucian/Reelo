import pool from "../db/pool.js";
import { verifyToken } from "../utils/jwt.js";

export async function authRequired(req,res,next){
    const header=req.headers.authorization || '';
    const [scheme,token]=header.split(' ');

    if(scheme !=='Bearer' || !token){
        return res.status(401).json({message: 'Authentication required'});
    }

    let payload;
    try{
        payload=verifyToken(token);
    } catch(err){
        const message=err.name==='TokenExpiredError' ? 'Session expired, please log in again' : 'Invalid token';
        return res.status(401).json({message});
    }

    const result = await pool.query('SELECT id FROM users WHERE id =$1',[payload.userId]);

    if(result.rows.length===0){
        return res.status(401).json({message: 'Invalid token'});

    }
    req.user={id:payload.userId};
    next();
}