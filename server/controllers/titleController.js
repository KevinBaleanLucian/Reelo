import { getTitle, listTitles, searchTitles,trendingTitles,discoverTitles,listGenresForType } from '../services/titleService.js';

export async function popular(req, res) {
  const { type } = req.valid.params;
  const { page } = req.valid.query;
  res.json(await listTitles(type, 'popular', page));
}

export async function topRated(req, res) {
  const { type } = req.valid.params;
  const { page } = req.valid.query;
  res.json(await listTitles(type, 'top_rated', page));
}

export async function search(req, res) {
  const { q, page } = req.valid.query;
  res.json(await searchTitles(q, page));
}

export async function detail(req, res) {
  const { type, id } = req.valid.params;
  res.json({ title: await getTitle(id, type) });
}

export async function trending(req,res){
  const {type,page} =req.valid.query;
  res.json(await trendingTitles(type,page));
}

export async function discover(req,res){
  const {type}=req.valid.params;
  const { genre, year, sort, rating, runtime, lang, page } = req.valid.query;
  res.json(await discoverTitles(type, { genre, year, sort, rating, runtime, lang, page }));
}

export async function typeGenres(req,res){
  const {type}=req.valid.params;
  res.json({genres: await listGenresForType(type)});
}



