import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { toResponseConfig } from "@/utils/";

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

		registry.register(
			"DeleteUserResponse",
			Schemas.DeleteUserResponseSchema.openapi({
				description: "Response for user deletion operations",
			}),
		);
	}

	/**
	 * Registers API routes for OpenAPI documentation.
	 * Includes request/response schemas for route operations.
	 */
	function registerRoutes() {
		const genericResponses = {
			400: toResponseConfig(Schemas.ErrorSchemas.badRequest, { description: "Bad request" }),
			401: toResponseConfig(Schemas.ErrorSchemas.unauthorized, { description: "Unauthorized" }),
			404: toResponseConfig(Schemas.ErrorSchemas.notFound, { description: "Not found" }),
			409: toResponseConfig(Schemas.ErrorSchemas.conflict, { description: "Conflict" }),
			500: toResponseConfig(Schemas.ErrorSchemas.internalError, {
				description: "Internal server error",
			}),
			503: toResponseConfig(Schemas.ErrorSchemas.serviceUnavailable, {
				description: "Service unavailable",
			}),
		};

		registry.registerPath({
			method: "get",
			path: "/users",
			description: "Get a paginated list of users",
			tags: ["users"],
			request: {
				query: Schemas.GetUsersQuerySchema,
				headers: Schemas.HeadersSchema,
			},
			responses: {
				200: {
					description: "List of users with pagination data",
					content: {
						"application/json": {
							schema: Schemas.GetUsersResponseSchema,
						},
					},
				},
				204: { description: "No content" },
				400: genericResponses[400],
				401: genericResponses[401],
				500: genericResponses[500],
				503: genericResponses[503],
			},
		});

		registry.registerPath({
			method: "post",
			path: "/users",
			description: "Create a new user",
			tags: ["users"],
			request: {
				body: {
					description: "The user to create",
					content: {
						"application/json": {
							schema: Schemas.CreateUserBodySchema,
						},
					},
				},
			},
			responses: {
				201: {
					description: "The created user",
					content: {
						"application/json": {
							schema: Schemas.CreateUserResponseSchema,
						},
					},
				},
				400: genericResponses[400],
				409: genericResponses[409],
				500: genericResponses[500],
				503: genericResponses[503],
			},
		});

		registry.registerPath({
			method: "get",
			path: "/users/{id}",
			description: "Get a user by ID",
			tags: ["users"],
			request: {
				params: Schemas.UserParamsSchema,
				headers: Schemas.HeadersSchema,
			},
			responses: {
				200: {
					description: "User details",
					content: {
						"application/json": {
							schema: Schemas.UserSchema,
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

		registry.registerPath({
			method: "put",
			path: "/users/{id}",
			description: "Update a user by ID",
			tags: ["users"],
			request: {
				params: Schemas.UserParamsSchema,
				body: {
					content: {
						"application/json": {
							schema: Schemas.UpdateUserBodySchema,
						},
					},
				},
				headers: Schemas.HeadersSchema,
			},
			responses: {
				200: {
					description: "User updated successfully",
					content: {
						"application/json": {
							schema: Schemas.UpdateUserResponseSchema,
						},
					},
				},
				400: genericResponses[400],
				401: genericResponses[401],
				404: genericResponses[404],
				409: genericResponses[409],
				500: genericResponses[500],
				503: genericResponses[503],
			},
		});

		registry.registerPath({
			method: "delete",
			path: "/users/{id}",
			description: "Delete a user by ID",
			tags: ["users"],
			request: {
				params: Schemas.UserParamsSchema,
				headers: Schemas.HeadersSchema,
			},
			responses: {
				200: {
					description: "User deleted successfully",
					content: {
						"application/json": {
							schema: Schemas.DeleteUserResponseSchema,
						},
					},
				},
				400: genericResponses[400],
				401: genericResponses[401],
				404: genericResponses[404],
				409: genericResponses[409],
				500: genericResponses[500],
				503: genericResponses[503],
			},
		});

		registry.registerPath({
			method: "post",
			path: "/auth/regenerate-key",
			description: "Regenerate a user's API key",
			tags: ["auth"],
			request: {
				headers: Schemas.HeadersSchema,
			},
			responses: {
				200: {
					description: "The regenerated API key",
					content: {
						"application/json": {
							schema: Schemas.RegenerateApiKeyResponseSchema,
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
}
