import { z } from "@/config/zod.config";

/**
 * Common pagination parameters used across list endpoints.
 * Provides standardized query parameters for paginated responses.
 */
export const PaginationQuerySchema = z
	.object({
		page: z.coerce
			.number()
			.positive()
			.optional()
			.default(1)
			.openapi({ description: "The page number to retrieve" }),
		limit: z.coerce
			.number()
			.positive()
			.optional()
			.default(10)
			.openapi({ description: "The number of items per page" }),
	})
	.openapi("PaginationQuery");

/**
 * Geographic coordinates schema used across location-based endpoints.
 * Represents a point as [longitude, latitude] tuple following GeoJSON format.
 */
export const CoordinatesSchema = z
	.tuple([
		z.number().min(-180).max(180).openapi({ description: "The longitude of the location" }), // longitude
		z.number().min(-90).max(90).openapi({ description: "The latitude of the location" }), // latitude
	])
	.openapi("Coordinates");
/**
 * Common response metadata for paginated results.
 * Provides information about the current page, total items, and more.
 */
export const PaginationMetaSchema = z
	.object({
		currentPage: z.number().openapi({ description: "The current page number" }),
		itemsPerPage: z.number().openapi({ description: "The number of items per page" }),
		totalItems: z.number().openapi({ description: "The total number of items" }),
		totalPages: z.number().openapi({ description: "The total number of pages" }),
		hasNextPage: z.boolean().openapi({ description: "Whether there is a next page" }),
		hasPreviousPage: z.boolean().openapi({ description: "Whether there is a previous page" }),
	})
	.openapi("PaginationMeta");

/**
 * Generic paginated response wrapper.
 * Wraps any data type with standardized pagination metadata.
 */
export const createPaginatedSchema = <T extends z.ZodType>(schema: T) =>
	z
		.object({
			data: z.array(schema).openapi({ description: "The paginated data" }),
			meta: PaginationMetaSchema.openapi({ description: "The pagination metadata" }),
		})
		.openapi("PaginatedResponse");

export const HeadersSchema = z.object({
	"x-api-key": z.string().openapi({ description: "The API key" }),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type Headers = z.infer<typeof HeadersSchema>;
