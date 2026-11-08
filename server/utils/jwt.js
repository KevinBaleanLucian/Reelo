import jwt from 'jsonwebtoken';

function getSecret(){
    const secret=process.env.JWT_SECRET;
    if(!secret){
        throw new Error('JWT_SECRET is not set in .env');
    }
    return secret;
}

export function signToken(userId,expiresIn=process.env.JWT_EXPIRES_IN || '7d'){
    return jwt.sign({userId},getSecret(), {
        algorithm: 'HS256',
        expiresIn,
    });
}

export function verifyToken(token){
    return jwt.verify(token,getSecret(), {algorithms: ['HS256']});

}