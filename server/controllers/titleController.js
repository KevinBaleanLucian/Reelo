import { TmdbError } from "../utils/tmdb.js";
import { getTitle, listTitles,searchTitles } from "../services/titleService.js";

function withTmdbErrors(handler){
    return async (req,res)=>{
        try {
            await handler(req,res);
        } catch (err){
            if (err instanceof TmdbError){
                if(err.status===404){
                    return res.status(404).json({message: 'Title not found'});
                }
                return res.status(502).json({message: 'Movie data is temporarily unavailable'});
            }
            throw err;
        }
    };
}

export const popular = withTmdbErrors(async(req,res)=>{
    const {type} = req.valid.params;
    const {page}=req.valid.query;
    res.json(await listTitles(type,'popular',page));
});

export const topRated = withTmdbErrors(async (req, res) => {
  const { type } = req.valid.params;
  const { page } = req.valid.query;
  res.json(await listTitles(type, 'top_rated', page));
});

export const search = withTmdbErrors(async (req, res) => {
  const { q, page } = req.valid.query;
  res.json(await searchTitles(q, page));
});

export const detail = withTmdbErrors(async (req, res) => {
  const { type, id } = req.valid.params;
  res.json({ title: await getTitle(id, type) });
});