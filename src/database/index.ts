/* eslint-disable no-console */
import mongoose from "mongoose";

import type { Connection, ConnectOptions } from "mongoose";

declare interface DatabaseState {
	connection: Connection | null;
	status: "disconnected" | "connecting" | "connected" | "error";
	retryCount: number;
	maxRetries: number;
	retryTimeout: ReturnType<typeof setTimeout> | null;
}

/**
 * Manages MongoDB database connections and lifecycle operations.
 *
 * Provides methods for initializing and closing database connections
 * using Mongoose as the ODM (Object Document Mapper).
 */
export class Database {
	private state: DatabaseState = {
		connection: null,
		status: "disconnected",
		retryCount: 0,
		maxRetries: 5,
		retryTimeout: null,
	};

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
	constructor(
		private readonly mongoURI: string,
		private readonly connectionOptions: ConnectOptions = {
			directConnection: true,
		},
		private readonly retryStrategy = {
			initialDelay: 1000,
			maxDelay: 30000,
			factor: 2,
		},
	) {}

	/**
	 * Initializes the database connection using the provided MongoDB URI.
	 * Establishes a connection to the database and sets up Mongoose configurations.
	 *
	 * ## Workflow
	 * 1. Connect to MongoDB
	 * 2. If connection is already established, return the connection
	 * 3. If connection is not established, attempt to connect
	 * 4. If connection fails, schedule a reconnection attempt
	 *
	 * @returns The database connection or null if connection is already established
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
	public async initialize(connectionOptions = this.connectionOptions) {
		switch (this.state.status) {
			case "connecting":
				return null;
			case "connected":
				return this.state.connection;
			case "error":
				this.scheduleReconnect();
				return null;
			case "disconnected":
			default:
				this.state.status = "connecting";
		}

		try {
			const { connection } = await mongoose.connect(this.mongoURI, connectionOptions);

			console.log("📦 Connected to MongoDB");

			this.state.connection = connection;
			this.state.status = "connected";
			this.state.retryCount = 0;

			connection.on("disconnected", () => {
				console.log("MongoDB disconnected, attempting to reconnect...");
				this.state.status = "disconnected";
				this.scheduleReconnect();
			});

			connection.on("error", (error) => {
				console.error("MongoDB connection error:", error);
				this.state.status = "error";
				this.scheduleReconnect();
			});

			return connection;
		} catch (error) {
			this.state.status = "error";
			this.scheduleReconnect();

			if (error instanceof Error) {
				console.error("Database initialization failed:", error.message);
			} else {
				console.error("Database initialization failed with unknown error");
			}

			return null;
		}
	}

	/**
	 * Schedules a reconnection attempt with exponential backoff
	 *
	 * Uses an exponential backoff algorithm to determine the time
	 * to wait before attempting to reconnect to the database.
	 */
	private scheduleReconnect() {
		if (this.state.retryTimeout) clearTimeout(this.state.retryTimeout);

		if (this.state.retryCount >= this.state.maxRetries) {
			console.log(
				`Maximum retries (${this.state.maxRetries}) reached. Will continue retry attempts in the background.`,
			);

			this.state.retryCount = 0;
		}

		const delay = Math.min(
			this.retryStrategy.initialDelay * Math.pow(this.retryStrategy.factor, this.state.retryCount),
			this.retryStrategy.maxDelay,
		);

		console.log(
			`Scheduling database reconnection in ${delay}ms (attempt ${this.state.retryCount + 1})`,
		);

		this.state.retryTimeout = setTimeout(() => {
			this.state.retryCount++;
			console.log(`Attempting to reconnect to database (attempt ${this.state.retryCount})`);
			this.initialize().catch(() => {});
		}, delay);
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
		if (this.state.retryTimeout) {
			clearTimeout(this.state.retryTimeout);
			this.state.retryTimeout = null;
		}

		if (!this.state.connection) {
			console.log("No active database connection to close");
			this.state.status = "disconnected";
			return;
		}

		await this.state.connection.close();
		this.state.connection = null;
		this.state.status = "disconnected";
		console.log("📦 Disconnected from MongoDB");
	}

	/**
	 * Returns the current database state.
	 *
	 * @returns The current database state
	 */
	public getState() {
		return this.state;
	}
}
