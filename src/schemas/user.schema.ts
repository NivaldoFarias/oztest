import { z } from "zod";

/**
 * Interface defining the structure of query parameters for user listing endpoints.
 * Supports pagination through page number and items per page.
 */
export const GetUsersQuerySchema = z.object({
	page: z.number().optional(),
	limit: z.number().optional(),
});

/**
 * Interface defining the structure of URL parameters for user-specific endpoints.
 * Used in routes that require a user identifier.
 */
export const UserParamsSchema = z.object({
	id: z.string(),
});

/**
 * Interface defining the structure of request body for user update operations.
 * Allows partial updates of user properties using Pick utility type.
 */
export const UpdateUserBodySchema = z.object({
	update: z.object({
		name: z.string().optional(),
		email: z.string().optional(),
		address: z.string().optional(),
		coordinates: z.tuple([z.number(), z.number()]).optional(),
	}),
});

export type GetUsersQuery = z.infer<typeof GetUsersQuerySchema>;
export type UserParams = z.infer<typeof UserParamsSchema>;
export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;
