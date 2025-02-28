import type { FastifyInstance } from "fastify";

import { createAuthMiddleware } from "@/modules/auth/auth.middleware";
import { setupAuthRoutes } from "@/modules/auth/auth.routes";
import { setupRegionRoutes } from "@/modules/regions/region.routes";
import { setupUserRoutes } from "@/modules/users/user.routes";
import { PUBLIC_ROUTES } from "@/utils/constants.util";

/**
 * Configures API routes for the Fastify server instance.
 * Sets up endpoints with request/response validation schemas and connects them to handlers.
 *
 * @param app The Fastify instance to configure routes for
 *
 * @example
 * ```typescript
 * setupRoutes(fastifyApp);
 * ```
 */
export function setupRoutes(app: FastifyInstance) {
	app.addHook("onRequest", createAuthMiddleware(app, { publicRoutes: PUBLIC_ROUTES }));

	setupAuthRoutes(app);
	setupUserRoutes(app);
	setupRegionRoutes(app);
}
