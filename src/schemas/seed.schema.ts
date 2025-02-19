import { z } from "zod";

/** Schema for seeding options validation */
export const seedOptionsSchema = z.object({
	userCount: z.number().min(1).max(10_000).default(10),
	regionsPerUser: z
		.object({
			min: z.number().min(1).default(2),
			max: z.number().min(1).default(4),
		})
		.refine(({ min, max }) => min <= max, {
			message: "Minimum regions must be less than or equal to maximum regions",
		}),
	citiesCount: z.number().min(10).max(1_000).default(50),
	templatesCount: z.number().min(10).max(100).default(20),
	useRealGeocoding: z.boolean().default(false),
});

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

export type SeedOptions = z.infer<typeof seedOptionsSchema>;
