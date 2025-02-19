import mongoose from "mongoose";

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
	constructor(private readonly mongoURI: string) {}

	/**
	 * Initializes the database connection using the provided MongoDB URI.
	 * Establishes a connection to the database and sets up Mongoose configurations.
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
