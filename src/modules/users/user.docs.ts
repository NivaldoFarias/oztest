import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import * as UserSchemas from "@/modules/users/user.schema";
import { genericResponses, HeadersSchema } from "@/shared/schemas/common.schema";

/**
 * Registers user-related schemas for OpenAPI documentation.
 * Includes request/response schemas for user operations.
 */
export function registerUserSchemas(registry: OpenAPIRegistry) {
	registry.register(
		"GetUsersQuery",
		UserSchemas.GetUsersQuerySchema.openapi({
			description: "Query parameters for user listing with enhanced filtering and sorting",
		}),
	);

	registry.register(
		"UserParams",
		UserSchemas.UserParamsSchema.openapi({
			description: "URL parameters for user-specific operations",
		}),
	);

	registry.register(
		"UpdateUserBody",
		UserSchemas.UpdateUserBodySchema.openapi({
			description: "Request body for user update operations",
		}),
	);

	registry.register(
		"User",
		UserSchemas.UserSchema.openapi({
			description: "User object",
		}),
	);

	registry.register(
		"GetUsersResponse",
		UserSchemas.GetUsersResponseSchema.openapi({
			description: "Response for user listing (legacy format)",
		}),
	);

	registry.register(
		"GetUsersEnhancedResponse",
		UserSchemas.GetUsersEnhancedResponseSchema.openapi({
			description: "Enhanced response for user listing with detailed pagination metadata",
		}),
	);

	registry.register(
		"UpdateUserResponse",
		UserSchemas.UpdateUserResponseSchema.openapi({
			description: "Response for user update operations",
		}),
	);

	registry.register(
		"DeleteUserResponse",
		UserSchemas.DeleteUserResponseSchema.openapi({
			description: "Response for user deletion operations",
		}),
	);
}

export function registerUserRoutes(registry: OpenAPIRegistry) {
	registry.registerPath({
		method: "get",
		path: "/users",
		description: "Get a paginated list of users",
		tags: ["users"],
		request: {
			query: UserSchemas.GetUsersQuerySchema,
			headers: HeadersSchema,
		},
		responses: {
			200: {
				description: "List of users with pagination data",
				content: {
					"application/json": {
						schema: UserSchemas.GetUsersResponseSchema,
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
						schema: UserSchemas.CreateUserBodySchema,
					},
				},
			},
		},
		responses: {
			201: {
				description: "The created user",
				content: {
					"application/json": {
						schema: UserSchemas.CreateUserResponseSchema,
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
			params: UserSchemas.UserParamsSchema,
			headers: HeadersSchema,
		},
		responses: {
			200: {
				description: "User details",
				content: {
					"application/json": {
						schema: UserSchemas.UserSchema,
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
			params: UserSchemas.UserParamsSchema,
			body: {
				content: {
					"application/json": {
						schema: UserSchemas.UpdateUserBodySchema,
					},
				},
			},
			headers: HeadersSchema,
		},
		responses: {
			200: {
				description: "User updated successfully",
				content: {
					"application/json": {
						schema: UserSchemas.UpdateUserResponseSchema,
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
			params: UserSchemas.UserParamsSchema,
			headers: HeadersSchema,
		},
		responses: {
			200: {
				description: "User deleted successfully",
				content: {
					"application/json": {
						schema: UserSchemas.DeleteUserResponseSchema,
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
}
