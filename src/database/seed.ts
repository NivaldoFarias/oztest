import { faker } from "@faker-js/faker";

import type { ClientSession, Connection } from "mongoose";

import type { SeedOptions } from "@/schemas/";

import { RegionModel, UserModel } from "@/models";
import { defaultSeedOptions, seedOptionsSchema } from "@/schemas/";
import { GeoLibSingleton, REGION_TEMPLATES } from "@/utils/";

/** Represents a city */
declare interface City {
	name: string;
	coordinates: [number, number];
	address: string;
}

/** Represents the context for seeding the database */
declare interface SeedContext {
	cities: Array<City>;
	regionTemplates: string[];
	session: ClientSession;
}

/** Represents a user in a batch */
declare interface BatchUser {
	name: string;
	email: string;
	address: string;
	coordinates: [number, number];
	meta: {
		firstName: string;
		lastName: string;
	};
}

/**
 * Generates a list of US cities with their coordinates and addresses.
 * Uses either GeoLib for real geocoding or faker for mock data based on the useRealGeocoding option.
 *
 * @param count Number of cities to generate
 * @param useRealGeocoding Whether to use real geocoding service or generate mock data
 * @returns Array of city data objects containing name, coordinates, and address
 */
const generateCities = async (count: number, useRealGeocoding: boolean) => {
	const cities = new Set<string>();
	const result: Array<City> = [];

	const bounds = {
		lat: { min: 25, max: 49 },
		lng: { min: -123, max: -71 },
	};

	while (result.length < count) {
		const city = faker.location.city();
		if (cities.has(city)) continue;

		cities.add(city);
		const state = faker.location.state({ abbreviated: true });
		const address = `${city}, ${state}, USA`;

		if (useRealGeocoding) {
			try {
				const locationDetails = await GeoLibSingleton.getLocationFromAddress(address);
				const coordinates: [number, number] = [
					Number(locationDetails.geometry.location.lng),
					Number(locationDetails.geometry.location.lat),
				];

				result.push({
					name: city,
					coordinates,
					address: locationDetails.formatted_address,
				});

				continue;
			} catch (error) {
				console.warn(`Failed to geocode ${address}, falling back to mock data`);
			}
		}

		result.push({
			name: city,
			coordinates: [
				Number(faker.location.longitude(bounds.lng)),
				Number(faker.location.latitude(bounds.lat)),
			],
			address,
		});
	}

	return result;
};

/**
 * Generates a list of region templates for district naming.
 * Combines business, urban, and technology-related terms for realistic district names.
 *
 * @param count - Number of templates to generate
 * @returns Array of district name templates
 */
const generateRegionTemplates = (count: number) => {
	const templates = new Set<string>();

	while (templates.size < count) {
		const useSpecialty = Math.random() > 0.5;
		const specialty = faker.helpers.arrayElement(REGION_TEMPLATES.SPECIALTIES);
		const prefix = faker.helpers.arrayElement(REGION_TEMPLATES.PREFIXES);
		const suffix = faker.helpers.arrayElement(REGION_TEMPLATES.SUFFIXES);

		const template = useSpecialty ? `${specialty} ${suffix}` : `${prefix} ${suffix}`;

		templates.add(template);
	}

	return Array.from(templates);
};

/**
 * Database seeder class responsible for populating the database with test data.
 * Only meant to be used in development environments.
 */
export class DatabaseSeeder {
	/**
	 * Creates a new DatabaseSeeder instance with the specified MongoDB connection.
	 *
	 * @param connection - The MongoDB connection instance
	 */
	public constructor(private readonly connection: Connection) {}

	/**
	 * Generates a polygon around a center point for region creation.
	 * Creates a roughly square-shaped polygon with slight randomization.
	 *
	 * @param center - Center coordinates [longitude, latitude]
	 * @returns A polygon with coordinates
	 */
	private generatePolygonCoordinates(center: [number, number]) {
		const offset = 0.005 + Math.random() * 0.005;
		const points: [number, number][] = [
			[center[0] - offset, center[1] - offset],
			[center[0] + offset, center[1] - offset],
			[center[0] + offset, center[1] + offset],
			[center[0] - offset, center[1] + offset],
			[center[0] - offset, center[1] - offset],
		];
		return [points];
	}

	/**
	 * Creates a new DatabaseSeeder instance with retry logic for primary connection.
	 *
	 * @param connection - MongoDB connection instance
	 * @param maxRetries - Maximum number of retries to find primary
	 * @param retryDelay - Delay between retries in milliseconds
	 * @throws {Error} If unable to connect to primary after retries
	 */
	public static async create(connection: Connection, maxRetries = 5, retryDelay = 2_000) {
		let attempts = 0;

		while (attempts < maxRetries) {
			try {
				if (connection.readyState !== 1) {
					await new Promise<void>((resolve) => {
						connection.once("connected", () => {
							resolve();
						});
					});
				}

				const adminDb = connection.db.admin();
				const status = await adminDb.serverStatus();

				if (!status.writablePrimary) {
					throw new Error("Not connected to primary node");
				}

				await adminDb.ping();
				return new DatabaseSeeder(connection);
			} catch (error) {
				attempts++;
				if (attempts === maxRetries) {
					console.error("Failed to connect to primary:", error);
					throw new Error("Could not establish writable connection to MongoDB primary");
				}
				console.warn(`Attempt ${attempts}/${maxRetries} failed, retrying in ${retryDelay}ms...`);
				await new Promise((resolve) => setTimeout(resolve, retryDelay));
			}
		}

		throw new Error("Failed to create DatabaseSeeder");
	}

