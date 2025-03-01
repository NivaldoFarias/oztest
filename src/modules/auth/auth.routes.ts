import type { FastifyInstance } from "fastify";

import type { RegenerateApiKeyResponse } from "@/modules/auth/auth.schema";

import { ErrorSchemas } from "@/core/errors/error.schema";
import { regenerateApiKey } from "@/modules/auth/auth.controller";
import { RegenerateApiKeyResponseSchema } from "@/modules/auth/auth.schema";

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
