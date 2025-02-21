import { z } from "zod";

import type { FastifyInstance } from "fastify";

import type { GetUsersQuery, UpdateUserBody, UserParams } from "@/schemas";

import { GetUsersQuerySchema, UpdateUserBodySchema, UserParamsSchema } from "@/schemas";

import { getUserById, getUsers, updateUser } from "./handlers";

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
					"2xx": z.object({
						rows: z.array(
							z.object({
								_id: z.string(),
								name: z.string(),
								email: z.string(),
								address: z.string(),
								coordinates: z.tuple([z.number(), z.number()]),
								regions: z.array(z.string()),
							}),
						),
						page: z.number().optional(),
						limit: z.number().optional(),
						total: z.number(),
					}),
				},
			},
		},
		getUsers,
	);

	app.get<{ Params: UserParams }>(
		"/users/:id",
		{
			schema: {
				params: UserParamsSchema,
				response: {
					200: z.object({
						_id: z.string(),
						name: z.string(),
						email: z.string(),
						address: z.string(),
						coordinates: z.tuple([z.number(), z.number()]),
						regions: z.array(z.string()),
					}),
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
					200: z.object({
						status: z.number(),
					}),
				},
			},
		},
		(request) => updateUser(request, app),
	);
}
