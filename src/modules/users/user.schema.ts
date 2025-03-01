import { z } from "@/core/config/zod.config";
import { ObjectIdSchema } from "@/shared/schemas/common.schema";

import * as examples from "./user.examples";

/**
 * Interface defining the structure of query parameters for user listing endpoints.
 * Supports pagination through page number and items per page.
 * Includes filtering and sorting options for enhanced querying capabilities.
 */
export const GetUsersQuerySchema = z
	.object({
		page: z.number().min(1).default(1).openapi({
			description: "The page number to retrieve",
			example: examples.getUsersResponseExample.page,
		}),
		limit: z.number().min(1).max(1_000).default(10).openapi({
			description: "The number of items per page",
			example: examples.getUsersResponseExample.limit,
		}),
		sortBy: z.enum(["name", "email", "createdAt", "updatedAt"]).optional().openapi({
			description: "Field to sort by",
			example: "createdAt",
		}),
		sortDirection: z.enum(["asc", "desc"]).optional().default("asc").openapi({
			description: "Sort direction (ascending or descending)",
			example: "desc",
		}),
		name: z.string().optional().openapi({
			description: "Filter users by name (partial match)",
			example: "John",
		}),
		email: z.string().optional().openapi({
			description: "Filter users by email (partial match)",
			example: "john@example.com",
		}),
	})
	.openapi("GetUsersQuery");

/**
 * Interface defining the structure of URL parameters for user-specific endpoints.
 * Used in routes that require a user identifier.
 */
export const UserParamsSchema = z
	.object({
		id: ObjectIdSchema.openapi({
			description: "The ID of the user to retrieve",
			example: examples.userExample._id,
		}),
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
				name: z.string().optional().openapi({
					description: "The full name of the user",
					example: examples.userExample.name,
				}),
				email: z.string().optional().openapi({
					description: "The email address of the user",
					example: examples.userExample.email,
				}),
				address: z.string().optional().openapi({
					description: "The physical address of the user",
					example: examples.userExample.address,
				}),
				coordinates: z.tuple([z.number(), z.number()]).optional().openapi({
					description: "The geographical coordinates of the user",
					example: examples.userExample.coordinates,
				}),
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
		_id: ObjectIdSchema.openapi({
			description: "The ID of the user",
			example: examples.userExample._id,
		}),
		name: z
			.string()
			.openapi({ description: "The full name of the user", example: examples.userExample.name }),
		email: z.string().email().openapi({
			description: "The email address of the user",
			example: examples.userExample.email,
		}),
		address: z.string().openapi({
			description: "The physical address of the user",
			example: examples.userExample.address,
		}),
		coordinates: z.tuple([z.number(), z.number()]).openapi({
			description: "The geographical coordinates of the user",
			example: examples.userExample.coordinates,
		}),
		regions: z.array(ObjectIdSchema).openapi({
			description: "The regions associated with the user",
			example: examples.userExample.regions,
		}),
		createdAt: z.date().optional().openapi({
			description: "The date and time when the user was created",
			example: examples.userExample.createdAt.toISOString(),
			format: "date-time",
		}),
		updatedAt: z.date().optional().openapi({
			description: "The date and time when the user was last updated",
			example: examples.userExample.updatedAt.toISOString(),
			format: "date-time",
		}),
	})
	.openapi("User");

export const GetUsersResponseSchema = z
	.object({
		rows: z.array(UserSchema).openapi({
			description: "The list of users",
			example: examples.getUsersResponseExample.rows,
		}),
		page: z.number().optional().openapi({
			description: "The current page number",
			example: examples.getUsersResponseExample.page,
		}),
		limit: z.number().optional().openapi({
			description: "The number of items per page",
			example: examples.getUsersResponseExample.limit,
		}),
		total: z.number().openapi({
			description: "The total number of users",
			example: examples.getUsersResponseExample.total,
		}),
	})
	.openapi("GetUsersResponse");

export const UpdateUserResponseSchema = z
	.object({
		status: z.number().openapi({
			description: "The status code of the response",
			example: examples.updateUserResponseExample.status,
		}),
	})
	.openapi("UpdateUserResponse");

