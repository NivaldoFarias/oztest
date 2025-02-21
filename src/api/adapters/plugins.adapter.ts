import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

import type { FastifyInstance } from "fastify";

import { env } from "@/utils";

import { setupSwagger } from "./swagger.adapter";

/**
 * Configures Fastify plugins and middleware for the server instance.
 * Sets up CORS, validation compilers, and HTTP utilities.
 *
 * @param app The Fastify instance to configure
 *
 * @example
 * ```typescript
 * await setupPlugins(fastifyApp);
 * ```
 */
export async function setupPlugins(app: FastifyInstance) {
	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);

	await app.register(cors, {
		origin: env.CORS_ORIGIN,
		methods: env.CORS_METHODS.split(","),
		credentials: env.CORS_CREDENTIALS,
	});

	await app.register(sensible);

	await setupSwagger(app);
}
