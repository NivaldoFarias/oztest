import { faker } from "@faker-js/faker";
import { AxiosError } from "axios";

import type { Connection } from "mongoose";

import type { SeedOptions } from "@/shared/schemas/seed.schema";

import { ApiKeyUtil, GeoCoding, PaginationUtil, REGION_TEMPLATES } from "@/core/utils";
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
	 * Clears existing data from the database.
	 * Removes all users and regions to start with a clean slate.
	 *
	 * @returns Summary of deleted documents
	 */
	private async clearExistingData(): Promise<{ users: number; regions: number }> {
		console.log("Clearing existing data...");

		const [userResult, regionResult] = await Promise.all([
			UserModel.deleteMany({}),
			RegionModel.deleteMany({}),
		]);

		console.log(
			`Deleted ${userResult.deletedCount} users and ${regionResult.deletedCount} regions`,
		);

		return {
			users: userResult.deletedCount || 0,
			regions: regionResult.deletedCount || 0,
		};
	}

	/**
	 * Creates users in batches for better performance.
	 *
	 * @param count Total number of users to create
	 * @param options Seeding options
	 * @param locations Generated locations
	 * @param batchSize Number of users to create in each batch
	 * @returns Array of created users
	 */
	private async createUsersBatch(
		count: number,
		options: SeedOptions,
		locations: Array<Location>,
		batchSize: number,
	): Promise<Array<{ user: any; apiKey: string }>> {
		const createdUsers: Array<{ user: any; apiKey: string }> = [];
		const batches: number = Math.ceil(count / batchSize);

		console.log(
			`Creating ${count} users in ${batches} batches of up to ${batchSize} users each...`,
		);

		for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
			// Calculate batch boundaries
			const batchStart: number = batchIndex * batchSize;
			const batchEnd: number = Math.min(batchStart + batchSize, count);
			const currentBatchSize: number = batchEnd - batchStart;

			console.log(`Processing batch ${batchIndex + 1}/${batches} (${currentBatchSize} users)...`);

			const userBatch: Array<any> = [];
			const userApiKeys: Array<string> = [];

			// Prepare batch of users
			for (let i = 0; i < currentBatchSize; i++) {
				const userIndex = batchStart + i;
				const firstName = faker.person.firstName();
				const lastName = faker.person.lastName();
				const location = locations[userIndex % locations.length];

				// Generate user data with prefix if specified
				const name =
					options.userNamePrefix ?
						`${options.userNamePrefix} ${firstName} ${lastName}`
					:	`${firstName} ${lastName}`;

				// Use specified domain for email
				const email = faker.internet
					.email({
						firstName,
						lastName,
						provider: options.emailDomain,
					})
					.toLowerCase();

				// Generate API key
				const apiKey = ApiKeyUtil.generate();
				const apiKeyHash = ApiKeyUtil.hash(apiKey);

				userBatch.push({
					name,
					email,
					address: location.address,
					coordinates: location.coordinates,
					regions: [],
					apiKeyHash,
				});

				userApiKeys.push(apiKey);
			}

			try {
				// Create batch of users
				const createdBatch = await UserModel.create(userBatch);

				// Add created users to result array with their API keys
				for (let i = 0; i < createdBatch.length; i++) {
					createdUsers.push({
						user: createdBatch[i],
						apiKey: userApiKeys[i],
					});
				}

				console.log(`Created ${createdBatch.length} users in batch ${batchIndex + 1}`);
			} catch (error) {
				const errorMsg = this.formatErrorMessage(error);
				console.error(`Failed to create user batch ${batchIndex + 1}: ${errorMsg}`);
				console.error("Continuing with next batch...");
			}
		}

		return createdUsers;
	}

	/**
	 * Seeds the database with test data.
	 *
	 * ## Workflow
	 * 1. Validate options
	 * 2. Clear existing data if requested
	 * 3. Generate locations and region templates
	 * 4. Create users in batches
	 * 5. Create regions for each user
	 * 6. Return summary of created data
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
			// Clear existing data if requested
			if (validatedOptions.clearExistingData) {
				await this.clearExistingData();
			}

			// Generate locations and region templates
			console.log(`Generating ${validatedOptions.citiesCount} locations...`);
			const locations = await this.generateLocations(
				validatedOptions.citiesCount,
				validatedOptions.useRealGeocoding,
			);

			console.log(`Generating ${validatedOptions.templatesCount} region templates...`);
			const regionTemplates = this.generateRegionTemplates(validatedOptions.templatesCount);

			// Create users in batches
			const createdUsers = await this.createUsersBatch(
				validatedOptions.userCount,
				validatedOptions,
				locations,
				validatedOptions.batchSize,
			);

			if (createdUsers.length === 0) {
				throw new Error("Failed to create any users");
			}

			// Create regions for each user
			console.log(`Creating regions for ${createdUsers.length} users...`);
			const createdRegions = [];

			for (const { user } of createdUsers) {
				try {
					const regions = await this.createRegionsForUser(user, validatedOptions, regionTemplates);

					console.log(`Created ${regions.length} regions for user: ${user.name}`);
					createdRegions.push(...regions);
				} catch (error) {
					const errorMsg = this.formatErrorMessage(error);
					console.error(`Failed to create regions for user ${user.name}: ${errorMsg}`);
					console.error("Continuing with next user...");
				}
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

		const regions = Array.from({ length: numRegions }, () => {
			const countyName = faker.location.county();
			const templateName = regionTemplates[Math.floor(Math.random() * regionTemplates.length)];

			// Apply region name prefix if specified
			const name =
				options.regionNamePrefix ?
					`${options.regionNamePrefix} ${countyName} ${templateName}`
				:	`${countyName} ${templateName}`;

			return {
				name,
				user: user._id,
				geometry: {
					type: "Polygon" as const,
					coordinates: this.generatePolygonCoordinates(user.coordinates),
				},
			};
		});

		const createdRegions = await RegionModel.create(regions);

		// Update user with region references
		await UserModel.findByIdAndUpdate(user._id, {
			$push: { regions: { $each: createdRegions.map((region) => region._id) } },
		});

		return createdRegions;
	}

	/**
	 * Retrieves statistics about the seeded data.
	 * Uses the pagination utility to get counts and samples of the data.
	 *
	 * @returns Statistics about the seeded data
	 */
	public async getStatistics() {
		// Get user statistics
		const userResult = await PaginationUtil.paginate(UserModel, {
			page: 1,
			limit: 5,
			sortBy: "createdAt",
			sortDirection: "desc",
		});

		// Get region statistics
		const regionResult = await PaginationUtil.paginate(RegionModel, {
			page: 1,
			limit: 5,
			sortBy: "createdAt",
			sortDirection: "desc",
		});

		// Get user count by email domain
		const emailDomains = await UserModel.aggregate([
			{
				$group: {
					_id: {
						$regexExtract: {
							input: "$email",
							regex: /@(.+)$/,
							options: "",
							index: 1,
						},
					},
					count: { $sum: 1 },
				},
			},
			{ $sort: { count: -1 } },
			{ $limit: 5 },
		]);

		return {
			users: {
				total: userResult.meta.totalItems,
				samples: userResult.data.map((user) => ({
					id: user._id,
					name: user.name,
					email: user.email,
					regionsCount: user.regions.length,
				})),
			},
			regions: {
				total: regionResult.meta.totalItems,
				samples: regionResult.data.map((region) => ({
					id: region._id,
					name: region.name,
					userId: region.user,
				})),
			},
			emailDomains: emailDomains.map((domain) => ({
				domain: domain._id,
				count: domain.count,
			})),
		};
	}
}
