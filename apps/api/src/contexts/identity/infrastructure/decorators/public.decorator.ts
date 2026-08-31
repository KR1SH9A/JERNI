import { SetMetadata } from '@nestjs/common';

/**
 * @Public() — marks a route as publicly accessible (no JWT required).
 *
 * Use sparingly — most endpoints should be authenticated.
 * Example: GET /journeys (discover feed) is public; POST /journeys is not.
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
