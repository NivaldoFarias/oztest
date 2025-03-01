import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { InternalServerError, UnauthorizedError } from "@/core/utils";
import { UserModel } from "@/modules/users/user.model";

/**
 * Configuration options for the authentication middleware
 */
export interface AuthOptions {
	/** Routes that should bypass authentication */
	publicRoutes?: string[];
}

/**
 * Interface for attaching the authenticated user to request object
 */
declare module "fastify" {
	interface FastifyRequest {
		user?: any;
	}
}

/**
 * Creates a Fastify authentication middleware that validates API keys
 * This middleware extracts API keys from headers, validates them against stored keys,
 * and attaches the authenticated user to the request object.
 *
 * @param app - The Fastify instance
 * @param options - Configuration options
 * @returns A Fastify hook/middleware function
 *
 * @example
 * ```typescript
 * const app = Fastify();
 * app.addHook('onRequest', createAuthMiddleware(app, {
 *   publicRoutes: ['/api/docs', '/api/health']
 * }));
 * ```
 */
export function createAuthMiddleware(app: FastifyInstance, options: AuthOptions = {}) {
	const { publicRoutes = [] } = options;

	return async (request: FastifyRequest, reply: FastifyReply) => {
		if (publicRoutes.some((route) => request.url.startsWith(route))) return;

		const apiKey = request.headers["x-api-key"] as string;

		if (!apiKey) return reply.status(401).send(new UnauthorizedError("API key is missing"));

		try {
			const users = await UserModel.find();

			const user = users.find((user) => {
				try {
					return user.verifyApiKey(apiKey);
				} catch (error) {
					return false;
				}
			});

			if (!user) {
				app.log.warn(`Authentication failed for API key: ${apiKey.substring(0, 8)}...`);

				return await reply.status(401).send(new UnauthorizedError("Invalid API key"));
			}

			request.user = user;
		} catch (error) {
			app.log.error("Authentication error:", error);

			return reply.status(500).send(new InternalServerError("Authentication error"));
		}
	};
}

/**
 * Creates a middleware for regenerating API keys
 * This middleware ensures the user is authenticated before allowing key regeneration
 *
 * @param app - The Fastify instance
 * @returns A Fastify hook/middleware function
 */
export function createRegenerateKeyMiddleware(app: FastifyInstance) {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		if (!request.user) {
			return reply.status(401).send({
				statusCode: 401,
				message: "Authentication required",
			});
		}
	};
}
