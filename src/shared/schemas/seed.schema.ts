import { z } from "@/core/config/zod.config";

/**
 * Schema for seeding options validation
 * Defines the structure and constraints for database seeding parameters
 */
export const seedOptionsSchema = z
	.object({
		userCount: z
			.number()
			.int()
			.min(1)
			.max(10_000)
			.default(10)
			.describe("Number of users to create"),

		regionsPerUser: z
			.object({
				min: z.number().int().min(1).default(2).describe("Minimum regions per user"),
				max: z.number().int().min(1).default(4).describe("Maximum regions per user"),
			})
			.refine(({ min, max }) => min <= max, {
				message: "Minimum regions must be less than or equal to maximum regions",
			})
			.describe("Range of regions to create per user"),

		citiesCount: z
			.number()
			.int()
			.min(10)
			.max(1_000)
			.default(50)
			.describe("Number of cities to generate"),

		templatesCount: z
			.number()
			.int()
			.min(10)
			.max(100)
			.default(20)
			.describe("Number of region name templates to generate"),

		useRealGeocoding: z
			.boolean()
			.default(false)
			.describe("Whether to use real geocoding service or generate mock data"),
	})
	.describe("Options for controlling the database seeding process");

/**
 * Default seeding options
 * Used when no options are provided or when validation fails
 */
export const defaultSeedOptions = {
	userCount: 10,
	regionsPerUser: {
		min: 2,
		max: 4,
	},
	citiesCount: 50,
	templatesCount: 20,
	useRealGeocoding: false,
};

/**
 * Type definition for seeding options
 * Inferred from the Zod schema for type safety
 */
export type SeedOptions = z.infer<typeof seedOptionsSchema>;
