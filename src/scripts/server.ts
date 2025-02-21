import server from "@/api/server";

if (import.meta.main) {
	try {
		await server.start();

		process.on("SIGINT", () => void shutdown());
		process.on("SIGTERM", () => void shutdown());
	} catch (error) {
		console.error("Failed to start application:", error);
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
