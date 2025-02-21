import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import * as Schemas from "../schemas/";

export const registry = createRegistry();

/**
 * Central registry for OpenAPI schema definitions.
 * Maintains all API schemas and their metadata for documentation generation.
 */
function createRegistry() {
	const registry = new OpenAPIRegistry();

	registerCommonSchemas();
	registerUserSchemas();

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
			"ErrorResponse",
			Schemas.ErrorResponseSchema.openapi({
				description: "Standard error response format",
			}),
		);

		registry.register(
			"PaginationQuery",
			Schemas.PaginationQuerySchema.openapi({
				description: "Query parameters for pagination",
			}),
		);
	}

	/**
	 * Registers user-related schemas for OpenAPI documentation.
	 * Includes request/response schemas for user operations.
	 */
	function registerUserSchemas() {
		registry.register(
			"GetUsersQuery",
			Schemas.GetUsersQuerySchema.openapi({
				description: "Query parameters for user listing",
			}),
		);

		registry.register(
			"UserParams",
			Schemas.UserParamsSchema.openapi({
				description: "URL parameters for user-specific operations",
			}),
		);

		registry.register(
			"UpdateUserBody",
			Schemas.UpdateUserBodySchema.openapi({
				description: "Request body for user update operations",
			}),
		);

		registry.register(
			"User",
			Schemas.UserSchema.openapi({
				description: "User object",
			}),
		);

		registry.register(
			"GetUsersResponse",
			Schemas.GetUsersResponseSchema.openapi({
				description: "Response for user listing",
			}),
		);

		registry.register(
			"UpdateUserResponse",
			Schemas.UpdateUserResponseSchema.openapi({
				description: "Response for user update operations",
			}),
		);
	}
}
