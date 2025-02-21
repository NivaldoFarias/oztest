import Fastify from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { Database } from "@/database";
import { env } from "@/utils";

/**
 * Abstract base server class providing core HTTP server functionality.
 * Handles server lifecycle, database connections, and defines contract for plugins/routes.
 */
export abstract class ServerBase {
	/** Database instance for MongoDB connection management */
	protected readonly database = new Database(env.MONGO_BASE_URI);

	/** Fastify instance configured with Zod for runtime type checking */
	protected readonly app = Fastify({
		logger: { level: env.LOG_LEVEL },
	}).withTypeProvider<ZodTypeProvider>();

	/**
	 * Initializes server components and sets up required configurations.
	 * Calls abstract methods that must be implemented by derived classes.
	 */
	constructor() {
		void this.setupPlugins();
		this.setupRoutes();
	}

	/** Configures and registers server plugins */
	protected abstract setupPlugins(): Promise<void>;

	/** Defines API routes and their handlers */
	protected abstract setupRoutes(): void;

	/**
	 * Starts the server and initializes database connection.
	 *
	 * @param port The port number to listen on
	 * @throws {Error} If server fails to start or database connection fails
	 *
	 * @example
	 * ```typescript
	 * await server.start(3000);
	 * ```
	 */
	public async start(port = env.SERVER_PORT) {
		try {
			await this.database.initialize();
			await this.app.listen({
				port,
				host: "0.0.0.0",
			});
			this.app.log.info(`🚀 Server running at http://localhost:${port}`);
		} catch (error) {
			this.app.log.error("Failed to start server:", error);
			console.error("Failed to start server:", error);
			process.exit(1);
		}
	}

	/**
	 * Gracefully stops the server and closes database connection.
	 *
	 * @example
	 * ```typescript
	 * await server.stop();
	 * ```
	 */
	public async stop() {
		await this.app.close();
		await this.database.close();
	}
}
