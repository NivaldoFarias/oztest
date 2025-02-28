import type { FastifyInstance, FastifyRequest } from "fastify";

import { UserModel } from "@/models";
import { AppError, InternalServerError, NotFoundError } from "@/utils/";

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

		const newApiKey = ApiKeyService.generate();
		const apiKeyHash = ApiKeyService.hash(newApiKey);

		const user = await UserModel.findByIdAndUpdate(userId, { apiKeyHash }, { new: true });

		if (!user) throw new NotFoundError("User not found");

		app.log.info(`API key regenerated for user ${userId}`);

		return {
			apiKey: newApiKey,
			message: "API key regenerated successfully",
		};
	} catch (error) {
		app.log.error("Failed to regenerate API key:", error);

		if (error instanceof AppError) throw error;

		throw new InternalServerError("Failed to regenerate API key");
	}
}
