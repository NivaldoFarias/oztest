import { z } from "@/config/zod.config";

import * as examples from "./examples/user.examples";

/**
 * Interface defining the structure of query parameters for user listing endpoints.
 * Supports pagination through page number and items per page.
 */
export const GetUsersQuerySchema = z
	.object({
		page: z.number().optional().openapi({
			description: "The page number to retrieve",
			example: examples.getUsersResponseExample.page,
		}),
		limit: z.number().optional().openapi({
			description: "The number of items per page",
			example: examples.getUsersResponseExample.limit,
		}),
	})
	.openapi("GetUsersQuery");

/**
 * Interface defining the structure of URL parameters for user-specific endpoints.
 * Used in routes that require a user identifier.
 */
export const UserParamsSchema = z
	.object({
		id: z.string().openapi({
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
		_id: z
			.string()
			.openapi({ description: "The ID of the user", example: examples.userExample._id }),
		name: z
			.string()
			.openapi({ description: "The full name of the user", example: examples.userExample.name }),
		email: z.string().optional().openapi({
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
		regions: z.array(z.string()).openapi({
			description: "The regions the user is associated with",
			example: examples.userExample.regions,
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
 * Schema for API key regeneration response
 */
export const RegenerateApiKeyResponseSchema = z
	.object({
		apiKey: z.string().openapi({
			description: "The newly generated API key",
			example: examples.regenerateApiKeyResponseExample.apiKey,
		}),
		message: z.string().openapi({
			description: "Success message",
			example: examples.regenerateApiKeyResponseExample.message,
		}),
	})
	.openapi("RegenerateApiKeyResponse");

export type GetUsersQuery = z.infer<typeof GetUsersQuerySchema>;
export type UserParams = z.infer<typeof UserParamsSchema>;
export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;
export type GetUsersResponse = z.infer<typeof GetUsersResponseSchema>;
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUserBody = z.infer<typeof CreateUserBodySchema>;
export type DeleteUserResponse = z.infer<typeof DeleteUserResponseSchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
export type RegenerateApiKeyResponse = z.infer<typeof RegenerateApiKeyResponseSchema>;
