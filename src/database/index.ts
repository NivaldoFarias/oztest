import mongoose from "mongoose";

import type { Connection, ConnectOptions } from "mongoose";

/**
 * Manages MongoDB database connections and lifecycle operations.
 *
 * Provides methods for initializing and closing database connections
 * using Mongoose as the ODM (Object Document Mapper).
 */
export class Database {
	private readonly mongoURI: string;
	private connection: Connection | null = null;

	/**
	 * Creates a new Database instance with the specified MongoDB connection URI.
	 *
	 * @param baseUri The MongoDB connection string including protocol, credentials, host, and database name
	 *
	 * @example
	 * ```typescript
	 * const db = new Database('mongodb://localhost:27017/myapp');
	 * await db.init();
	 * ```
	 */
	constructor(baseUri: string) {
		this.mongoURI = this.buildConnectionUri(baseUri);
	}

	/**
	 * Constructs a MongoDB connection URI with proper options for primary node connection
	 *
	 * @param baseUri - Base MongoDB connection string
	 */
	private buildConnectionUri(baseUri: string) {
		const params = new URLSearchParams({
			directConnection: "true",
			retryWrites: "true",
			w: "majority",
			readPreference: "primary",
		});

		return `${baseUri}?${params}`;
	}

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
	 *   await db.initialize();
	 *   console.log('Connected to MongoDB');
	 * } catch (error) {
	 *   console.error('Failed to connect:', error);
	 * }
	 * ```
	 */
	public async initialize(connectionOptions: ConnectOptions = {}) {
		try {
			const { connection } = await mongoose.connect(this.mongoURI, connectionOptions);

			this.connection = connection;

			return connection;
		} catch (error) {
			if (error instanceof Error) {
				console.error("Database initialization failed:", error.message);
			} else {
				console.error("Database initialization failed with unknown error");
			}

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
		if (!this.connection) {
			throw new Error("Database connection not established");
		}

		await this.connection.close();
		console.log("📦 Disconnected from MongoDB");
	}

	/**
	 * Verifies connection is to primary node and database is writable
	 *
	 * @throws {Error} If not connected to primary or database is not writable
	 */
	private async verifyPrimaryConnection() {
		if (!this.connection) {
			throw new Error("Database connection not established");
		}

		const adminDb = this.connection.db.admin();

		const { ismaster, primary, hosts } = await adminDb.command({ isMaster: 1 });

		if (!ismaster) {
			throw new Error(
				`Not connected to primary node. Current primary: ${primary}. Available hosts: ${hosts.join(", ")}`,
			);
		}

		// Test write capability
		try {
			await this.connection.db.command({ ping: 1, writeConcern: { w: "majority" } });
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Database is not writable: ${error.message}`);
			} else {
				throw new Error("Database is not writable with unknown error");
			}
		}
	}
}
