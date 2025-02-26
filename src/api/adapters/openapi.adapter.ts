import { join } from "path";

import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import fastifyStatic from "@fastify/static";
import scalarReference from "@scalar/fastify-api-reference";

import type { FastifyInstance } from "fastify";

import { registry } from "@/config/registry.config";
import { env } from "@/utils/";

import pkgJson from "../../../package.json";

/**
 * Configures OpenAPI documentation with proper Zod schema integration.
 * Uses zod-to-openapi to generate OpenAPI specifications from Zod schemas.
 *
 * @param app The Fastify instance to configure OpenAPI for
 *
 * @example
 * ```typescript
 * await setupOpenAPI(fastifyApp);
 * ```
 */
export async function setupOpenAPI(app: FastifyInstance) {
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

	await app.register(fastifyStatic, {
		root: join(process.cwd(), "public"),
		prefix: "/public/",
	});

	await app.register(scalarReference, {
		routePrefix: "/docs",
		configuration: {
			spec: {
				content: document,
			},
			favicon: "/public/favicon.ico",
		},
	});
}
