import { faker } from "@faker-js/faker";
import { AxiosError } from "axios";

import type { Connection } from "mongoose";

import type { SeedOptions } from "@/shared/schemas/seed.schema";

import { ApiKeyUtil, GeoCoding, REGION_TEMPLATES } from "@/core/utils";
import { RegionModel } from "@/modules/regions/region.model";
import { UserModel } from "@/modules/users/user.model";
import { defaultSeedOptions, seedOptionsSchema } from "@/shared/schemas/seed.schema";

/**
 * Represents a location with coordinates and address information
 */
interface Location {
	name: string;
	coordinates: [number, number];
	address: string;
}

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
		const points: Array<[number, number]> = [
			[center[0] - offset, center[1] - offset],
			[center[0] + offset, center[1] - offset],
			[center[0] + offset, center[1] + offset],
			[center[0] - offset, center[1] + offset],
			[center[0] - offset, center[1] - offset], // Close the polygon
		];
		return [points];
	}

	/**
	 * Formats an error message from various error types.
	 * Provides cleaner error messages especially for Axios errors.
	 *
	 * @param error The error to format
	 * @returns A formatted error message
	 */
	private formatErrorMessage(error: unknown): string {
		if (error instanceof AxiosError) {
			const status = error.response?.status;
			const data = error.response?.data;

			if (data && typeof data === "object" && "error_message" in data) {
				return `API Error (${status}): ${data.error_message}`;
			} else if (data && typeof data === "object" && "message" in data) {
				return `API Error (${status}): ${data.message}`;
			} else {
				return `API Error (${status}): ${error.message}`;
			}
		} else if (error instanceof Error) {
			return error.message;
		} else {
			return String(error);
		}
	}

	/**
	 * Generates a list of locations with coordinates and addresses.
	 * Uses either real geocoding or faker for mock data based on the useRealGeocoding option.
	 *
	 * @param count Number of locations to generate
	 * @param useRealGeocoding Whether to use real geocoding service
	 * @returns Array of location data objects
	 */
	private async generateLocations(
		count: number,
		useRealGeocoding: boolean,
	): Promise<Array<Location>> {
		const locations: Array<Location> = [];
		const cityNames = new Set<string>();

		// US bounds for realistic coordinates
		const bounds = {
			lat: { min: 25, max: 49 },
			lng: { min: -123, max: -71 },
		};

		// Pre-generate city names to avoid duplicates
		while (cityNames.size < count) {
			cityNames.add(faker.location.city());
		}

		const cityList = Array.from(cityNames);

		// Always use mock data if real geocoding is disabled
		if (!useRealGeocoding) {
			console.log("Using mock location data (geocoding disabled)");
			return cityList.map((city) => {
				const state = faker.location.state({ abbreviated: true });
				const address = `${city}, ${state}, USA`;
				return this.generateMockLocation(city, address, bounds);
			});
		}

		// Try to use real geocoding with fallback to mock data
		console.log("Using real geocoding with fallback to mock data");
		for (let i = 0; i < count; i++) {
			const city = cityList[i];
			const state = faker.location.state({ abbreviated: true });
			const address = `${city}, ${state}, USA`;

			try {
				const locationDetails = await GeoCoding.getLocationFromAddress(address);
				locations.push({
					name: city,
					coordinates: [
						Number(locationDetails.geometry.location.lng),
						Number(locationDetails.geometry.location.lat),
					],
					address: locationDetails.formatted_address,
				});

				// Add a small delay to avoid rate limiting
				await new Promise((resolve) => setTimeout(resolve, 200));
			} catch (error) {
				const errorMsg = this.formatErrorMessage(error);
				console.warn(`Failed to geocode ${address}: ${errorMsg}`);
				console.warn("Falling back to mock data");
				locations.push(this.generateMockLocation(city, address, bounds));
			}
		}

		return locations;
	}

	/**
	 * Generates a mock location with random coordinates within specified bounds.
	 *
	 * @param city The city name
	 * @param address The address string
	 * @param bounds The coordinate bounds
	 * @returns A location object with mock data
	 */
	private generateMockLocation(
		city: string,
		address: string,
		bounds: { lat: { min: number; max: number }; lng: { min: number; max: number } },
	): Location {
		return {
			name: city,
			coordinates: [
				Number(faker.location.longitude(bounds.lng)),
				Number(faker.location.latitude(bounds.lat)),
			],
			address,
		};
	}

	/**
	 * Generates region name templates for district naming.
	 *
	 * @param count Number of templates to generate
	 * @returns Array of district name templates
	 */
	private generateRegionTemplates(count: number): Array<string> {
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
	}

	/**
	 * Seeds the database with test data.
	 *
	 * ## Workflow
	 * 1. Validate options
	 * 2. Generate locations and region templates
	 * 3. Create users and their regions
	 * 4. Return summary of created data
	 *
	 * @param options - Options for controlling the seeding process
	 * @returns Summary of the seeding operation
	 * @throws {Error} If seeding fails
	 */
	public async seed(options?: Partial<SeedOptions>) {
		// Validate options
		let validatedOptions: SeedOptions;

		if (options) {
			const { success, data, error } = seedOptionsSchema.safeParse({
				...defaultSeedOptions,
				...options,
			});

			if (success) {
				validatedOptions = data;
			} else {
				console.error("Invalid seed options, using defaults.", error.message);
				validatedOptions = defaultSeedOptions;
			}
		} else {
			validatedOptions = defaultSeedOptions;
		}

		console.log(
			`Starting database seeding (${validatedOptions.userCount} users,` +
				` ${validatedOptions.regionsPerUser.min}-${validatedOptions.regionsPerUser.max} regions per user)...`,
		);

		try {
			// Generate locations and region templates
			console.log(`Generating ${validatedOptions.citiesCount} locations...`);
			const locations = await this.generateLocations(
				validatedOptions.citiesCount,
				validatedOptions.useRealGeocoding,
			);

			console.log(`Generating ${validatedOptions.templatesCount} region templates...`);
			const regionTemplates = this.generateRegionTemplates(validatedOptions.templatesCount);

			// Create users and regions
			console.log(`Creating ${validatedOptions.userCount} users with regions...`);

			const createdUsers = [];
			const createdRegions = [];

			// Process users one by one to avoid overwhelming the database
			for (let i = 0; i < validatedOptions.userCount; i++) {
				try {
					// Generate user data
					const firstName = faker.person.firstName();
					const lastName = faker.person.lastName();
					const location = locations[i % locations.length];

					// Use a consistent domain to avoid validation issues
					const email = faker.internet
						.email({
							firstName,
							lastName,
							provider: "example.com",
						})
						.toLowerCase();

					// Create user without session (no transactions)
					const { user, apiKey } = await this.createUser({
						name: `${firstName} ${lastName}`,
						email,
						address: location.address,
						coordinates: location.coordinates,
					});

					console.log(`Created user: ${user.name} (API Key: ${apiKey.substring(0, 8)}...)`);
					createdUsers.push(user);

					// Create regions for user without session (no transactions)
					const regions = await this.createRegionsForUser(user, validatedOptions, regionTemplates);

					console.log(`Created ${regions.length} regions for user: ${user.name}`);
					createdRegions.push(...regions);
				} catch (error) {
					const errorMsg = this.formatErrorMessage(error);
					console.error(`Failed to create user ${i + 1}: ${errorMsg}`);
					console.error("Continuing with next user...");
				}
			}

			if (createdUsers.length === 0) {
				throw new Error("Failed to create any users");
			}

			console.log("Database seeding completed successfully!");
			return {
				users: createdUsers.length,
				regions: createdRegions.length,
				locations: locations.length,
				templates: regionTemplates.length,
			};
		} catch (error) {
			const errorMsg = this.formatErrorMessage(error);
			console.error("Error seeding database:", errorMsg);
			throw error;
		}
	}

	/**
	 * Creates a user with the specified data.
	 *
	 * @param userData The user data to create
	 * @returns The created user and API key
	 */
	private async createUser(userData: {
		name: string;
		email: string;
		address: string;
		coordinates: [number, number];
	}) {
		// Generate API key for the user
		const apiKey = ApiKeyUtil.generate();
		const apiKeyHash = ApiKeyUtil.hash(apiKey);

		// Check if a user with this email already exists
		const existingUser = await UserModel.findOne({ email: userData.email });
		if (existingUser) {
			console.log(`User with email ${userData.email} already exists, skipping creation`);
			return { user: existingUser, apiKey };
		}

		// Create the user without transactions
		const user = await UserModel.create({
			...userData,
			apiKeyHash,
			// Ensure regions array is initialized
			regions: [],
		});

		return { user, apiKey };
	}

	/**
	 * Creates regions for a specific user.
	 *
	 * @param user The user to create regions for
	 * @param options The seeding options
	 * @param regionTemplates The region templates to use
	 * @returns The created regions
	 */
	private async createRegionsForUser(
		user: InstanceType<typeof UserModel>,
		options: SeedOptions,
		regionTemplates: Array<string>,
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

		const createdRegions = await RegionModel.create(regions);

		// Update user with region references
		await UserModel.findByIdAndUpdate(user._id, {
			$push: { regions: { $each: createdRegions.map((region) => region._id) } },
		});

		return createdRegions;
	}
}
