import { z } from "@/config/zod.config";

import { CoordinatesSchema } from "./common.schema";
import * as examples from "./examples/region.examples";

export const RegionParamsSchema = z
	.object({
		id: z.string().uuid().openapi({
			description: "Region ID",
			example: examples.regionExample._id,
		}),
	})
	.openapi("RegionParams");

export const CreateRegionBodySchema = z
	.object({
		name: z.string().min(3).max(100).openapi({
			description: "Region name",
			example: examples.createRegionBodyExample.name,
		}),
		geometry: z
			.object({
				type: z.literal("Polygon"),
				coordinates: z.array(z.array(CoordinatesSchema)).min(3),
			})
			.openapi({
				description: "GeoJSON geometry object",
				example: examples.createRegionBodyExample.geometry,
			}),
	})
	.openapi("CreateRegionBody");

export const UpdateRegionBodySchema = z
	.object({
		update: z.object({
			name: z.string().min(3).max(100).optional().openapi({
				description: "Updated region name",
				example: examples.updateRegionBodyNameExample.update.name,
			}),
			geometry: z
				.object({
					type: z.literal("Polygon").optional(),
					coordinates: z.array(z.array(CoordinatesSchema)).min(3).optional(),
				})
				.optional()
				.openapi({
					description: "Updated GeoJSON geometry object",
					example: examples.updateRegionBodyGeometryExample.update.geometry,
				}),
		}),
	})
	.openapi("UpdateRegionBody");

export const RegionSchema = z
	.object({
		_id: z.string().openapi({
			description: "The unique identifier for the region",
			example: examples.regionExample._id,
		}),
		name: z.string().openapi({
			description: "The name of the region",
			example: examples.regionExample.name,
		}),
		user: z.string().openapi({
			description: "The ID of the user who owns this region",
			example: examples.regionExample.user,
		}),
		geometry: z
			.object({
				type: z.literal("Polygon"),
				coordinates: z.array(z.array(CoordinatesSchema)),
			})
			.openapi({
				description: "The GeoJSON geometry defining the region's boundaries",
				example: examples.regionExample.geometry,
			}),
		createdAt: z.date().openapi({
			description: "The date and time when the region was created",
			example: examples.regionExample.createdAt.toISOString(),
			format: "date-time",
		}),
		updatedAt: z.date().openapi({
			description: "The date and time when the region was last updated",
			example: examples.regionExample.updatedAt.toISOString(),
			format: "date-time",
		}),
	})
	.openapi("Region");

export const GetRegionsResponseSchema = z
	.object({
		rows: z.array(RegionSchema).openapi({
			description: "The list of regions",
			example: examples.getRegionsResponseExample.rows,
		}),
		page: z.number().openapi({
			description: "The current page number",
			example: examples.getRegionsResponseExample.page,
		}),
		limit: z.number().openapi({
			description: "The number of items per page",
			example: examples.getRegionsResponseExample.limit,
		}),
		total: z.number().openapi({
			description: "The total number of regions",
			example: examples.getRegionsResponseExample.total,
		}),
	})
	.openapi("GetRegionsResponse");

export const UpdateRegionResponseSchema = z
	.object({
		status: z.number().openapi({
			description: "The status code of the response",
			example: examples.updateRegionResponseExample.status,
		}),
	})
	.openapi("UpdateRegionResponse");

export const DeleteRegionResponseSchema = z
	.object({
		status: z.number().openapi({
			description: "The status code of the response",
			example: examples.deleteRegionResponseExample.status,
		}),
		message: z.string().openapi({
			description: "Success message",
			example: examples.deleteRegionResponseExample.message,
		}),
	})
	.openapi("DeleteRegionResponse");

export type RegionParams = z.infer<typeof RegionParamsSchema>;
export type CreateRegionBody = z.infer<typeof CreateRegionBodySchema>;
export type UpdateRegionBody = z.infer<typeof UpdateRegionBodySchema>;
export type Region = z.infer<typeof RegionSchema>;
export type GetRegionsResponse = z.infer<typeof GetRegionsResponseSchema>;
export type UpdateRegionResponse = z.infer<typeof UpdateRegionResponseSchema>;
export type DeleteRegionResponse = z.infer<typeof DeleteRegionResponseSchema>;
