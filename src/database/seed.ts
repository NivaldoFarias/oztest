import { faker } from "@faker-js/faker";

import type { ClientSession, Connection } from "mongoose";

import type { SeedOptions } from "@/schemas/";

import { RegionModel, UserModel } from "@/models";
import { defaultSeedOptions, seedOptionsSchema } from "@/schemas/";
import { GeoLibSingleton } from "@/utils/";

declare interface City {
	name: string;
	coordinates: [number, number];
	address: string;
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

	// US mainland approximate bounds
	const bounds = {
		lat: { min: 25, max: 49 }, // Florida to Washington state
		lng: { min: -123, max: -71 }, // Washington to Maine
	};

	while (result.length < count) {
		const city = faker.location.city();
		if (cities.has(city)) continue;

		cities.add(city);
		const state = faker.location.state({ abbreviated: true });
		const address = `${city}, ${state}, USA`;

		if (useRealGeocoding) {
			try {
				const locationDetails = await GeoLibSingleton.getLocationDetails(address);
				const coordinates: [number, number] = [
					Number(locationDetails.longitude),
					Number(locationDetails.latitude),
				];

				result.push({
					name: city,
					coordinates,
					address: locationDetails.formattedAddress ?? address,
				});
				continue;
			} catch (error) {
				console.warn(`Failed to geocode ${address}, falling back to mock data`);
			}
		}

		// Use faker data if real geocoding is disabled or failed
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
	const prefixes = [
		"Downtown",
		"Central",
		"North",
		"South",
		"East",
		"West",
		"Modern",
		"Historic",
		"Urban",
		"Metropolitan",
	];

	const suffixes = [
		"District",
		"Quarter",
		"Hub",
		"Zone",
		"Park",
		"Center",
		"Area",
		"Complex",
		"Corridor",
		"Square",
	];

	const specialties = [
		"Business",
		"Tech",
		"Cultural",
		"Innovation",
		"Financial",
		"Commercial",
		"Industrial",
		"Residential",
		"Entertainment",
		"Research",
	];

	const templates = new Set<string>();

	while (templates.size < count) {
		const useSpecialty = Math.random() > 0.5;
		const template =
			useSpecialty ?
				`${faker.helpers.arrayElement(specialties)} ${faker.helpers.arrayElement(suffixes)}`
			:	`${faker.helpers.arrayElement(prefixes)} ${faker.helpers.arrayElement(suffixes)}`;

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
	 * Seeds the database with test data.
	 *
	 * ## Workflow
	 * 1. Validate options
	 * 2. Generate cities and region templates
	 * 3. Start session
	 * 4. With transaction:
	 *    - Create users
	 *    - Create regions for each user
	 * 5. Commit transaction
	 * 6. End session
	 *
	 * @param options - Options for controlling the seeding process
	 * @throws {Error} If options are invalid
	 *
	 * @example
	 * ```typescript
	 * const seeder = new DatabaseSeeder(connection);
	 *
	 * // Seed with mock location data
	 * await seeder.seed();
	 *
	 * // Seed with real geocoding
	 * await seeder.seed({
	 *   userCount: 5,
	 *   regionsPerUser: { min: 1, max: 3 },
	 *   citiesCount: 100,
	 *   templatesCount: 30,
	 *   useRealGeocoding: true
	 * });
	 * ```
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

		const session = await this.connection.startSession();

		try {
			console.log(
				`Starting database seeding (${validatedOptions.userCount} users,` +
					` ${validatedOptions.regionsPerUser.min}-${validatedOptions.regionsPerUser.max} regions per user)...`,
			);

			await session.withTransaction(
				this.seedUsers.bind(this, validatedOptions, {
					cities,
					regionTemplates,
					session,
				}),
			);

			console.log("Database seeding completed successfully!");
		} catch (error) {
			console.error("Error seeding database:", error);
			throw error;
		} finally {
			await session.endSession();
		}
	}

	private async seedUsers(
		options: SeedOptions,
		{
			cities,
			regionTemplates,
			session,
		}: { cities: Array<City>; regionTemplates: string[]; session: ClientSession },
	) {
		for (let i = 0; i < options.userCount; i++) {
			const firstName = faker.person.firstName();
			const lastName = faker.person.lastName();
			const city = cities[i % cities.length];

			console.log(`Creating user ${i + 1}/${options.userCount}: ${firstName} ${lastName}`);

			const streetAddress = faker.location.streetAddress();
			const fullAddress = `${streetAddress}, ${city.address}`;

			let userCoordinates: [number, number];
			if (options.useRealGeocoding) {
				try {
					const locationDetails = await GeoLibSingleton.getLocationDetails(fullAddress);
					userCoordinates = [Number(locationDetails.longitude), Number(locationDetails.latitude)];
				} catch (error) {
					console.warn(`Failed to geocode ${fullAddress}, using city coordinates`);
					userCoordinates = city.coordinates;
				}
			} else {
				userCoordinates = city.coordinates;
			}

			const user = await UserModel.create(
				[
					{
						name: `${firstName} ${lastName}`,
						email: faker.internet.email({ firstName, lastName }),
						address: fullAddress,
						coordinates: userCoordinates,
					},
				],
				{ session },
			);

			console.log(`Creating regions for ${firstName} ${lastName}`);

			const regions = [];
			const numRegions =
				options.regionsPerUser.min +
				Math.floor(Math.random() * (options.regionsPerUser.max - options.regionsPerUser.min + 1));

			for (let j = 0; j < numRegions; j++) {
				const name = `${faker.location.county()} ${
					regionTemplates[Math.floor(Math.random() * regionTemplates.length)]
				}`;

				regions.push({
					name,
					user: user[0]._id,
					geometry: {
						type: "Polygon" as const,
						coordinates: this.generatePolygonCoordinates(userCoordinates),
					},
				});
			}

			await RegionModel.create(regions, { session });
		}
	}
}
