const BASE_URL='https://api.themoviedb.org/3';

export class TmdbError extends Error{
    constructor(message,status){
        super(message);
        this.name='TmdbError';
        this.status=status;
    }
}

export async function tmdbFetch(path,params={}){
    const apiKey=process.env.TMDB_API_KEY;
    if(!apiKey){
        throw new Error('TMDB_API_KEY is not set in .env');
    }

    const url=new URL(`${BASE_URL}${path}`);
    url.searchParams.set('api_key',apiKey);
    url.searchParams.set('language','en-US');

    for (const [key,value] of Object.entries(params)){
        if(value !== undefined && value !== null & value !==''){
            url.searchParams.set(key,value);
        }
    }
    let response;
    try {
        response=await fetch(url, {signal: AbortSignal.timeout(8000)});
    } catch {
        throw new TmdbError('Could not reach TMDB',502);
    }
    if (!response.ok){
        const status=response.status === 404 ? 404 :502;
        throw new TmdbError(`TMDB responded with ${response.status} for ${path}`,status);
    }

    return response.json();
}

