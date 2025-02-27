import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { ZodError } from "zod";

import type { FastifyError, FastifyInstance } from "fastify";

import { createBadRequestError, formatZodError } from "@/schemas";
import { env } from "@/utils";
import { AppError } from "@/utils/errors.util";

import { setupOpenAPI } from "./openapi.adapter";

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

	app.setErrorHandler((error: FastifyError | AppError | ZodError, request, reply) => {
		if (error instanceof AppError) {
			return reply.status(error.statusCode).send(error.toResponse());
		}

		if (error instanceof ZodError) {
			return reply.status(400).send(formatZodError(error));
		}

		if (error.validation) {
			// Handle Fastify validation errors (which may wrap Zod errors)
			const zodError = error.validation[0]?.params?.error;
			if (zodError instanceof ZodError) {
				return reply.status(400).send(formatZodError(zodError));
			}

			// Handle other validation errors
			return reply.status(400).send(createBadRequestError(error.message || "Validation failed"));
		}

		if (error.statusCode) {
			return reply.status(error.statusCode).send({
				statusCode: error.statusCode,
				code: error.code || "Error",
				message: error.message,
			});
		}

		// Log unexpected errors
		request.log.error(error);

		// For all other errors, return a generic 500 error
		reply.status(500).send({
			statusCode: 500,
			code: "Internal Server Error",
			message: "An unexpected error occurred",
		});
	});

	await app.register(cors, {
		origin: env.CORS_ORIGIN,
		methods: env.CORS_METHODS.split(","),
		credentials: env.CORS_CREDENTIALS,
	});

	await app.register(sensible);

	await setupOpenAPI(app);
}
