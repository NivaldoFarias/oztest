import { z } from "zod";

/**
 * Common pagination parameters used across list endpoints.
 * Provides standardized query parameters for paginated responses.
 */
export const PaginationQuerySchema = z.object({
	page: z.coerce.number().positive().optional().default(1),
	limit: z.coerce.number().positive().optional().default(10),
});

/**
 * Geographic coordinates schema used across location-based endpoints.
 * Represents a point as [longitude, latitude] tuple following GeoJSON format.
 */
export const CoordinatesSchema = z.tuple([
	z.number().min(-180).max(180), // longitude
	z.number().min(-90).max(90), // latitude
]);

/**
 * Common response metadata for paginated results.
 * Provides information about the current page, total items, and more.
 */
export const PaginationMetaSchema = z.object({
	currentPage: z.number(),
	itemsPerPage: z.number(),
	totalItems: z.number(),
	totalPages: z.number(),
	hasNextPage: z.boolean(),
	hasPreviousPage: z.boolean(),
});

/**
 * Generic paginated response wrapper.
 * Wraps any data type with standardized pagination metadata.
 */
export const createPaginatedSchema = <T extends z.ZodType>(schema: T) =>
	z.object({
		data: z.array(schema),
		meta: PaginationMetaSchema,
	});

/**
 * Common error response schema.
 * Standardizes error responses across the API.
 */
export const ErrorResponseSchema = z.object({
	statusCode: z.number(),
	error: z.string(),
	message: z.string(),
});

// Export inferred types
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
