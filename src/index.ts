/**
 * Application entry point that initializes the server and handles graceful shutdown.
 *
 * Imports the database configuration and server module, then starts the server if
 * this is the main module being executed.
 */
import "./database";

import server from "./server";

if (import.meta.main) {
	try {
		await server.start();

		process.on("SIGINT", () => void shutdown());
		process.on("SIGTERM", () => void shutdown());
	} catch (err) {
		console.error("Failed to start application:", err);
		process.exit(1);
	}

	/**
	 * Handles graceful shutdown of the application when receiving SIGINT or SIGTERM signals.
	 * Logs a farewell message and exits with code 0.
	 */
	async function shutdown() {
		console.log("\n👋 Shutting down gracefully...");
		await server.stop();
		process.exit(0);
	}
}
