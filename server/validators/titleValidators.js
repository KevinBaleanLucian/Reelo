import {z} from 'zod';

const mediaType=z.enum(['movie','tv'], {error: 'Type must be movie or tv'});
const page=z.coerce.number().int().min(1).max(500,'Page must be between 1 and 500').default(1);

export const listSchemas={
    params: z.object({type:mediaType}),
    query:z.object({page}),
};

export const searchSchemas={
    query: z.object({
        q: z.string().trim().min(1, 'Enter a search term').max(100,'Search term is too long'),page,
    }),
};

export const detailSchemas={
    params: z.object({
        type:mediaType,
        id:z.coerce.number().int().positive('Invalid id'),
    }),
};

export const trendingSchemas={
    query: z.object({
        type: z.enum(['all','movie','tv'], {error: 'Type must be all, movie or tv'}).default('all'),
        page,
    }),
};

export const discoverSchemas = {
  params: z.object({ type: mediaType }),
  query: z.object({
    genre: z.coerce.number().int().positive('Invalid genre').optional(),
    year: z.coerce.number().int().min(1900, 'Invalid year').max(2100, 'Invalid year').optional(),
    sort: z
      .enum(['popularity', 'rating', 'newest'], { error: 'Invalid sort' })
      .default('popularity'),
    rating: z.coerce.number().int().min(1, 'Invalid rating').max(9, 'Invalid rating').optional(),
    runtime: z.enum(['short', 'medium', 'long'], { error: 'Invalid runtime' }).optional(),
    lang: z.string().regex(/^[a-z]{2}$/, 'Invalid language').optional(),
    page,
  }),
};

export const typeSchemas = {
  params: z.object({ type: mediaType }),
};

