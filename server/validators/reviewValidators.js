import {z} from 'zod';

const MAX_INT=2147483647;
const MAX_TEXT=5000;

const mediaType = z.enum(['movie', 'tv'], { error: 'Invalid type' });
const positiveId = z.coerce.number().int('Invalid id').positive('Invalid id').max(MAX_INT, 'Invalid id');
const page = z.coerce.number().int().min(1, 'Invalid page').max(500, 'Invalid page').default(1);

export const titleReviewParams = { params: z.object({ type: mediaType, id: positiveId }) };

export const listReviewSchemas = {
    params: z.object({type: mediaType, id: positiveId}),
    query: z.object({
        sort: z.enum(['recent','helpful'], {error: 'Invalid sort'}).default('recent'),
        page,
    }),
};

export const reviewIdSchemas = { params: z.object({ reviewId: positiveId }) };

export const reviewBodySchema=z.object({
    rating: z.number({error: 'Choose a rating'}).int('Choose a whole number').min(1,'Choose a rating from 1 to 10').max(10,'Choose a rating from 1 to 10'),
    text: z.string().trim().max(MAX_TEXT, `Keep your review under ${MAX_TEXT} characters`).nullish().transform((value) => (value ? value : null)),
    containsSpoilers: z.boolean().optional().default(false),

});

