import { z } from "@/config/zod.config";

import * as examples from "./auth.examples";

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

export type RegenerateApiKeyResponse = z.infer<typeof RegenerateApiKeyResponseSchema>;
