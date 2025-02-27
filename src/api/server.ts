import { setupPlugins, setupRoutes } from "@/api/adapters/";
import { ServerBase } from "@/api/server.base";
import { setupRateLimiting } from "@/auth/rate-limit.middleware";

/**
 * Main server implementation extending the base server with Fastify-specific configurations.
 * Implements abstract methods for plugin and route setup.
 */
class Server extends ServerBase {
	/** Configures Fastify plugins by delegating to the plugins module. */
	protected async setupPlugins() {
		await setupPlugins(this.app);

		// Configure rate limiting for authentication-sensitive endpoints
		await setupRateLimiting(this.app, {
			max: 10, // Maximum 10 attempts
			timeWindow: 60 * 1000, // Per minute
			routes: ["/auth", "/users"], // Apply to authentication endpoints
			errorMessage: "Too many authentication attempts, please try again later",
		});
	}

	/** Sets up API routes by delegating to the routes module. */
	protected setupRoutes() {
		setupRoutes(this.app);
	}
}

/**
 * Singleton instance of the Server class.
 * Use this to start and manage the application server.
 *
 * @example
 * ```typescript
 * import server from './server';
 * await server.start();
 * ```
 */
export default new Server();
