import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import * as RegionSchemas from "@/modules/regions/region.schema";
import * as UserSchemas from "@/modules/users/user.schema";
import { genericResponses, HeadersSchema } from "@/shared/schemas/common.schema";

/**
 * Registers region-related schemas for OpenAPI documentation.
 * Includes request/response schemas for region operations.
 */
export function registerRegionSchemas(registry: OpenAPIRegistry) {
	registry.register(
		"RegionParams",
		RegionSchemas.RegionParamsSchema.openapi({
			description: "URL parameters for region-specific operations",
		}),
	);

	registry.register(
		"CreateRegionBody",
		RegionSchemas.CreateRegionBodySchema.openapi({
			description: "Request body for region creation operations",
		}),
	);

	registry.register(
		"UpdateRegionBody",
		RegionSchemas.UpdateRegionBodySchema.openapi({
			description: "Request body for region update operations",
		}),
	);

	registry.register(
		"Region",
		RegionSchemas.RegionSchema.openapi({
			description: "Region object",
		}),
	);

	registry.register(
		"GetRegionsResponse",
		RegionSchemas.GetRegionsResponseSchema.openapi({
			description: "Response for region listing",
		}),
	);

	registry.register(
		"UpdateRegionResponse",
		RegionSchemas.UpdateRegionResponseSchema.openapi({
			description: "Response for region update operations",
		}),
	);

	registry.register(
		"DeleteRegionResponse",
		RegionSchemas.DeleteRegionResponseSchema.openapi({
			description: "Response for region deletion operations",
		}),
	);
}

/**
 * Registers region-related routes for OpenAPI documentation.
 * Includes paths for region operations like listing, creation, updating, and deletion.
 */
export function registerRegionRoutes(registry: OpenAPIRegistry) {
	// General region routes
	registry.registerPath({
		method: "get",
		path: "/regions",
		description: "Get a paginated list of regions",
		tags: ["regions"],
		request: {
			query: UserSchemas.GetUsersQuerySchema,
			headers: HeadersSchema,
		},
		responses: {
			200: {
				description: "List of regions with pagination data",
				content: {
					"application/json": {
						schema: RegionSchemas.GetRegionsResponseSchema,
					},
				},
			},
			400: genericResponses[400],
			401: genericResponses[401],
			500: genericResponses[500],
			503: genericResponses[503],
		},
	});

	registry.registerPath({
		method: "get",
		path: "/regions/{id}",
		description: "Get a region by ID",
		tags: ["regions"],
		request: {
			params: RegionSchemas.RegionParamsSchema,
			headers: HeadersSchema,
		},
		responses: {
			200: {
				description: "Region details",
				content: {
					"application/json": {
						schema: RegionSchemas.RegionSchema,
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
		path: "/regions/{id}",
		description: "Update a region by ID",
		tags: ["regions"],
		request: {
			params: RegionSchemas.RegionParamsSchema,
			body: {
				content: {
					"application/json": {
						schema: RegionSchemas.UpdateRegionBodySchema,
					},
				},
			},
			headers: HeadersSchema,
		},
		responses: {
			200: {
				description: "Region updated successfully",
				content: {
					"application/json": {
						schema: RegionSchemas.UpdateRegionResponseSchema,
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
		method: "delete",
		path: "/regions/{id}",
		description: "Delete a region by ID",
		tags: ["regions"],
		request: {
			params: RegionSchemas.RegionParamsSchema,
			headers: HeadersSchema,
		},
		responses: {
			200: {
				description: "Region deleted successfully",
				content: {
					"application/json": {
						schema: RegionSchemas.DeleteRegionResponseSchema,
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

	// User-specific region routes
	registry.registerPath({
		method: "get",
		path: "/users/{userId}/regions",
		description: "Get a paginated list of regions for a specific user",
		tags: ["regions", "users"],
		request: {
			params: UserSchemas.UserParamsSchema,
			query: UserSchemas.GetUsersQuerySchema,
			headers: HeadersSchema,
		},
		responses: {
			200: {
				description: "List of regions with pagination data",
				content: {
					"application/json": {
						schema: RegionSchemas.GetRegionsResponseSchema,
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
		method: "post",
		path: "/users/{userId}/regions",
		description: "Create a new region for a specific user",
		tags: ["regions", "users"],
		request: {
			params: UserSchemas.UserParamsSchema,
			body: {
				description: "The region to create",
				content: {
					"application/json": {
						schema: RegionSchemas.CreateRegionBodySchema,
					},
				},
			},
			headers: HeadersSchema,
		},
		responses: {
			201: {
				description: "The created region",
				content: {
					"application/json": {
						schema: RegionSchemas.RegionSchema,
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
