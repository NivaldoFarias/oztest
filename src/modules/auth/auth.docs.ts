import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import * as AuthSchemas from "@/modules/auth/auth.schema";
import { genericResponses, HeadersSchema } from "@/shared/schemas/common.schema";

/**
 * Registers authentication-related schemas for OpenAPI documentation.
 * Includes request/response schemas for authentication operations.
 */
export function registerAuthSchemas(registry: OpenAPIRegistry) {
	registry.register(
		"RegenerateApiKeyResponse",
		AuthSchemas.RegenerateApiKeyResponseSchema.openapi({
			description: "Response for API key regeneration",
		}),
	);
}

/**
 * Registers authentication-related routes for OpenAPI documentation.
 * Includes paths for authentication operations like API key regeneration.
 */
export function registerAuthRoutes(registry: OpenAPIRegistry) {
	registry.registerPath({
		method: "post",
		path: "/auth/regenerate-key",
		description: "Regenerate a user's API key",
		tags: ["auth"],
		request: {
			headers: HeadersSchema,
		},
		responses: {
			200: {
				description: "The regenerated API key",
				content: {
					"application/json": {
						schema: AuthSchemas.RegenerateApiKeyResponseSchema,
					},
				},
			},
			400: genericResponses[400],
			401: genericResponses[401],
			404: genericResponses[404],
			500: genericResponses[500],
			503: genericResponses[503],
		},
	});
}