	/**
	 * Seeds users and their associated regions in batches.
	 *
	 * ## Workflow
	 * 1. Processes users in batches of 50
	 * 2. For each batch:
	 *    - Creates all users
	 *    - Creates regions for each user
	 *
	 * @param options Seeding configuration options
	 * @param context Context containing cities and region templates
	 * @throws {Error} If batch creation fails
	 */
	private async seedUsers(
		options: SeedOptions,
		{ cities, regionTemplates }: Omit<SeedContext, "session">,
	) {
		const BATCH_SIZE = 50;
		const totalBatches = Math.ceil(options.userCount / BATCH_SIZE);

		for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
			const batchStart = batchIndex * BATCH_SIZE;
			const batchEnd = Math.min((batchIndex + 1) * BATCH_SIZE, options.userCount);
			const batchUsers: Array<BatchUser> = [];

			console.log(`\nProcessing batch ${batchIndex + 1}/${totalBatches}`);

			for (let i = batchStart; i < batchEnd; i++) {
				const firstName = faker.person.firstName();
				const lastName = faker.person.lastName();
				const city = cities[i % cities.length];
				const fullAddress = `${faker.location.streetAddress()}, ${city.address}`;

				batchUsers.push({
					name: `${firstName} ${lastName}`,
					email: faker.internet.email({ firstName, lastName }),
					address: fullAddress,
					coordinates:
						options.useRealGeocoding ?
							await this.getGeocodedCoordinates(fullAddress, city.coordinates)
						:	city.coordinates,
					meta: { firstName, lastName },
				});
			}

			for (const userData of batchUsers) {
				const { meta, ...userDoc } = userData;
				console.log(`Creating user: ${meta.firstName} ${meta.lastName}`);

				const [user] = await UserModel.create([userDoc]);
				await this.createRegionsForUser(user, { options, regionTemplates });
			}
		}
	}

	/**
	 * Gets coordinates for an address using geocoding service with fallback.
	 */
	private async getGeocodedCoordinates(address: string, fallbackCoordinates: [number, number]) {
		try {
			const locationDetails = await GeoLibSingleton.getLocationFromAddress(address);
			return [
				Number(locationDetails.geometry.location.lng),
				Number(locationDetails.geometry.location.lat),
			] as [number, number];
		} catch (error) {
			console.warn(`Failed to geocode ${address}, using city coordinates`);
			return fallbackCoordinates;
		}
	}

	/**
	 * Creates regions for a specific user.
	 */
	private async createRegionsForUser(
		user: InstanceType<typeof UserModel>,
		{
			options,
			regionTemplates,
		}: {
			options: SeedOptions;
			regionTemplates: Array<string>;
		},
	) {
		const numRegions =
			options.regionsPerUser.min +
			Math.floor(Math.random() * (options.regionsPerUser.max - options.regionsPerUser.min + 1));

		const regions = Array.from({ length: numRegions }, () => ({
			name: `${faker.location.county()} ${
				regionTemplates[Math.floor(Math.random() * regionTemplates.length)]
			}`,
			user: user._id,
			geometry: {
				type: "Polygon" as const,
				coordinates: this.generatePolygonCoordinates(user.coordinates),
			},
		}));

		await RegionModel.create(regions);
	}

	/**
	 * Seeds the database with test data.
	 *
	 * ## Workflow
	 * 1. Validate options
	 * 2. Generate cities and region templates
	 * 3. Create users and their regions in batches
	 *
	 * @param options - Options for controlling the seeding process
	 * @throws {Error} If seeding fails
	 */
	public async seed(options?: Partial<SeedOptions>) {
		let validatedOptions = defaultSeedOptions;

		if (options) {
			const { success, data, error } = seedOptionsSchema.safeParse(options);
			if (success) validatedOptions = data;
			else console.error("Invalid seed options, using defaults.", error.message);
		}

		const cities = await generateCities(
			validatedOptions.citiesCount,
			validatedOptions.useRealGeocoding,
		);
		const regionTemplates = generateRegionTemplates(validatedOptions.templatesCount);

		try {
			console.log(
				`Starting database seeding (${validatedOptions.userCount} users,` +
					` ${validatedOptions.regionsPerUser.min}-${validatedOptions.regionsPerUser.max} regions per user)...`,
			);

			await this.seedUsers(validatedOptions, { cities, regionTemplates });

			console.log("Database seeding completed successfully!");
		} catch (error) {
			console.error("Error seeding database:", error);
			throw error;
		}
	}
}
