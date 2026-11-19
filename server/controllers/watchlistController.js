import {getSummary,listEntries,lookupStatuses,removeEntry,upsertEntry,} from '../services/watchlistService.js';

export async function upsert(req, res) {
  const { type, tmdbId } = req.valid.params;
  const { status } = req.body;

  const { created, item } = await upsertEntry(req.user.id, type, tmdbId, status);
  res.status(created ? 201 : 200).json({ item });
}

export async function remove(req, res) {
  const { type, tmdbId } = req.valid.params;

  await removeEntry(req.user.id, type, tmdbId);
  res.status(204).end();
}

export async function list(req, res) {
  const { status, page } = req.valid.query;
  res.json(await listEntries(req.user.id, { status, page }));
}

export async function summary(req, res) {
  res.json({ summary: await getSummary(req.user.id) });
}

export async function lookup(req, res) {
  res.json({ statuses: await lookupStatuses(req.user.id, req.valid.query.items) });
}