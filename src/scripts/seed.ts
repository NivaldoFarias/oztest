import { Database } from "@/database/";
import { DatabaseSeeder } from "@/database/seed";
import { env } from "@/utils/";

if (import.meta.main) {
	const seedOptions = {
		userCount: 10,
		regionsPerUser: { min: 1, max: 3 },
		citiesCount: 100,
		templatesCount: 30,
		useRealGeocoding: false,
	};

	const database = new Database(env.MONGO_BASE_URI);
	let seeder: DatabaseSeeder;

	try {
		console.log("Establishing connection to primary node...");
		const connection = await database.initialize();

		console.log("Verifying primary node status...");
		seeder = await DatabaseSeeder.create(connection);

		console.log("✅ Connected to primary node, starting seed...");
		await seeder.seed(seedOptions);

		console.log("✨ Database seeded successfully!");

		process.on("SIGINT", () => void shutdown());
		process.on("SIGTERM", () => void shutdown());
	} catch (error) {
		if (error instanceof Error) {
			console.error("❌ Database connection/seeding failed:", error.message);
		} else {
			console.error("❌ Database connection/seeding failed with unknown error");
		}

		await database.close();
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
