/**
 * @Public() — marks a route as publicly accessible (no JWT required).
 *
 * Use sparingly — most endpoints should be authenticated.
 * Example: GET /journeys (discover feed) is public; POST /journeys is not.
 */
export declare const IS_PUBLIC_KEY = "isPublic";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
//# sourceMappingURL=public.decorator.d.ts.map