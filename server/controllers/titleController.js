import { getTitle, listTitles, searchTitles } from '../services/titleService.js';

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