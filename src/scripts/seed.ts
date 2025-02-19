import { Database } from "@/database/";
import { env } from "@/utils/";

if (import.meta.main) {
	const database = new Database(env.MONGO_URI, {
		userCount: 10,
		regionsPerUser: { min: 1, max: 3 },
		citiesCount: 100,
		templatesCount: 30,
		useRealGeocoding: false,
	});

	try {
		await database.initialize();
		console.log("✨ Database seeded successfully!");

		process.on("SIGINT", () => void shutdown());
		process.on("SIGTERM", () => void shutdown());
	} catch (error) {
		process.exit(1);
	}

	/**
	 * Handles graceful shutdown of the application when receiving SIGINT or SIGTERM signals.
	 * Logs a farewell message and exits with code 0.
	 */
	async function shutdown() {
		console.log("\n👋 Shutting down gracefully...");
		await database.close();
		process.exit(0);
	}
}
