import type { ResponseConfig } from "@asteasolutions/zod-to-openapi";

import { z } from "@/config/zod.config";

/**
 * Standard error description constants to ensure consistency across the application.
 * These should be used when creating error schemas to maintain uniform error messaging.
 */
export const ERROR_DESCRIPTIONS = {
	BAD_REQUEST: "Bad request",
	UNAUTHORIZED: "Unauthorized",
	FORBIDDEN: "Forbidden",
	NOT_FOUND: "Resource not found",
	CONFLICT: "Resource conflict",
	INTERNAL_ERROR: "Internal server error",
	SERVICE_UNAVAILABLE: "Service unavailable",
} as const;

/**
 * Creates a Zod + OpenAPI response config for a given model and method.
 *
 * @param schema The Zod schema to use for the response
 * @param options The options to use for the response
 * @returns A Zod schema for a success response
 */
export function toResponseConfig(
	schema: z.ZodObject<any>,
	options?: Omit<ResponseConfig, "content">,
): ResponseConfig {
	return {
		content: { "application/json": { schema } },
		description: options?.description ?? "The response",
		headers: options?.headers ?? {},
		links: options?.links ?? {},
	};
}

/**
 * Creates a Zod + OpenAPI schema for an error response.
 *
 * @param message The error message to include in the response
 * @returns A Zod schema for an error response
 */
export function toErrorSchema(message: string) {
	return z
		.object({
			statusCode: z.number().openapi({ description: "The HTTP status code" }),
			message: z.literal(message).openapi({ description: "The error message" }),
		})
		.openapi({ description: `The ${message} error response` });
}

/**
 * Creates a generic error response schema that accepts any error message.
 *
 * @param description Documentation description for this error type
 * @returns A Zod schema for error responses with flexible message field
 */
export function createErrorSchema(description = "Error response") {
	return z
		.object({
			statusCode: z.number().openapi({ description: "HTTP status code" }),
			error: z.string().openapi({ description: "Error type" }),
			message: z.string().openapi({
				description: "Detailed error message",
				example: description,
			}),
		})
		.openapi({ description });
}

// Reusable error schemas for common status codes
export const ErrorSchemas = {
	badRequest: createErrorSchema(ERROR_DESCRIPTIONS.BAD_REQUEST),
	unauthorized: createErrorSchema(ERROR_DESCRIPTIONS.UNAUTHORIZED),
	notFound: createErrorSchema(ERROR_DESCRIPTIONS.NOT_FOUND),
	internalError: createErrorSchema(ERROR_DESCRIPTIONS.INTERNAL_ERROR),
};
