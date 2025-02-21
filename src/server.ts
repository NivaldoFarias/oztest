import { ServerBase } from "./api/base/server.base";
import { setupPlugins } from "./api/fastify/plugins";
import { setupRoutes } from "./api/fastify/routes";

/**
 * Main server implementation extending the base server with Fastify-specific configurations.
 * Implements abstract methods for plugin and route setup.
 */
class Server extends ServerBase {
	/**
	 * Configures Fastify plugins by delegating to the plugins module.
	 */
	protected async setupPlugins() {
		await setupPlugins(this.app);
	}

	/**
	 * Sets up API routes by delegating to the routes module.
	 */
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
