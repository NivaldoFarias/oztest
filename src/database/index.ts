import fs from "fs/promises";

import mongoose from "mongoose";

import { DatabaseSeeder } from "@/database/seed";
import { env } from "@/utils/env.util";

/**
 * Manages MongoDB database connections and lifecycle operations.
 *
 * Provides methods for initializing and closing database connections
 * using Mongoose as the ODM (Object Document Mapper).
 */
export class Database {
	/**
	 * Creates a new Database instance with the specified MongoDB connection URI.
	 *
	 * @param mongoURI The MongoDB connection string including protocol, credentials, host, and database name
	 *
	 * @example
	 * ```typescript
	 * const db = new Database('mongodb://localhost:27017/myapp');
	 * await db.init();
	 * ```
	 */
	constructor(
		private readonly mongoURI: string,
		private readonly shouldSeed = false,
	) {}

	/**
	 * Initializes the database connection using the provided MongoDB URI.
	 * Establishes a connection to the database and sets up Mongoose configurations.
	 *
	 * ## Workflow
	 * 1. Connect to MongoDB
	 * 2. If in development mode and shouldSeed is true, seed the database
	 *
	 * @throws {Error} If the connection attempt fails due to invalid URI, network issues, or authentication problems
	 *
	 * @example
	 * ```typescript
	 * try {
	 *   await db.init();
	 *   console.log('Connected to MongoDB');
	 * } catch (error) {
	 *   console.error('Failed to connect:', error);
	 * }
	 * ```
	 */
	public async initialize() {
		try {
			await mongoose.connect(this.mongoURI);

			if (this.shouldSeed) {
				const seeder = new DatabaseSeeder(mongoose.connection);

				if (env.SEED_CONFIG_PATH.length) {
					const seedOptions = await fs.readFile(env.SEED_CONFIG_PATH, "utf8");
					await seeder.seed(JSON.parse(seedOptions));
				} else {
					await seeder.seed();
				}
			}
		} catch (error) {
			console.error("❌ MongoDB connection error:", error);
			throw error;
		}
	}

	/**
	 * Gracefully closes the database connection.
	 * Ensures all pending operations are completed before disconnecting.
	 *
	 * @example
	 * ```typescript
	 * await db.close();
	 * // Database connection is now closed
	 * ```
	 */
	public async close() {
		await mongoose.connection.close();
		console.log("📦 Disconnected from MongoDB");
	}
}
