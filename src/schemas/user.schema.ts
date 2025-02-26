import { z } from "@/config/zod.config";

/**
 * Interface defining the structure of query parameters for user listing endpoints.
 * Supports pagination through page number and items per page.
 */
export const GetUsersQuerySchema = z
	.object({
		page: z.number().optional().openapi({ description: "The page number to retrieve" }),
		limit: z.number().optional().openapi({ description: "The number of items per page" }),
	})
	.openapi("GetUsersQuery");

/**
 * Interface defining the structure of URL parameters for user-specific endpoints.
 * Used in routes that require a user identifier.
 */
export const UserParamsSchema = z
	.object({
		id: z.string().openapi({ description: "The ID of the user to retrieve" }),
	})
	.openapi("UserParams");

/**
 * Interface defining the structure of request body for user update operations.
 * Allows partial updates of user properties using Pick utility type.
 */
export const UpdateUserBodySchema = z
	.object({
		update: z
			.object({
				name: z.string().optional().openapi({ description: "The full name of the user" }),
				email: z.string().optional().openapi({ description: "The email address of the user" }),
				address: z.string().optional().openapi({ description: "The physical address of the user" }),
				coordinates: z
					.tuple([z.number(), z.number()])
					.optional()
					.openapi({ description: "The geographical coordinates of the user" }),
			})
			.refine(
				(data) => {
					// At least one of address or coordinates should be provided, but not both
					return (data.address !== undefined) !== (data.coordinates !== undefined);
				},
				{
					message: "Provide either address OR coordinates, but not both or neither",
					path: ["address", "coordinates"],
				},
			),
	})
	.openapi("UpdateUserBody");

/**
 * Schema defining the structure of a user in the system.
 * Contains all user information including ID, personal details,
 * location data and associated regions.
 */
export const UserSchema = z
	.object({
		_id: z.string().openapi({ description: "The ID of the user" }),
		name: z.string().openapi({ description: "The full name of the user" }),
		email: z.string().optional().openapi({ description: "The email address of the user" }),
		address: z.string().openapi({ description: "The physical address of the user" }),
		coordinates: z.tuple([z.number(), z.number()]).openapi({
			description: "The geographical coordinates of the user",
		}),
		regions: z
			.array(z.string())
			.openapi({ description: "The regions the user is associated with" }),
	})
	.openapi("User");

export const GetUsersResponseSchema = z
	.object({
		rows: z.array(UserSchema).openapi({ description: "The list of users" }),
		page: z.number().optional().openapi({ description: "The current page number" }),
		limit: z.number().optional().openapi({ description: "The number of items per page" }),
		total: z.number().openapi({ description: "The total number of users" }),
	})
	.openapi("GetUsersResponse");

export const UpdateUserResponseSchema = z
	.object({
		status: z.number().openapi({ description: "The status code of the response" }),
	})
	.openapi("UpdateUserResponse");

/**
 * Schema for user creation with precise validation rules.
 * Enforces providing either address or coordinates, but not both or neither.
 */
export const CreateUserBodySchema = z
	.object({
		name: z.string().openapi({ description: "The full name of the user" }),
		email: z.string().optional().openapi({ description: "The email address of the user" }),
		address: z.string().optional().openapi({ description: "The physical address of the user" }),
		coordinates: z
			.tuple([z.number(), z.number()])
			.optional()
			.openapi({ description: "The geographical coordinates of the user [longitude, latitude]" }),
	})
	.refine(
		(data) => {
			// At least one of address or coordinates should be provided, but not both
			return (data.address !== undefined) !== (data.coordinates !== undefined);
		},
		{
			message: "Provide either address OR coordinates, but not both or neither",
			path: ["address", "coordinates"],
		},
	)
	.openapi("CreateUserBody");

/**
 * Schema for DELETE user response.
 */
export const DeleteUserResponseSchema = z
	.object({
		status: z.number().openapi({ description: "The status code of the response" }),
		message: z.string().openapi({ description: "Success message" }),
	})
	.openapi("DeleteUserResponse");

export type GetUsersQuery = z.infer<typeof GetUsersQuerySchema>;
export type UserParams = z.infer<typeof UserParamsSchema>;
export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;
export type GetUsersResponse = z.infer<typeof GetUsersResponseSchema>;
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUserBody = z.infer<typeof CreateUserBodySchema>;
export type DeleteUserResponse = z.infer<typeof DeleteUserResponseSchema>;
