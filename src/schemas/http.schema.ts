import type { ResponseConfig } from "@asteasolutions/zod-to-openapi";

import { z } from "@/config/zod.config";

declare type Method = "get" | "post" | "put" | "delete" | "patch" | "head" | "options" | "trace";

declare interface ResponsesConfig {
	[statusCode: number | string]: ResponseConfig;
}

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
 * Creates a Zod + OpenAPI schema for a no content response.
 *
 * @returns A Zod schema for a no content response
 */
export function toNoContentSchema() {
	return z
		.object({
			statusCode: z.number().openapi({ description: "The HTTP status code" }),
		})
		.openapi({ description: "The no content response" });
}

/**
 * Creates a Zod + OpenAPI schema for a bad request response.
 *
 * @returns A Zod schema for a bad request response
 */
export function toBadRequestSchema() {
	return z
		.object({
			statusCode: z.number().openapi({ description: "The HTTP status code" }),
			message: z.string().openapi({ description: "The error message" }),
		})
		.openapi({ description: "The bad request response" });
}

/**
 * Creates a Zod + OpenAPI schema for a success response.
 *
 * @returns A Zod schema for a success response
 */
export function toSuccessSchema() {
	return z
		.object({
			statusCode: z.number().openapi({ description: "The HTTP status code" }),
		})
		.openapi({ description: "The success response" });
}
