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
	private readonly mongoURI: string;
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
		baseUri: string,
		private readonly connectionOptions: ConnectOptions = {
			directConnection: true,
			retryWrites: true,
			w: "majority",
			readPreference: "primary",
		},
		private readonly retryStrategy = {
			initialDelay: 1000,
			maxDelay: 30000,
			factor: 2,
		},
	) {
		this.mongoURI = this.buildConnectionUri(baseUri);
	}

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
	public async initialize(connectionOptions: ConnectOptions = {}) {
		if (this.state.status === "connecting") return null;
		else if (this.state.status === "connected" && this.state.connection) {
			return this.state.connection;
		} else this.state.status = "connecting";

		try {
			const { connection } = await mongoose.connect(this.mongoURI, connectionOptions);

			this.state.connection = connection;
			this.state.status = "connected";
			this.state.retryCount = 0;
			console.log("📦 Connected to MongoDB");

			connection.on("disconnected", () => {
				console.log("MongoDB disconnected, attempting to reconnect...");
				this.state.status = "disconnected";
				this.scheduleReconnect();
			});

			connection.on("error", (err) => {
				console.error("MongoDB connection error:", err);
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
			// Reset retry count but continue trying
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
			this.initialize().catch(() => {}); // Catch to prevent unhandled promise rejection
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
	 * Verifies connection is to primary node and database is writable
	 *
	 * @throws {Error} If not connected to primary or database is not writable
	 */
	private async verifyPrimaryConnection() {
		if (!this.state.connection) throw new Error("Database connection not established");

		const adminDb = this.state.connection.db.admin();

		const { ismaster, primary, hosts } = await adminDb.command({ isMaster: 1 });

		if (!ismaster) {
			throw new Error(
				`Not connected to primary node. Current primary: ${primary}. Available hosts: ${hosts.join(", ")}`,
			);
		}

		try {
			await this.state.connection.db.command({ ping: 1, writeConcern: { w: "majority" } });
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Database is not writable: ${error.message}`);
			} else {
				throw new Error("Database is not writable with unknown error");
			}
		}
	}

	/**
	 * Constructs a MongoDB connection URI with proper options for primary node connection.
	 *
	 * Converts `ConnectOptions` to `Record<string,string>` for `URLSearchParams` compatibility.
	 *
	 * @param baseUri - Base MongoDB connection string
	 */
	private buildConnectionUri(baseUri: string) {
		const stringParams = Object.entries(this.connectionOptions).reduce<Record<string, string>>(
			(acc, [key, value]) => {
				acc[key] = String(value);
				return acc;
			},
			{},
		);

		const params = new URLSearchParams(stringParams);
		const uri = `${baseUri}?${params}`;

		return uri;
	}
}
