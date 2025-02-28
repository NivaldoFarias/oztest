import { setupPlugins } from "@/api/adapters/plugins.adapter";
import { setupRateLimiting } from "@/api/middlewares/rate-limit.middleware";
import { setupRoutes } from "@/api/routes";
import { ServerBase } from "@/api/server.base";

/**
 * Main server implementation extending the base server with Fastify-specific configurations.
 * Implements abstract methods for plugin and route setup.
 */
class Server extends ServerBase {
	/** Configures Fastify plugins by delegating to the plugins module. */
	protected async setupPlugins() {
		await setupPlugins(this.app);

		await setupRateLimiting(this.app, {
			max: 10,
			timeWindow: 60_000,
			routes: ["/auth", "/users"],
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
