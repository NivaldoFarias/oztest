import NodeGeocoder from "node-geocoder";

import type { Options as GeocoderOptions } from "node-geocoder";

import { env } from "./env.util";

/**
 * Represents a set of geographical coordinates with latitude and longitude values.
 * Used throughout the application for location-based operations.
 */
export interface Coordinates {
	latitude: number;
	longitude: number;
}

/**
 * Represents the configuration options for the geocoding service.
 * Provides a subset of NodeGeocoder options that are relevant for our use case.
 */
export interface GeocodingConfig {
	provider: GeocoderOptions["provider"];
	apiKey?: string;
	language?: string;
	region?: string;
}

/**
 * Utility class for handling geolocation operations and coordinate transformations.
 * Provides methods for converting between coordinates and human-readable addresses.
 */
export class GeoLib {
	private readonly geocoder: NodeGeocoder.Geocoder;

	/**
	 * Creates a new instance of the GeoLib class with the specified configuration.
	 *
	 * @param config The configuration options for the geocoding service
	 * @throws {Error} If the provider is not supported or if required API key is missing
	 *
	 * @example
	 * ```typescript
	 * const geoLib = new GeoLib({
	 *   provider: 'google',
	 *   apiKey: 'your-api-key'
	 * });
	 * ```
	 */
	constructor(config: GeocodingConfig) {
		if (config.provider !== "openstreetmap" && !config.apiKey) {
			throw new Error(`API key is required for ${config.provider} provider`);
		}

		this.geocoder = NodeGeocoder({
			provider: config.provider,
			apiKey: config.apiKey,
			language: config.language ?? "en",
			region: config.region,
		} as GeocoderOptions);
	}

	/**
	 * Converts geographical coordinates to a human-readable address through reverse geocoding.
	 *
	 * ## Workflow
	 * 1. Validates and normalizes input coordinates
	 * 2. Performs reverse geocoding using the configured provider
	 * 3. Returns the first matching address or throws if none found
	 *
	 * @param coordinates The coordinates to convert, can be either:
	 *                   - A tuple of [longitude, latitude]
	 *                   - An object with lat and lng properties
	 * @throws {Error} If geocoding fails or no results are found
	 *
	 * @returns A promise that resolves to a human-readable address string
	 *
	 * @example
	 * ```typescript
	 * // Using array format
	 * const address1 = await geoLib.getAddressFromCoordinates([-122.085091, 37.42274]);
	 *
	 * // Using object format
	 * const address2 = await geoLib.getAddressFromCoordinates({ lat: 37.42274, lng: -122.085091 });
	 * ```
	 */
	public async getAddressFromCoordinates(coordinates: [number, number] | Coordinates) {
		const [lat, lon] =
			Array.isArray(coordinates) ?
				[coordinates[1], coordinates[0]]
			:	[coordinates.latitude, coordinates.longitude];

		const results = await this.geocoder.reverse({ lat, lon });

		if (!results.length || !results[0].formattedAddress) {
			throw new Error("No address found for the provided coordinates");
		}

		return results[0].formattedAddress;
	}

	/**
	 * Converts a human-readable address to geographical coordinates through forward geocoding.
	 *
	 * ## Workflow
	 * 1. Validates input address string
	 * 2. Performs forward geocoding using the configured provider
	 * 3. Returns the first matching coordinates or throws if none found
	 *
	 * @param address A string containing the address to geocode (e.g., street address, city, country)
	 * @throws {Error} If geocoding fails or no results are found
	 *
	 * @returns A promise that resolves to a Coordinates object containing lat and lng
	 *
	 * @example
	 * ```typescript
	 * const coords = await geoLib.getCoordinatesFromAddress('1600 Amphitheatre Parkway, Mountain View, CA');
	 * console.log(coords); // { lat: 37.42274, lng: -122.085091 }
	 * ```
	 */
	public async getCoordinatesFromAddress(address: string) {
		const results = await this.geocoder.geocode(address);

		if (!results.length || !results[0].latitude || !results[0].longitude) {
			throw new Error("No coordinates found for the provided address");
		}

		return {
			latitude: results[0].latitude,
			longitude: results[0].longitude,
		};
	}

	/**
	 * Retrieves detailed location information for a given address or coordinates.
	 *
	 * ## Workflow
	 * 1. Accepts either an address string or coordinates
	 * 2. Performs geocoding using the appropriate method
	 * 3. Returns comprehensive location details including administrative areas
	 *
	 * @param query The location query - either an address string or coordinates
	 * @throws {Error} If geocoding fails or no results are found
	 *
	 * @returns A promise that resolves to detailed location information
	 *
	 * @example
	 * ```typescript
	 * // Using address
	 * const details1 = await geoLib.getLocationDetails('1600 Amphitheatre Parkway, Mountain View, CA');
	 *
	 * // Using coordinates
	 * const details2 = await geoLib.getLocationDetails({ lat: 37.42274, lng: -122.085091 });
	 * ```
	 */
	public async getLocationDetails(query: string | Coordinates) {
		const results =
			typeof query === "string" ?
				await this.geocoder.geocode(query)
			:	await this.geocoder.reverse({ lat: query.latitude, lon: query.longitude });

		if (!results[0]) {
			throw new Error("No location details found for the provided query");
		}

		return results[0];
	}
}

/**
 * Creates and exports a singleton instance of the GeoLib class using OpenStreetMap as the default provider.
 * This ensures all geolocation operations use the same instance and configuration.
 */
export const GeoLibSingleton = new GeoLib({
	provider: "openstreetmap",
	apiKey: env.GEOCODING_API_KEY,
	language: "en",
	region: "US",
});
