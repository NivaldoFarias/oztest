import type { FastifyInstance } from "fastify";

import type { GetUsersQuery, UpdateUserBody, UserParams } from "@/schemas";

import { registry } from "@/config/registry.config";
import { z } from "@/config/zod.config";
import {
	GetUsersQuerySchema,
	GetUsersResponseSchema,
	UpdateUserBodySchema,
	UpdateUserResponseSchema,
	UserParamsSchema,
	UserSchema,
} from "@/schemas";

import { getUserById, getUsers, updateUser } from "./handlers.adapter";

/**
 * Configures API routes for the Fastify server instance.
 * Sets up endpoints with request/response validation schemas and connects them to handlers.
 *
 * @param app The Fastify instance to configure routes for
 *
 * @example
 * ```typescript
 * await setupRoutes(fastifyApp);
 * ```
 */
export function setupRoutes(app: FastifyInstance) {
	registerRoutes();

	app.get<{ Querystring: GetUsersQuery }>(
		"/users",
		{
			schema: {
				description: "Get a paginated list of users",
				tags: ["users"],
				querystring: GetUsersQuerySchema,
				response: {
					"2xx": GetUsersResponseSchema,
				},
			},
		},
		getUsers,
	);

	app.get<{ Params: UserParams }>(
		"/users/:id",
		{
			schema: {
				description: "Get a user by ID",
				tags: ["users"],
				params: UserParamsSchema,
				response: {
					200: UserSchema,
				},
			},
		},
		(request) => getUserById(request, app),
	);

	app.put<{ Params: UserParams; Body: UpdateUserBody }>(
		"/users/:id",
		{
			schema: {
				description: "Update a user by ID",
				tags: ["users"],
				params: UserParamsSchema,
				body: UpdateUserBodySchema,
				response: {
					200: UpdateUserResponseSchema,
				},
			},
		},
		(request) => updateUser(request, app),
	);

	function registerRoutes() {
		registry.registerPath({
			method: "get",
			path: "/users",
			description: "Get a paginated list of users",
			tags: ["users"],
			request: {
				query: GetUsersQuerySchema,
			},
			responses: {
				200: {
					description: "List of users with pagination data",
					content: {
						"application/json": {
							schema: GetUsersResponseSchema,
						},
					},
				},
			},
		});

		// Register GET /users/:id
		registry.registerPath({
			method: "get",
			path: "/users/{id}",
			description: "Get a user by ID",
			tags: ["users"],
			request: {
				params: UserParamsSchema,
			},
			responses: {
				200: {
					description: "User details",
					content: {
						"application/json": {
							schema: UserSchema,
						},
					},
				},
				404: {
					description: "User not found",
					content: {
						"application/json": {
							schema: z.object({
								statusCode: z.number(),
								error: z.string(),
								message: z.literal("User not found"),
							}),
						},
					},
				},
			},
		});

		// Register PUT /users/:id
		registry.registerPath({
			method: "put",
			path: "/users/{id}",
			description: "Update a user by ID",
			tags: ["users"],
			request: {
				params: UserParamsSchema,
				body: {
					content: {
						"application/json": {
							schema: UpdateUserBodySchema,
						},
					},
				},
			},
			responses: {
				200: {
					description: "User updated successfully",
					content: {
						"application/json": {
							schema: UpdateUserResponseSchema,
						},
					},
				},
				404: {
					description: "User not found",
					content: {
						"application/json": {
							schema: z.object({
								statusCode: z.number(),
								error: z.string(),
								message: z.literal("User not found"),
							}),
						},
					},
				},
			},
		});
	}
}
