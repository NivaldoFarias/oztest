import fastifyRateLimit from "@fastify/rate-limit";

import type { FastifyInstance, FastifyPluginOptions } from "fastify";

/**
 * Options for configuring the rate limiting middleware
 */
export interface RateLimitOptions {
	/** Maximum number of requests in the time window */
	max?: number;
	/** Time window in milliseconds */
	timeWindow?: number;
	/** Routes to apply rate limiting to */
	routes?: string[];
	/** Custom error message */
	errorMessage?: string;
}

/**
 * Configures and registers rate limiting for authentication endpoints
 * Helps protect against brute force attacks and abuse
 *
 * @param app - The Fastify instance to add rate limiting to
 * @param options - Configuration options for rate limiting
 * @returns A promise that resolves when rate limiting is configured
 *
 * @example
 * ```typescript
 * await setupRateLimiting(app, {
 *   max: 5,
 *   timeWindow: 60000, // 1 minute
 *   routes: ['/users', '/auth/regenerate-key'],
 *   errorMessage: 'Too many requests, please try again later'
 * });
 * ```
 */
export async function setupRateLimiting(
	app: FastifyInstance,
	options: RateLimitOptions = {},
): Promise<void> {
	const {
		max = 20,
		timeWindow = 60_000,
		errorMessage = "Rate limit exceeded, please try again later",
		routes = [],
	} = options;

	await app.register(fastifyRateLimit, {
		max: 100,
		timeWindow: 60_000,
		allowList: ["127.0.0.1", "::1"],
	});

	if (routes.length > 0) {
		for (const route of routes) {
			await app.register(
				async (routeApp: FastifyInstance, _: FastifyPluginOptions) => {
					await routeApp.register(fastifyRateLimit, {
						max,
						timeWindow,
						errorResponseBuilder: () => ({
							statusCode: 429,
							message: errorMessage,
						}),
						onExceeding: (req) => {
							app.log.warn(`Rate limit approaching for ${req.ip} on ${req.url}`);
						},
						onExceeded: (req) => {
							app.log.warn(`Rate limit exceeded for ${req.ip} on ${req.url}`);
						},
					});
				},
				{ prefix: route },
			);
		}
	}
}
