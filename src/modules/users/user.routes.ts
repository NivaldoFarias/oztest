import type { FastifyInstance } from "fastify";

import type {
	CreateUserBody,
	GetUsersQuery,
	UpdateUserBody,
	UserParams,
} from "@/modules/users/user.schema";

import {
	createUser,
	deleteUser,
	getUserById,
	getUsers,
	updateUser,
} from "@/modules/users/user.controller";
import {
	CreateUserBodySchema,
	CreateUserResponseSchema,
	DeleteUserResponseSchema,
	GetUsersQuerySchema,
	GetUsersResponseSchema,
	UpdateUserBodySchema,
	UpdateUserResponseSchema,
	UserParamsSchema,
	UserSchema,
} from "@/modules/users/user.schema";
import { ErrorSchemas } from "@/schemas";

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
export function setupUserRoutes(app: FastifyInstance) {
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
					400: ErrorSchemas.badRequest,
					401: ErrorSchemas.unauthorized,
					500: ErrorSchemas.internalError,
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
					201: CreateUserResponseSchema,
					400: ErrorSchemas.badRequest,
					401: ErrorSchemas.unauthorized,
					409: ErrorSchemas.conflict,
					500: ErrorSchemas.internalError,
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
					400: ErrorSchemas.badRequest,
					401: ErrorSchemas.unauthorized,
					404: ErrorSchemas.notFound,
					500: ErrorSchemas.internalError,
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
					400: ErrorSchemas.badRequest,
					401: ErrorSchemas.unauthorized,
					404: ErrorSchemas.notFound,
					409: ErrorSchemas.conflict,
					500: ErrorSchemas.internalError,
				},
			},
		},
		(request) => updateUser(request, app),
	);

	app.delete<{ Params: UserParams }>(
		"/users/:id",
		{
			schema: {
				params: UserParamsSchema,
				response: {
					200: DeleteUserResponseSchema,
					400: ErrorSchemas.badRequest,
					401: ErrorSchemas.unauthorized,
					404: ErrorSchemas.notFound,
					500: ErrorSchemas.internalError,
				},
			},
		},
		(request) => deleteUser(request, app),
	);
}
