import Fastify from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { Database } from "@/core/database/database";
import { env } from "@/core/utils";

/**
 * Abstract base server class providing core HTTP server functionality.
 * Handles server lifecycle, database connections, and defines contract for plugins/routes.
 */
export abstract class ServerBase {
	/** Database instance for MongoDB connection management */
	protected readonly database: Database;

	/** Fastify instance configured with Zod for runtime type checking */
	protected readonly app = Fastify({
		logger: { level: env.LOG_LEVEL },
	}).withTypeProvider<ZodTypeProvider>();

	/**
	 * Initializes server components and sets up required configurations.
	 * Calls abstract methods that must be implemented by derived classes.
	 *
	 * @param baseUri The base URI for the database connection
	 */
	constructor(baseUri = env.MONGO_BASE_URI) {
		this.database = new Database(baseUri);
	}

	/** Configures and registers server plugins */
	protected abstract setupPlugins(): Promise<void>;

	/** Defines API routes and their handlers */
	protected abstract setupRoutes(): void;

	protected async bootstrap() {
		try {
			await this.setupPlugins();
			this.setupRoutes();
		} catch (error) {
			this.app.log.error("Error during server bootstrap:", error);
			throw error; // Rethrow to be caught by the start method
		}
	}

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
			await this.bootstrap();

			await this.app.listen({ port });

			this.app.log.info(`🚀 Server running at http://localhost:${port}`);
			this.app.log.info(`📦 Database status: ${this.database.getState().status}`);
		} catch (error) {
			this.app.log.error("Failed to start server:", error);

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
