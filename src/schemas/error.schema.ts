import { ZodError } from "zod";

import { z } from "@/config/zod.config";

/**
 * Base error response schema for standardizing error formats across the API.
 * Contains the essential fields for any error response.
 */
export const BaseErrorSchema = z
	.object({
		statusCode: z.number().openapi({ description: "The HTTP status code" }),
		code: z.string().openapi({ description: "The error code" }),
		message: z.string().openapi({ description: "The human-readable error message" }),
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
 * Schema for bad request errors with dynamic messages.
 */
export const BadRequestErrorSchema = BaseErrorSchema.openapi("BadRequestError");

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

/**
 * Creates a generic error response object.
 *
 * @param statusCode The HTTP status code
 * @param error The error type identifier
 * @param message The human-readable error message
 *
 * @returns A formatted error object
 */
export function createErrorResponse(statusCode: number, code: string, message: string) {
	return {
		statusCode,
		code,
		message,
	};
}

/**
 * Creates a bad request error response.
 *
 * @param message The specific error message describing the bad request
 *
 * @returns A formatted bad request error object
 */
export function createBadRequestError(message: string) {
	return {
		statusCode: 400,
		code: "Bad Request",
		message,
	};
}

export type BaseError = z.infer<typeof BaseErrorSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type BadRequestError = z.infer<typeof BadRequestErrorSchema>;
