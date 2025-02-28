import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { MongoError } from "mongodb";
import { ZodError } from "zod";

import type { FastifyError, FastifyInstance } from "fastify";

import { formatZodError } from "@/schemas";
import { env } from "@/utils";
import { AppError, BadRequestError, InternalServerError } from "@/utils/errors.util";

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

	app.setErrorHandler((error: FastifyError | AppError | ZodError | MongoError, request, reply) => {
		request.log.error(error);

		if (error instanceof AppError) {
			return reply.status(error.statusCode).send(error);
		}

		if (error instanceof ZodError) {
			return reply.status(400).send(formatZodError(error));
		}

		if (error instanceof MongoError) {
			return reply.status(500).send(new InternalServerError("A database error occurred"));
		}

		if (error.validation) {
			const zodError = error.validation[0]?.params?.error;
			if (zodError instanceof ZodError) {
				return reply.status(400).send(formatZodError(zodError));
			}

			return reply.status(400).send(new BadRequestError(error.message || "Validation failed"));
		}

		if (error.statusCode) {
			return reply.status(error.statusCode).send({
				statusCode: error.statusCode,
				code: error.code || "Error",
				message: error.message,
			});
		}

		reply.status(500).send(new InternalServerError("An unexpected error occurred"));
	});

	await app.register(cors, {
		origin: env.CORS_ORIGIN,
		methods: env.CORS_METHODS.split(","),
		credentials: env.CORS_CREDENTIALS,
	});

	await app.register(sensible);

	await setupOpenAPI(app);
}
