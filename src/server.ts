import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import { z } from "zod";

import type { FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import type { GetUsersQuery, UpdateUserBody, UserParams } from "@/schemas";

import { Database } from "@/database/";
import { UserModel } from "@/models/";
import { GetUsersQuerySchema, UpdateUserBodySchema, UserParamsSchema } from "@/schemas/";
import { env, STATUS } from "@/utils/";

/**
 * Main server class that handles HTTP requests using Fastify.
 * Manages server configuration, database connection, routes, and request handling.
 *
 * @example
 * ```typescript
 * const server = new Server();
 * await server.start(3000);
 * ```
 */
class Server {
	/** Database instance for MongoDB connection management */
	private readonly database = new Database(env.MONGO_URI);

	/** Fastify instance configured with Zod for runtime type checking */
	private readonly app = Fastify({
		logger: { level: env.LOG_LEVEL },
	}).withTypeProvider<ZodTypeProvider>();

	/**
	 * Initializes the server by setting up plugins and routes.
	 * Automatically called when creating a new Server instance.
	 */
	constructor() {
		void this.setupPlugins();
		this.setupRoutes();
	}

	/**
	 * Configures and registers Fastify plugins for CORS and HTTP utilities.
	 * Sets up cross-origin resource sharing and adds helpful HTTP utility methods.
	 */
	private async setupPlugins() {
		await this.app.register(cors, {
			origin: env.CORS_ORIGIN,
			methods: env.CORS_METHODS.split(","),
			credentials: env.CORS_CREDENTIALS,
		});

		await this.app.register(sensible);
	}

	/**
	 * Defines all API routes and their handlers.
	 * Sets up endpoints for user management with request/response validation schemas.
	 *
	 * ## Routes
	 * - **GET** `/users` - Get paginated list of users
	 * - **GET** `/users/:id` - Get user by ID
	 * - **PUT** `/users/:id` - Update user by ID
	 */
	private setupRoutes() {
		this.app.get<{ Querystring: GetUsersQuery }>(
			"/users",
			{
				schema: {
					querystring: GetUsersQuerySchema,
					response: {
						200: z.object({
							rows: z.array(
								z.object({
									_id: z.string(),
									name: z.string(),
									email: z.string(),
									address: z.string(),
									coordinates: z.tuple([z.number(), z.number()]),
									regions: z.array(z.string()),
								}),
							),
							page: z.number().optional(),
							limit: z.number().optional(),
							total: z.number(),
						}),
					},
				},
			},
			this.getUsers,
		);

		this.app.get<{ Params: UserParams }>(
			"/users/:id",
			{
				schema: {
					params: UserParamsSchema,
					response: {
						200: z.object({
							_id: z.string(),
							name: z.string(),
							email: z.string(),
							address: z.string(),
							coordinates: z.tuple([z.number(), z.number()]),
							regions: z.array(z.string()),
						}),
					},
				},
			},
			this.getUserById,
		);

		this.app.put<{ Params: UserParams; Body: UpdateUserBody }>(
			"/users/:id",
			{
				schema: {
					params: UserParamsSchema,
					body: UpdateUserBodySchema,
					response: {
						200: z.object({
							status: z.number(),
						}),
					},
				},
			},
			this.updateUser,
		);
	}

	/**
	 * Starts the server and initializes the database connection.
	 *
	 * @param port The port number to listen on, defaults to the value from environment variables
	 * @throws {Error} If the server fails to start or database connection fails
	 *
	 * @example
	 * ```typescript
	 * try {
	 *   await server.start(3000);
	 *   console.log('Server started successfully');
	 * } catch (error) {
	 *   console.error('Failed to start server:', error);
	 * }
	 * ```
	 */
	public async start(port = env.PORT) {
		try {
			await this.database.initialize();
			await this.app.listen({
				port,
				host: "0.0.0.0", // Listen on all network interfaces
			});
			this.app.log.info(`🚀 Server running at http://localhost:${port}`);
		} catch (error) {
			this.app.log.error("Failed to start server:", error);
			console.error("Failed to start server:", error);
			process.exit(1);
		}
	}

	/**
	 * Stops the server and closes the database connection.
	 *
	 * @example
	 * ```typescript
	 * await server.stop();
	 * ```
	 */
	public async stop() {
		await this.app.close();
		await this.database.close();
	}

	/**
	 * Handles GET requests for retrieving a paginated list of users.
	 * Supports optional pagination parameters through query string.
	 *
	 * @param request Fastify request object containing pagination parameters
	 * @returns Object containing user data, pagination info, and total count
	 *
	 * @example
	 * ```typescript
	 * const response = await getUsers(request);
	 * console.log(response); // => { rows: User[], page: 1, limit: 10, total: number }
	 * ```
	 */
	private getUsers = async (request: FastifyRequest<{ Querystring: GetUsersQuery }>) => {
		const { page, limit } = request.query;
		const [users, total] = await Promise.all([UserModel.find().lean(), UserModel.count()]);

		return {
			rows: users.map((user) => ({
				...user,
				regions: user.regions.map((region) => (typeof region === "string" ? region : region._id)),
			})),
			page,
			limit,
			total,
		};
	};

	/**
	 * Handles GET requests for retrieving a single user by their ID.
	 *
	 * @param request Fastify request object containing the user ID parameter
	 * @returns The requested user object with formatted regions
	 * @throws {NotFoundError} If the user with the specified ID doesn't exist
	 *
	 * @example
	 * ```typescript
	 * const user = await getUserById(request);
	 * console.log(user); // => User object or throws NotFoundError
	 * ```
	 */
	private getUserById = async (request: FastifyRequest<{ Params: UserParams }>) => {
		const { id } = request.params;
		const user = await UserModel.findOne({ _id: id }).lean();

		if (!user) throw this.app.httpErrors.notFound("User not found");

		return {
			...user,
			regions: user.regions.map((region) => (typeof region === "string" ? region : region._id)),
		};
	};

	/**
	 * Handles PUT requests for updating user information.
	 * Supports partial updates of user properties.
	 *
	 * @param request Fastify request object containing user ID and update data
	 * @returns Object indicating the update status
	 * @throws {NotFoundError} If the user with the specified ID doesn't exist
	 *
	 * @example
	 * ```typescript
	 * const result = await updateUser(request);
	 * console.log(result); // => { status: 201 }
	 * ```
	 */
	private updateUser = async (
		request: FastifyRequest<{ Params: UserParams; Body: UpdateUserBody }>,
	) => {
		const { id } = request.params;
		const { update } = request.body;
		const user = await UserModel.findOne({ _id: id });

		if (!user) {
			throw this.app.httpErrors.notFound("User not found");
		}

		Object.assign(user, update);
		await user.save();

		return { status: STATUS.UPDATED };
	};
}

/**
 * Singleton instance of the Server class.
 * Use this to start and manage the application server.
 *
 * @example
 * ```typescript
 * import server from './server';
 *
 * await server.start();
 * ```
 */
export default new Server();
