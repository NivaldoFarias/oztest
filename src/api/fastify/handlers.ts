import type { FastifyInstance, FastifyRequest } from "fastify";

import type { GetUsersQuery, UpdateUserBody, UserParams } from "@/schemas";

import { UserModel } from "@/models";
import { STATUS } from "@/utils";

/**
 * Retrieves a paginated list of users with optional pagination parameters.
 *
 * @param request The Fastify request containing pagination query parameters
 *
 * @example
 * ```typescript
 * const users = await getUsers(request);
 * // => { rows: Array<User>, page: number, limit: number, total: number }
 * ```
 */
export async function getUsers(request: FastifyRequest<{ Querystring: GetUsersQuery }>) {
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
 * // => User object or throws NotFoundError
 * ```
 */
export async function getUserById(
	request: FastifyRequest<{ Params: UserParams }>,
	app: FastifyInstance,
) {
	const { id } = request.params;
	const user = await UserModel.findOne({ _id: id }).lean();

	if (!user) throw app.httpErrors.notFound("User not found");

	return {
		...user,
		regions: user.regions.map((region) => (typeof region === "string" ? region : region._id)),
	};
}

/**
 * Updates user information based on provided data.
 *
 * @param request The Fastify request containing user ID and update data
 * @param app The Fastify instance for error handling
 * @throws {NotFoundError} If user with specified ID doesn't exist
 *
 * @example
 * ```typescript
 * const result = await updateUser(request, app);
 * // => { status: 201 }
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
		throw app.httpErrors.notFound("User not found");
	}

	Object.assign(user, update);
	await user.save();

	return { status: STATUS.UPDATED };
}