/**
 * Schema for user creation with precise validation rules.
 * Enforces providing either address or coordinates, but not both or neither.
 */
export const CreateUserBodySchema = z
	.object({
		name: z.string().openapi({
			description: "The full name of the user",
			example: examples.createUserBodyWithAddressExample.name,
		}),
		email: z.string().optional().openapi({
			description: "The email address of the user",
			example: examples.createUserBodyWithAddressExample.email,
		}),
		address: z.string().optional().openapi({
			description: "The physical address of the user",
			example: examples.createUserBodyWithAddressExample.address,
		}),
		coordinates: z.tuple([z.number(), z.number()]).optional().openapi({
			description: "The geographical coordinates of the user [longitude, latitude]",
			example: examples.createUserBodyWithCoordinatesExample.coordinates,
		}),
	})
	.refine(
		(data) => {
			// Check if exactly one of address or coordinates is provided
			const hasAddress = data.address !== undefined;
			const hasCoordinates = data.coordinates !== undefined;
			return hasAddress ? !hasCoordinates : hasCoordinates;
		},
		{
			message: "Provide either address OR coordinates, but not both or neither",
			path: ["locationData"],
		},
	)
	.openapi("CreateUserBody");

/**
 * Schema for DELETE user response.
 */
export const DeleteUserResponseSchema = z
	.object({
		status: z.number().openapi({
			description: "The status code of the response",
			example: examples.deleteUserResponseExample.status,
		}),
		message: z.string().openapi({
			description: "Success message",
			example: examples.deleteUserResponseExample.message,
		}),
	})
	.openapi("DeleteUserResponse");

/**
 * Schema for user creation success response including the API key
 * This is only returned once during user creation
 */
export const CreateUserResponseSchema = z
	.object({
		user: UserSchema,
		apiKey: z.string().openapi({
			description: "The API key for authentication. Only returned once during user creation.",
			example: examples.createUserResponseExample.apiKey,
		}),
	})
	.openapi("CreateUserResponse");

/**
 * Enhanced response schema for paginated user listings.
 * Includes both data array and comprehensive pagination metadata.
 */
export const GetUsersEnhancedResponseSchema = z
	.object({
		data: z.array(UserSchema).openapi({
			description: "The list of users",
			example: examples.getUsersResponseExample.rows,
		}),
		meta: z
			.object({
				currentPage: z.number().openapi({
					description: "The current page number",
					example: examples.getUsersResponseExample.page,
				}),
				itemsPerPage: z.number().openapi({
					description: "The number of items per page",
					example: examples.getUsersResponseExample.limit,
				}),
				totalItems: z.number().openapi({
					description: "The total number of users",
					example: examples.getUsersResponseExample.total,
				}),
				totalPages: z.number().openapi({
					description: "The total number of pages",
					example: Math.ceil(
						examples.getUsersResponseExample.total / examples.getUsersResponseExample.limit,
					),
				}),
				hasNextPage: z.boolean().openapi({
					description: "Whether there is a next page",
					example:
						examples.getUsersResponseExample.page <
						Math.ceil(
							examples.getUsersResponseExample.total / examples.getUsersResponseExample.limit,
						),
				}),
				hasPreviousPage: z.boolean().openapi({
					description: "Whether there is a previous page",
					example: examples.getUsersResponseExample.page > 1,
				}),
			})
			.openapi({
				description: "Pagination metadata",
			}),
	})
	.openapi("GetUsersEnhancedResponse");

export type GetUsersQuery = z.infer<typeof GetUsersQuerySchema>;
export type UserParams = z.infer<typeof UserParamsSchema>;
export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;
export type GetUsersResponse = z.infer<typeof GetUsersResponseSchema>;
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUserBody = z.infer<typeof CreateUserBodySchema>;
export type DeleteUserResponse = z.infer<typeof DeleteUserResponseSchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
export type GetUsersEnhancedResponse = z.infer<typeof GetUsersEnhancedResponseSchema>;
