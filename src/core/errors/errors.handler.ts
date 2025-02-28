import { MongoError } from "mongodb";
import { match, P } from "ts-pattern";
import { ZodError } from "zod";

import type { FastifyError, FastifyInstance } from "fastify";

import { formatZodError } from "@/core/errors/error.schema";
import { AppError, BadRequestError, InternalServerError } from "@/core/errors/errors.util";

/**
 * Sets up a global error handler for the Fastify application.
 * Uses pattern matching to handle different types of errors with appropriate responses.
 *
 * @param app The Fastify instance to configure with error handling
 *
 * @example
 * ```typescript
 * setupErrorHandler(fastifyApp);
 * ```
 */
export function setupErrorHandler(app: FastifyInstance) {
	app.setErrorHandler((error: FastifyError | AppError | ZodError | MongoError, request, reply) => {
		request.log.error(error);

		return match(error)
			.with(P.instanceOf(AppError), (error) => {
				return reply.status(error.statusCode).send(error);
			})
			.with(P.instanceOf(ZodError), (error) => {
				return reply.status(400).send(formatZodError(error));
			})
			.with(P.instanceOf(MongoError), () => {
				return reply.status(500).send(new InternalServerError("A database error occurred"));
			})
			.with({ validation: P.not(P.nullish) }, (error) => {
				return match(error.validation[0]?.params?.error)
					.with(P.instanceOf(ZodError), (zodError) => {
						return reply.status(400).send(formatZodError(zodError));
					})
					.otherwise(() => {
						return reply
							.status(400)
							.send(new BadRequestError(error.message || "Validation failed"));
					});
			})
			.with({ statusCode: P.number }, (error) => {
				return reply.status(error.statusCode).send({
					statusCode: error.statusCode,
					code: error.code || "Error",
					message: error.message,
				});
			})
			.otherwise(() => {
				return reply.status(500).send(new InternalServerError("An unexpected error occurred"));
			});
	});
}
