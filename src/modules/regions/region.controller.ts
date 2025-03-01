import { MongoServerError } from "mongodb";

import type { FastifyInstance, FastifyRequest } from "fastify";

import type {
	CreateRegionBody,
	RegionParams,
	UpdateRegionBody,
} from "@/modules/regions/region.schema";
import type { GetUsersQuery } from "@/modules/users/user.schema";

import { AppError, BadRequestError, NotFoundError, PaginationUtil, STATUS } from "@/core/utils";
import { RegionModel } from "@/modules/regions/region.model";
import { UserModel } from "@/modules/users/user.model";

/**
 * Retrieves a paginated list of regions with enhanced filtering and sorting options.
 * Supports pagination, sorting, and filtering through query parameters.
 *
 * @param request The Fastify request containing pagination and filtering query parameters
 */
export async function getRegions(request: FastifyRequest<{ Querystring: GetUsersQuery }>) {
	const { page, limit, sortBy, sortDirection } = request.query;

	// Use the pagination utility to handle pagination, filtering, and sorting
	const result = await PaginationUtil.paginate(RegionModel, {
		page,
		limit,
		sortBy: sortBy as string,
		sortDirection,
	});

	// Return in the legacy format for backward compatibility
	return PaginationUtil.toLegacyFormat(result);
}

/**
 * Retrieves regions belonging to the specified user.
 * Supports pagination, sorting, and filtering through query parameters.
 *
 * @param request The Fastify request containing the user ID parameter and query parameters
 * @param app The Fastify instance for error handling
 * @throws {NotFoundError} If user with specified ID doesn't exist
 */
export async function getUserRegions(
	request: FastifyRequest<{ Params: { userId: string }; Querystring: GetUsersQuery }>,
	app: FastifyInstance,
) {
	const { userId } = request.params;
	const { page, limit, sortBy, sortDirection } = request.query;

	const user = await UserModel.findOne({ _id: userId }).lean();
	if (!user) throw new NotFoundError("User not found");

	// Use the pagination utility to handle pagination, filtering, and sorting
	const result = await PaginationUtil.paginate(RegionModel, {
		page,
		limit,
		filter: { user: userId },
		sortBy: sortBy as string,
		sortDirection,
	});

	// Return in the legacy format for backward compatibility
	return PaginationUtil.toLegacyFormat(result);
}

/**
 * Creates a new region for a user.
 *
 * @param request The Fastify request containing the region creation data
 * @param app The Fastify instance for error handling
 * @throws {BadRequestError} If required data is missing or invalid
 * @throws {NotFoundError} If user doesn't exist
 */
export async function createRegion(
	request: FastifyRequest<{ Body: CreateRegionBody; Params: { userId: string } }>,
	app: FastifyInstance,
) {
	try {
		const { userId } = request.params;
		const regionData = request.body;

		const user = await UserModel.findOne({ _id: userId });
		if (!user) throw new NotFoundError("User not found");

		const region = new RegionModel({
			...regionData,
			user: userId,
		});

		await region.save();

		return {
			_id: region._id,
			name: region.name,
			user: region.user,
			geometry: region.geometry,
			createdAt: region.createdAt,
			updatedAt: region.updatedAt,
		};
	} catch (error) {
		app.log.error("Error creating region:", error);

		if (error instanceof MongoServerError && error.code === 11000) {
			throw new BadRequestError("Region with this name already exists for this user");
		}

		if (error instanceof AppError) throw error;
		throw new BadRequestError(
			`Failed to create region: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

/**
 * Retrieves a region by its ID.
 *
 * @param request The Fastify request containing the region ID parameter
 * @param app The Fastify instance for error handling
 * @throws {NotFoundError} If region with specified ID doesn't exist
 */
export async function getRegionById(
	request: FastifyRequest<{ Params: RegionParams }>,
	app: FastifyInstance,
) {
	const { id } = request.params;
	const region = await RegionModel.findOne({ _id: id }).lean();

	if (!region) throw new NotFoundError("Region not found");

	return region;
}

/**
 * Updates a region based on provided data.
 *
 * @param request The Fastify request containing region ID and update data
 * @param app The Fastify instance for error handling
 * @throws {NotFoundError} If region with specified ID doesn't exist
 */
export async function updateRegion(
	request: FastifyRequest<{ Params: RegionParams; Body: UpdateRegionBody }>,
	app: FastifyInstance,
) {
	const { id } = request.params;
	const { update } = request.body;
	const region = await RegionModel.findOne({ _id: id });

	if (!region) {
		throw new NotFoundError("Region not found");
	}

	// Handle update fields
	Object.assign(region, update);
	await region.save();

	return { status: STATUS.UPDATED };
}

/**
 * Deletes a region by its ID.
 *
 * @param request The Fastify request containing the region ID parameter
 * @param app The Fastify instance for error handling
 * @throws {NotFoundError} If region with specified ID doesn't exist
 */
export async function deleteRegion(
	request: FastifyRequest<{ Params: RegionParams }>,
	app: FastifyInstance,
) {
	const { id } = request.params;
	const region = await RegionModel.findOne({ _id: id });

	if (!region) {
		throw new NotFoundError("Region not found");
	}

	// First remove the region from the user's regions array
	const user = await UserModel.findOne({ _id: region.user });
	if (user) {
		user.regions = user.regions.filter((r) => r.toString() !== id);
		await user.save();
	}

	await RegionModel.deleteOne({ _id: id });

	return {
		status: STATUS.OK,
		message: "Region deleted successfully",
	};
}
