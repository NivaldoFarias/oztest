import { ZodError } from "zod";

import { z } from "@/config/zod.config";

function createErrorSchema(
	name: string,
	{
		statusCode,
		code,
		message,
	}: {
		statusCode: number;
		code: string;
		message: string;
	},
) {
	return z
		.object({
			statusCode: z.number().openapi({ description: "The HTTP status code", example: statusCode }),
			code: z.string().openapi({ description: "The error code", example: code }),
			message: z
				.string()
				.openapi({ description: "The human-readable error message", example: message }),
		})
		.openapi(name);
}
/**
 * Base error response schema for standardizing error formats across the API.
 * Contains the essential fields for any error response.
 */
export const BaseErrorSchema = z
	.object({
		statusCode: z.number().openapi({ description: "The HTTP status code", example: 400 }),
		code: z.string().openapi({ description: "The error code", example: "BadRequestError" }),
		message: z.string().openapi({
			description: "The human-readable error message",
			example: "The request data failed validation",
		}),
	})
	.openapi("BaseError");

/**
 * Extended error schema for validation errors that includes detailed validation issues.
 */
export const ValidationErrorSchema = BaseErrorSchema.extend({
	validation: z
		.array(
			z.object({
				path: z.array(z.string().or(z.number())).openapi({
					description: "Path to the field with validation error",
				}),
				message: z.string().openapi({ description: "Validation error message" }),
			}),
		)
		.optional()
		.openapi({ description: "Detailed validation issues" }),
}).openapi("ValidationError");

/**
 * Formats a Zod error into a standardized validation error response.
 * Extracts useful information from Zod's error structure.
 *
 * @param error The Zod error to format
 * @param statusCode The HTTP status code to use (defaults to 400)
 *
 * @returns A formatted validation error object
 */
export function formatZodError(error: ZodError, statusCode = 400) {
	return {
		statusCode,
		code: "Validation Error",
		message: "The request data failed validation",
		validation: error.errors.map((issue) => ({
			path: issue.path,
			message: issue.message,
		})),
	};
}

export const ErrorSchemas = {
	/** Schema for bad request errors with dynamic messages */
	badRequest: createErrorSchema("BadRequestError", {
		statusCode: 400,
		code: "BadRequestError",
		message: "The request data failed validation",
	}),

	/** Schema for internal server errors with dynamic messages */
	internalError: createErrorSchema("InternalServerError", {
		statusCode: 500,
		code: "InternalServerError",
		message: "An internal server error occurred",
	}),

	/** Schema for not found errors with dynamic messages */
	notFound: createErrorSchema("NotFoundError", {
		statusCode: 404,
		code: "NotFoundError",
		message: "The requested resource was not found",
	}),

	/** Schema for unauthorized errors with dynamic messages */
	unauthorized: createErrorSchema("UnauthorizedError", {
		statusCode: 401,
		code: "UnauthorizedError",
		message: "The request is unauthorized",
	}),

	/** Schema for conflict errors with dynamic messages */
	conflict: createErrorSchema("ConflictError", {
		statusCode: 409,
		code: "ConflictError",
		message: "The request could not be processed due to a conflict",
	}),

	/** Schema for forbidden errors with dynamic messages */
	forbidden: createErrorSchema("ForbiddenError", {
		statusCode: 403,
		code: "ForbiddenError",
		message: "The request is forbidden",
	}),

	/** Schema for service unavailable errors with dynamic messages */
	serviceUnavailable: createErrorSchema("ServiceUnavailableError", {
		statusCode: 503,
		code: "ServiceUnavailableError",
		message: "The service is temporarily unavailable",
	}),
};

export type BaseError = z.infer<typeof BaseErrorSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type BadRequestError = z.infer<typeof ErrorSchemas.badRequest>;
export type InternalServerError = z.infer<typeof ErrorSchemas.internalError>;
export type NotFoundError = z.infer<typeof ErrorSchemas.notFound>;
export type UnauthorizedError = z.infer<typeof ErrorSchemas.unauthorized>;
export type ConflictError = z.infer<typeof ErrorSchemas.conflict>;
export type ForbiddenError = z.infer<typeof ErrorSchemas.forbidden>;
export type ServiceUnavailableError = z.infer<typeof ErrorSchemas.serviceUnavailable>;
