import { Database } from "@/database/";
import { env } from "@/utils/";

if (import.meta.main) {
	try {
		const database = new Database(env.MONGO_URI, true);

		await database.initialize();
		console.log("✨ Database seeded successfully!");

		process.on("SIGINT", () => void shutdown());
		process.on("SIGTERM", () => void shutdown());

		/**
		 * Handles graceful shutdown of the application when receiving SIGINT or SIGTERM signals.
		 * Logs a farewell message and exits with code 0.
		 */
		async function shutdown() {
			console.log("\n👋 Shutting down gracefully...");
			await database.close();
			process.exit(0);
		}
	} catch (error) {
		console.error("Failed to seed database:", error);
		process.exit(1);
	}
}
