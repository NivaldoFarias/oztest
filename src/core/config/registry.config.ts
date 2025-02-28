import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { registerAuthRoutes, registerAuthSchemas } from "@/modules/auth/auth.docs";
import { registerRegionRoutes, registerRegionSchemas } from "@/modules/regions/region.docs";
import { registerUserRoutes, registerUserSchemas } from "@/modules/users/user.docs";
import * as Schemas from "@/shared/schemas/common.schema";

export const registry = createRegistry();

/**
 * Central registry for OpenAPI schema definitions.
 * Maintains all API schemas and their metadata for documentation generation.
 */
function createRegistry() {
	const registry = new OpenAPIRegistry();

	registerCommonSchemas();
	registerSchemas();
	registerRoutes();

	return registry;

	/**
	 * Registers common schemas used across the API.
	 * Includes base types like coordinates, pagination, and error responses.
	 */
	function registerCommonSchemas() {
		registry.register(
			"Coordinates",
			Schemas.CoordinatesSchema.openapi({
				description: "Geographic coordinates following GeoJSON format [longitude, latitude]",
			}),
		);

		registry.register(
			"PaginationMeta",
			Schemas.PaginationMetaSchema.openapi({
				description: "Metadata for paginated responses",
			}),
		);

		registry.register(
			"PaginationQuery",
			Schemas.PaginationQuerySchema.openapi({
				description: "Query parameters for pagination",
			}),
		);

		registry.register(
			"Header",
			Schemas.HeadersSchema.openapi({
				description: "Header for API requests",
			}),
		);
	}

	/**
	 * Registers all schemas for OpenAPI documentation.
	 * Includes request/response schemas for route operations.
	 */
	function registerSchemas() {
		registerUserSchemas(registry);
		registerRegionSchemas(registry);
		registerAuthSchemas(registry);
	}

	/**
	 * Registers API routes for OpenAPI documentation.
	 * Includes request/response schemas for route operations.
	 */
	function registerRoutes() {
		registerUserRoutes(registry);
		registerRegionRoutes(registry);
		registerAuthRoutes(registry);
	}
}
