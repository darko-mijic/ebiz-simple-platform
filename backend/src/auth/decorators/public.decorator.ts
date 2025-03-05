import { SetMetadata } from '@nestjs/common';

/**
 * Key used to identify public routes that should bypass authentication
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator that marks a route as public, making it accessible without authentication
 * Usage: @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true); 