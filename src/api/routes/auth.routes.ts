import type { FastifyInstance } from "fastify";

import type { RegenerateApiKeyResponse } from "@/schemas";

import { regenerateApiKey } from "@/api/controllers/auth.controller";
import { ErrorSchemas, RegenerateApiKeyResponseSchema } from "@/schemas";

/**
 * Configures API routes for the Fastify server instance.
 * Sets up endpoints with request/response validation schemas and connects them to handlers.
 *
 * @param app The Fastify instance to configure routes for
 *
 * @example
 * ```typescript
 * setupAuthRoutes(fastifyApp);
 * ```
 */
export function setupAuthRoutes(app: FastifyInstance) {
	app.post<{ Reply: RegenerateApiKeyResponse }>(
		"/auth/regenerate-key",
		{
			schema: {
				response: {
					200: RegenerateApiKeyResponseSchema,
					400: ErrorSchemas.badRequest,
					401: ErrorSchemas.unauthorized,
					404: ErrorSchemas.notFound,
					500: ErrorSchemas.internalError,
				},
			},
		},
		(request) => regenerateApiKey(request, app),
	);
}
