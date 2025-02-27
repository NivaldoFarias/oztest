import type { FastifyInstance, FastifyRequest } from "fastify";

import { UserModel } from "@/models";

import { ApiKeyService } from "./api-key.service";

/**
 * Regenerates an API key for the authenticated user
 * Creates a new API key, hashes it, and updates the user's record
 *
 * @param request - The Fastify request object containing the authenticated user
 * @param app - The Fastify instance for error handling
 * @returns The regenerated API key
 *
 * @example
 * ```typescript
 * app.post('/auth/regenerate-key',
 *   (req, reply) => regenerateApiKey(req, app)
 * );
 * ```
 */
export async function regenerateApiKey(request: FastifyRequest, app: FastifyInstance) {
	try {
		const userId = request.user._id;

		// Generate a new API key
		const newApiKey = ApiKeyService.generate();
		const apiKeyHash = ApiKeyService.hash(newApiKey);

		// Update the user with the new hashed API key
		const user = await UserModel.findByIdAndUpdate(userId, { apiKeyHash }, { new: true });

		if (!user) {
			throw app.httpErrors.notFound("User not found");
		}

		// Log the successful regeneration
		app.log.info(`API key regenerated for user ${userId}`);

		return {
			apiKey: newApiKey,
			message: "API key regenerated successfully",
		};
	} catch (error) {
		app.log.error("Failed to regenerate API key:", error);

		// If error was already created by us, pass it through
		if ((error as any).statusCode) {
			throw error;
		}

		throw app.httpErrors.internalServerError("Failed to regenerate API key");
	}
}
