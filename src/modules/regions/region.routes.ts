import { z } from "zod";

import type { FastifyInstance } from "fastify";

import type {
	CreateRegionBody,
	RegionParams,
	UpdateRegionBody,
} from "@/modules/regions/region.schema";
import type { GetUsersQuery } from "@/modules/users/user.schema";

import { ErrorSchemas } from "@/core/errors/error.schema";
import {
	createRegion,
	deleteRegion,
	getRegionById,
	getRegions,
	getUserRegions,
	updateRegion,
} from "@/modules/regions/region.controller";
import {
	CreateRegionBodySchema,
	DeleteRegionResponseSchema,
	GetRegionsResponseSchema,
	RegionParamsSchema,
	RegionSchema,
	UpdateRegionBodySchema,
	UpdateRegionResponseSchema,
} from "@/modules/regions/region.schema";
import { GetUsersQuerySchema } from "@/modules/users/user.schema";

export function setupRegionRoutes(app: FastifyInstance) {
	app.get<{ Querystring: GetUsersQuery }>(
		"/regions",
		{
			schema: {
				querystring: GetUsersQuerySchema,
				response: {
					200: GetRegionsResponseSchema,
					400: ErrorSchemas.badRequest,
					401: ErrorSchemas.unauthorized,
					500: ErrorSchemas.internalError,
				},
			},
		},
		getRegions,
	);

	app.get<{ Params: { userId: string }; Querystring: GetUsersQuery }>(
		"/users/:userId/regions",
		{
			schema: {
				params: z.object({ userId: z.string() }),
				querystring: GetUsersQuerySchema,
				response: {
					200: GetRegionsResponseSchema,
					400: ErrorSchemas.badRequest,
					401: ErrorSchemas.unauthorized,
					404: ErrorSchemas.notFound,
					500: ErrorSchemas.internalError,
				},
			},
		},
		(request) => getUserRegions(request, app),
	);

	app.post<{ Body: CreateRegionBody; Params: { userId: string } }>(
		"/users/:userId/regions",
		{
			schema: {
				params: z.object({ userId: z.string() }),
				body: CreateRegionBodySchema,
				response: {
					201: RegionSchema,
					400: ErrorSchemas.badRequest,
					401: ErrorSchemas.unauthorized,
					404: ErrorSchemas.notFound,
					500: ErrorSchemas.internalError,
				},
			},
		},
		(request) => createRegion(request, app),
	);

	app.get<{ Params: RegionParams }>(
		"/regions/:id",
		{
			schema: {
				params: RegionParamsSchema,
				response: {
					200: RegionSchema,
					400: ErrorSchemas.badRequest,
					401: ErrorSchemas.unauthorized,
					404: ErrorSchemas.notFound,
					500: ErrorSchemas.internalError,
				},
			},
		},
		(request) => getRegionById(request, app),
	);

	app.put<{ Params: RegionParams; Body: UpdateRegionBody }>(
		"/regions/:id",
		{
			schema: {
				params: RegionParamsSchema,
				body: UpdateRegionBodySchema,
				response: {
					200: UpdateRegionResponseSchema,
					400: ErrorSchemas.badRequest,
					401: ErrorSchemas.unauthorized,
					404: ErrorSchemas.notFound,
					500: ErrorSchemas.internalError,
				},
			},
		},
		(request) => updateRegion(request, app),
	);

	app.delete<{ Params: RegionParams }>(
		"/regions/:id",
		{
			schema: {
				params: RegionParamsSchema,
				response: {
					200: DeleteRegionResponseSchema,
					400: ErrorSchemas.badRequest,
					401: ErrorSchemas.unauthorized,
					404: ErrorSchemas.notFound,
					500: ErrorSchemas.internalError,
				},
			},
		},
		(request) => deleteRegion(request, app),
	);
}
