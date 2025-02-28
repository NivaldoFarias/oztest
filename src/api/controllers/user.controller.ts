import { MongoServerError } from "mongodb";

import type { FastifyInstance, FastifyRequest } from "fastify";

import type { CreateUserBody, GetUsersQuery, UpdateUserBody, UserParams } from "@/schemas";

import { UserModel } from "@/models";
import {
	AppError,
	BadRequestError,
	ConflictError,
	ERROR_CODES,
	GeoCoding,
	NotFoundError,
	STATUS,
} from "@/utils/";
import { ApiKeyUtil } from "@/utils/api-key.util";

/**
 * Retrieves a paginated list of users with optional pagination parameters.
 *
 * @param request The Fastify request containing pagination query parameters
 *
 * @example
 * ```typescript
 * const users = await getUsers(request);
 * console.log(users); // => { rows: Array<User>, page: number, limit: number, total: number }
 * ```
 */
export async function getUsers(request: FastifyRequest<{ Querystring: GetUsersQuery }>) {
	const { page, limit } = request.query;
	const [users, total] = await Promise.all([UserModel.find().lean(), UserModel.count()]);

	if (users.length === 0) {
		return { rows: [], page, limit, total: 0 };
	}

	return {
		rows: users.map((user) => ({
			...user,
			regions: user.regions.map((region) => (typeof region === "string" ? region : region._id)),
		})),
		page,
		limit,
		total,
	};
}

/**
 * Creates a new user with the provided information.
 * Handles geocoding between address and coordinates automatically.
 * Generates a secure API key for the user.
 *
 * @param request The Fastify request containing the user creation data
 * @param app The Fastify instance for error handling
 * @throws {BadRequestError} If required data is missing or invalid
 *
 * @example
 * ```typescript
 * const result = await createUser(request, app);
 * console.log(result); // => { user: User object, apiKey: "generated-api-key" }
 * ```
 */
export async function createUser(
	request: FastifyRequest<{ Body: CreateUserBody }>,
	app: FastifyInstance,
) {
	try {
		const userData = request.body;

		const apiKey = ApiKeyUtil.generate();
		const apiKeyHash = ApiKeyUtil.hash(apiKey);

		const user = new UserModel({
			...userData,
			regions: [],
			apiKeyHash,
		});

		await user.save();

		return {
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				address: user.address,
				coordinates: user.coordinates,
				regions: user.regions,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
			apiKey,
		};
	} catch (error) {
		console.error("ERROR", error);

		if (error instanceof MongoServerError) {
			if (error.code === 11000) {
				throw new ConflictError("User with this email already exists");
			} else if (error.codeName === "NotWritablePrimary" || error.code === 10107) {
				throw new AppError(
					"Database is currently in read-only mode. Please try again later.",
					503,
					ERROR_CODES.SERVICE_UNAVAILABLE,
				);
			}

			throw error;
		}

		if (error instanceof AppError) throw error;
		else throw new BadRequestError("Failed to create user");
	}
}

/**
 * Retrieves a single user by their ID.
 *
 * @param request The Fastify request containing the user ID parameter
 * @param app The Fastify instance for error handling
 * @throws {NotFoundError} If user with specified ID doesn't exist
 *
 * @example
 * ```typescript
 * const user = await getUserById(request, app);
 * console.log(user); // => User object or throws NotFoundError
 * ```
 */
export async function getUserById(
	request: FastifyRequest<{ Params: UserParams }>,
	app: FastifyInstance,
) {
	const { id } = request.params;
	const user = await UserModel.findOne({ _id: id }).lean();

	if (!user) throw new NotFoundError("User not found");

	return {
		...user,
		regions: user.regions.map((region) => (typeof region === "string" ? region : region._id)),
	};
}

/**
 * Updates user information based on provided data.
 * Handles geocoding between address and coordinates automatically.
 *
 * @param request The Fastify request containing user ID and update data
 * @param app The Fastify instance for error handling
 * @throws {NotFoundError} If user with specified ID doesn't exist
 *
 * @example
 * ```typescript
 * const result = await updateUser(request, app);
 * console.log(result); // => { status: 201 }
 * ```
 */
export async function updateUser(
	request: FastifyRequest<{ Params: UserParams; Body: UpdateUserBody }>,
	app: FastifyInstance,
) {
	const { id } = request.params;
	const { update } = request.body;
	const user = await UserModel.findOne({ _id: id });

	if (!user) {
		throw new NotFoundError("User not found");
	}

	// Handle address/coordinate conversion
	if (update.address && !update.coordinates) {
		try {
			const locationData = await GeoCoding.getLocationFromAddress(update.address);
			update.coordinates = [locationData.geometry.location.lng, locationData.geometry.location.lat];
		} catch (error) {
			throw new BadRequestError(
				`Invalid address: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	} else if (update.coordinates && !update.address) {
		try {
			const locationData = await GeoCoding.getLocationFromCoordinates({
				lat: update.coordinates[1],
				lng: update.coordinates[0],
			});
			update.address = locationData.formatted_address;
		} catch (error) {
			throw new BadRequestError(
				`Invalid coordinates: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	Object.assign(user, update);
	await user.save();

	return { status: STATUS.UPDATED };
}

/**
 * Deletes a user by their ID.
 *
 * @param request The Fastify request containing the user ID parameter
 * @param app The Fastify instance for error handling
 * @throws {NotFoundError} If user with specified ID doesn't exist
 *
 * @example
 * ```typescript
 * const result = await deleteUser(request, app);
 * console.log(result); // => { status: 200, message: "User deleted successfully" }
 * ```
 */
export async function deleteUser(
	request: FastifyRequest<{ Params: UserParams }>,
	app: FastifyInstance,
) {
	const { id } = request.params;
	const result = await UserModel.deleteOne({ _id: id });

	if (result.deletedCount === 0) {
		throw new NotFoundError("User not found");
	}

	return {
		status: STATUS.OK,
		message: "User deleted successfully",
	};
}
