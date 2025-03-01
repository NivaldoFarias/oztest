import type { FilterQuery, Model } from "mongoose";

/**
 * Pagination options interface with enhanced filtering and sorting capabilities.
 * Provides standardized parameters for paginated queries across the application.
 */
export interface PaginationOptions<T> {
	/** Current page number (1-indexed) */
	page: number;
	/** Number of items per page */
	limit: number;
	/** Optional filter criteria for the query */
	filter?: FilterQuery<T>;
	/** Optional field to sort by */
	sortBy?: keyof T | string;
	/** Sort direction (asc or desc) */
	sortDirection?: "asc" | "desc";
	/** Optional fields to select (inclusion) */
	select?: string | Array<string>;
	/** Optional fields to populate */
	populate?: string | Array<string>;
}

/**
 * Pagination metadata interface containing information about the pagination state.
 * Provides context about current page, total items, and navigation possibilities.
 */
export interface PaginationMeta {
	/** Current page number */
	currentPage: number;
	/** Number of items per page */
	itemsPerPage: number;
	/** Total number of items across all pages */
	totalItems: number;
	/** Total number of pages */
	totalPages: number;
	/** Whether there is a next page available */
	hasNextPage: boolean;
	/** Whether there is a previous page available */
	hasPreviousPage: boolean;
}

/**
 * Paginated response interface with data and metadata.
 * Standardizes the structure of paginated responses across the application.
 */
export interface PaginatedResponse<T> {
	/** Array of data items for the current page */
	data: Array<T>;
	/** Pagination metadata */
	meta: PaginationMeta;
}

/**
 * Utility class for handling pagination across the application.
 * Provides methods for paginating MongoDB queries with consistent formatting.
 */
export class PaginationUtil {
	/**
	 * Executes a paginated query against a MongoDB model.
	 * Handles filtering, sorting, field selection, and population.
	 *
	 * @param model The Mongoose model to query
	 * @param options Pagination options including filters and sorting
	 *
	 * @returns A standardized paginated response with data and metadata
	 *
	 * @example
	 * ```typescript
	 * const result = await PaginationUtil.paginate(UserModel, {
	 *   page: 1,
	 *   limit: 10,
	 *   filter: { active: true },
	 *   sortBy: 'createdAt',
	 *   sortDirection: 'desc'
	 * });
	 *
	 * console.log(result.data); // => Array of user documents
	 * console.log(result.meta); // => Pagination metadata
	 * ```
	 */
	public static async paginate<T, D = T>(
		model: Model<T>,
		options: PaginationOptions<T>,
	): Promise<PaginatedResponse<D>> {
		const {
			page = 1,
			limit = 10,
			filter = {},
			sortBy,
			sortDirection = "asc",
			select,
			populate,
		} = options;

		// Calculate skip value for pagination
		const skip = (page - 1) * limit;

		// Build the query
		let query = model.find(filter);

		// Apply sorting if specified
		if (sortBy) {
			const sortOptions: Record<string, 1 | -1> = {
				[sortBy as string]: sortDirection === "asc" ? 1 : -1,
			};
			query = query.sort(sortOptions);
		}

		// Apply field selection if specified
		if (select) {
			query = query.select(select);
		}

		// Apply population if specified
		if (populate) {
			if (Array.isArray(populate)) {
				for (const path of populate) {
					query = query.populate(path);
				}
			} else {
				query = query.populate(populate);
			}
		}

		// Execute the query with pagination
		const [docs, totalItems] = await Promise.all([
			query.skip(skip).limit(limit).lean().exec(),
			model.countDocuments(filter).exec(),
		]);

		// Calculate pagination metadata
		const totalPages = Math.ceil(totalItems / limit);

		const meta: PaginationMeta = {
			currentPage: page,
			itemsPerPage: limit,
			totalItems,
			totalPages,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
		};

		// Type assertion is necessary due to mongoose's complex types
		const data = docs as unknown as Array<D>;

		return { data, meta };
	}

	/**
	 * Formats a paginated response to match the legacy format used in existing endpoints.
	 * Useful for maintaining backward compatibility during transition to the new format.
	 *
	 * @param paginatedResponse The standardized paginated response
	 *
	 * @returns A response formatted in the legacy style (rows, page, limit, total)
	 *
	 * @example
	 * ```typescript
	 * const result = await PaginationUtil.paginate(UserModel, options);
	 * const legacyFormat = PaginationUtil.toLegacyFormat(result);
	 *
	 * console.log(legacyFormat); // => { rows: [...], page: 1, limit: 10, total: 100 }
	 * ```
	 */
	public static toLegacyFormat<T>(paginatedResponse: PaginatedResponse<T>): {
		rows: Array<T>;
		page: number;
		limit: number;
		total: number;
	} {
		return {
			rows: paginatedResponse.data,
			page: paginatedResponse.meta.currentPage,
			limit: paginatedResponse.meta.itemsPerPage,
			total: paginatedResponse.meta.totalItems,
		};
	}
}
