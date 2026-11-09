import { TmdbError} from '../utils/tmdb.js';

export function notFound(req,res){
    res.status(404).json({message: 'Route not found'});

}

export function errorHandler(err,req,res,next){
    if(res.headersSent){
        return next(err);
    }
    if(err.type==='entity.parse.failed'){
        return res.status(400).json({message: 'Invalid JSON in request body'});
    }

    if(err.type === 'entity.too.large'){
        return res.status(413).json({message: 'Request body is too large'});
    }

    if(err instanceof TmdbError){
        if(err.status===404){
            return res.status(404).json({message: 'Title not found'});
        }
        console.error('TMDB error:',err.message);
        return res.status(502).json({message: 'Movie data is temporarily unavailable'});
    }

    if(err.code==='23505'){
        return res.stauts(409).json({message: 'This resource already exists'});
    }
    if(err.code==='23503'){
        return res.status(400).json({message: 'A referenced resource does not exist'});
    }
    console.error(err);
    return res.status(500).json({message: 'Something went wrong'});
}



