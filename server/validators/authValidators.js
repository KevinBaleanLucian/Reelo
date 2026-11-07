import {z} from 'zod';

export const registerSchema = z.object({
    firstName:z.string().trim().min(1,'First name is required').max(50,'First name is too long'),
    lastName: z.string().trim().min(1,'Last name is required').max(50,'Last name is too long'),

    username:z.string().trim().toLowerCase()
    .min(3,'Username must have at lest 3 characters')
    .max(30,'Username must have at most 30 characters')
    .regex(/^[a-z0-9._]+$/,'Username can only contain letters, numbers, dots and underscores'),

    email: z.string().trim().toLowerCase().max(255).pipe(z.email('Enter a valid email address')),

    password:z.string().min(8,'Use at least 8 characters')
    .max(72,'Password is too long')
    .regex(/[0-9]/, 'Include at least one number')
    .regex(/[^A-Za-z0-9]/, 'Include at least one symbol'),

    dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid date')
    .refine((value) => new Date(value) <= new Date(), 'Date of birth cannot be in the future')
    .refine((value) => new Date(value) >= new Date('1900-01-01'), 'Enter a valid date')
    .optional(),

    country: z.string().trim().max(100).optional(),

})