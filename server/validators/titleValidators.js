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

