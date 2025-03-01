/* eslint-disable no-console */
import { AxiosError } from "axios";

import { Database } from "@/core/database/database";
import { DatabaseSeeder } from "@/core/database/seed";
import { env } from "@/core/utils";

/**
 * Formats an error message for display.
 * Provides cleaner error messages especially for Axios errors.
 *
 * @param error The error to format
 * @returns A formatted error message
 */
function formatErrorMessage(error: unknown): string {
	if (error instanceof AxiosError) {
		const status = error.response?.status;
		const data = error.response?.data;

		if (data && typeof data === "object" && "error_message" in data) {
			return `API Error (${status}): ${data.error_message}`;
		} else if (data && typeof data === "object" && "message" in data) {
			return `API Error (${status}): ${data.message}`;
		} else {
			return `API Error (${status}): ${error.message}`;
		}
	} else if (error instanceof Error) {
		return error.message;
	} else {
		return String(error);
	}
}

/**
 * Main function to seed the database with test data
 * Handles connection, seeding, and graceful shutdown
 */
async function main() {
	const seedOptions = {
		userCount: 10,
		regionsPerUser: { min: 1, max: 3 },
		citiesCount: 20,
		templatesCount: 15,
		useRealGeocoding: false, // Set to false to avoid geocoding API issues
	};

	const database = new Database(env.MONGO_BASE_URI);
	let exitCode = 0;

	try {
		console.log("🔌 Establishing database connection...");
		const connection = await database.initialize();

		if (!connection) {
			throw new Error("Failed to initialize database connection");
		}

		console.log("✅ Database connection established");

		const seeder = new DatabaseSeeder(connection);
		console.log("🌱 Starting database seeding process...");

		const result = await seeder.seed(seedOptions);

		console.log("\n✨ Database seeded successfully!");
		console.log("📊 Seeding summary:");
		console.log(`   - Users created: ${result.users}`);
		console.log(`   - Regions created: ${result.regions}`);
		console.log(`   - Locations generated: ${result.locations}`);
		console.log(`   - Templates generated: ${result.templates}`);
	} catch (error) {
		const errorMessage = formatErrorMessage(error);
		console.error("❌ Database connection/seeding failed:");
		console.error(`   ${errorMessage}`);

		exitCode = 1;
	} finally {
		try {
			console.log("Closing database connection...");
			await database.close();
			console.log("👋 Database connection closed");
		} catch (error) {
			console.error("Error closing database connection:", formatErrorMessage(error));
			exitCode = 1;
		}

		// Force exit to prevent hanging
		process.exit(exitCode);
	}
}

/**
 * Handles graceful shutdown of the application when receiving SIGINT or SIGTERM signals.
 * Logs a farewell message and exits with code 0.
 */
function shutdown() {
	console.log("\n👋 Shutting down gracefully...");
	process.exit(0);
}

// Register signal handlers
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Run the main function if this is the entry point
if (import.meta.main) {
	await main();
}
