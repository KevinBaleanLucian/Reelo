import {z} from 'zod';

export const WATCHLIST_STATUSES= ['to_watch','watching','watched'];

const MAX_INT=2147483647;
const MAX_LOOKUP=60;

const mediaType=z.enum(['movie','tv'] , {error: 'Invalid Type'});
const status=z.enum(WATCHLIST_STATUSES, {error: 'Invalid status'});

const tmdbId = z.coerce.number().int('Invalid id').positive('Invalid id').max(MAX_INT, 'Invalid id');
const page = z.coerce.number().int().min(1, 'Invalid page').max(500, 'Invalid page').default(1);

const entryParams=z.object({type: mediaType, tmdbId});

export const entrySchemas={params: entryParams};

export const upsertBodySchema=z.object({status});

export const listSchemas= {
    query: z.object({
        status: status.optional(),
        page,
    }),
};

export const lookupSchemas= {
    query: z.object({
        items: z.string({error: 'Add at least one title'}).trim().min(1,'Add at least one title')
        .transform((value, ctx) => {
            const parts= [...new Set(value.split(',').map((part) => part.trim()).filter(Boolean))];

            if(parts.length>MAX_LOOKUP){
                ctx.addIssue({code: 'custom', message: `Ask for at most ${MAX_LOOKUP} titles at once`});
                return z.NEVER;
            }

            const items=[];

            for(const part of parts){
                const match = /^(movie|tv):([1-9]\d{0,9})$/.exec(part);
                const id=match ? Number(match[2]) : 0;

                if(!match || id>MAX_INT){
                    ctx.addIssue({code: 'custom', message: 'Invalid title list'});
                    return z.NEVER;
                }
                items.push({mediaType: match[1],tmdbId:id});
            }

            return items;
        }),
    }),
};
