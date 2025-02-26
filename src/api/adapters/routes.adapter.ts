import type { FastifyInstance } from "fastify";

import type { CreateUserBody, GetUsersQuery, UpdateUserBody, UserParams } from "@/schemas";

import {
	CreateUserBodySchema,
	GetUsersQuerySchema,
	GetUsersResponseSchema,
	toErrorSchema,
	UpdateUserBodySchema,
	UpdateUserResponseSchema,
	UserParamsSchema,
	UserSchema,
} from "@/schemas";

import { createUser, getUserById, getUsers, updateUser } from "./handlers.adapter";

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
	app.get<{ Querystring: GetUsersQuery }>(
		"/users",
		{
			schema: {
				querystring: GetUsersQuerySchema,
				response: {
					200: GetUsersResponseSchema,
					204: {
						description: "No content",
						type: "null",
					},
					400: toErrorSchema("Bad request"),
					500: toErrorSchema("Internal server error"),
				},
			},
		},
		getUsers,
	);

	app.post<{ Body: CreateUserBody }>(
		"/users",
		{
			schema: {
				body: CreateUserBodySchema,
				response: {
					201: UserSchema,
					400: toErrorSchema("Bad request"),
					500: toErrorSchema("Internal server error"),
				},
			},
		},
		(request) => createUser(request, app),
	);

	app.get<{ Params: UserParams }>(
		"/users/:id",
		{
			schema: {
				params: UserParamsSchema,
				response: {
					200: UserSchema,
					400: toErrorSchema("Bad request"),
					404: toErrorSchema("User not found"),
					500: toErrorSchema("Internal server error"),
				},
			},
		},
		(request) => getUserById(request, app),
	);

	app.put<{ Params: UserParams; Body: UpdateUserBody }>(
		"/users/:id",
		{
			schema: {
				params: UserParamsSchema,
				body: UpdateUserBodySchema,
				response: {
					200: UpdateUserResponseSchema,
					404: toErrorSchema("User not found"),
					500: toErrorSchema("Internal server error"),
				},
			},
		},
		(request) => updateUser(request, app),
	);
}
