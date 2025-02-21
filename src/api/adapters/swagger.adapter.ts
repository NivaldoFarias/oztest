import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import swagger from "@fastify/swagger";
import scalarReference from "@scalar/fastify-api-reference";

import type { FastifyInstance } from "fastify";

import { registry } from "@/config/registry.config";
import { env } from "@/utils/";

import pkgJson from "../../../package.json";

/**
 * Configures Swagger documentation with proper Zod schema integration.
 * Uses zod-to-openapi to generate OpenAPI specifications from Zod schemas.
 *
 * @param app The Fastify instance to configure Swagger for
 *
 * @example
 * ```typescript
 * await setupSwagger(fastifyApp);
 * ```
 */
export async function setupSwagger(app: FastifyInstance) {
	const document = new OpenApiGeneratorV3(registry.definitions).generateDocument({
		openapi: "3.0.0",
		info: {
			title: "DevOZ API Documentation",
			description: "API documentation for the DevOZ tech test",
			version: pkgJson.version,
		},
		servers: [
			{
				url: `http://localhost:${env.SERVER_PORT}`,
				description: "Local development server",
			},
		],
	});

	await app.register(swagger, {
		openapi: document,
		hideUntagged: true,
	});

	await app.register(scalarReference, {
		routePrefix: "/docs",
		configuration: {
			spec: {
				content: document,
			},
		},
	});
}
