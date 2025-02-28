import type { ResponseConfig } from "@asteasolutions/zod-to-openapi";

import { z } from "@/config/zod.config";

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
