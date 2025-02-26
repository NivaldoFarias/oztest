import { Client, Language, Status } from "@googlemaps/google-maps-services-js";
import { match, P } from "ts-pattern";

import type {
	ClientOptions,
	GeocodeRequest,
	GeocodeResult,
	LatLng,
	LatLngLiteralVerbose,
	ReverseGeocodeRequest,
} from "@googlemaps/google-maps-services-js";

import { env } from "./env.util";

/**
 * Utility class for Google Maps geolocation services
 */
export class GeoCoding {
	private readonly baseConfig: GeocodeRequest = {
		params: {
			key: env.GEOCODING_API_KEY,
			language: Language.en,
		},
	};
	private readonly client: Client;

	/**
	 * Creates a new instance of the GeoLib class with the specified configuration.
	 *
	 * @param clientOptions The configuration options for the geocoding service
	 *
	 * @example
	 * ```typescript
	 * const geoLib = new GeoLib();
	 * ```
	 */
	constructor(clientOptions?: ClientOptions) {
		this.client = new Client(clientOptions);
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
	public async getLocationFromCoordinates(coordinates: LatLng) {
		const response = await this.client.reverseGeocode(
			this.composeRequestOptions({ latlng: coordinates } as ReverseGeocodeRequest["params"]),
		);

		if (response.data.status !== Status.OK || !response.data.results.length) {
			throw new Error(`Geocoding failed: ${response.data.status}`);
		}

		return this.findNearestLocationMatch(response.data.results, coordinates);
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
	public async getLocationFromAddress(address: string) {
		const response = await this.client.geocode(
			this.composeRequestOptions({ address } as GeocodeRequest["params"]),
		);

		if (response.data.status !== Status.OK || !response.data.results.length) {
			throw new Error(`Geocoding failed: ${response.data.status}`);
		}

		return this.findNearestLocationMatch(response.data.results, address);
	}

	/**
	 * Composes options for geocoding requests.
	 *
	 * @param params The parameters for the geocoding request
	 * @returns The composed options
	 */
	private composeRequestOptions<T extends GeocodeRequest | ReverseGeocodeRequest>(
		params: T["params"],
	): T {
		const baseConfig = this.baseConfig as T;

		return {
			...baseConfig,
			params: {
				...baseConfig.params,
				...params,
			},
		};
	}

	/**
	 * Finds the nearest location match from a list of geocoding results.
	 *
	 * @param results An array of geocoding results
	 * @param toMatch The location to match against, either a string address or a LatLng object
	 *
	 * @throws {Error} If no match is found
	 *
	 * @returns The nearest location match
	 */
	private findNearestLocationMatch(results: GeocodeResult[], toMatch: LatLng) {
		if (typeof toMatch === "string") {
			const match = results.find(({ formatted_address }) => formatted_address === toMatch);

			if (!match) throw new Error("No match found");

			return match;
		}

		let match = results.find(({ geometry }) => {
			const currentLatLng = this.coerceCoordinates(geometry.location);
			const toMatchLatLng = this.coerceCoordinates(toMatch);

			return (
				currentLatLng.latitude === toMatchLatLng.latitude &&
				currentLatLng.longitude === toMatchLatLng.longitude
			);
		});

		if (!match) {
			const rankedResults = results.toSorted((current, next) => {
				const currentLatLng = this.coerceCoordinates(current.geometry.location);
				const nextLatLng = this.coerceCoordinates(next.geometry.location);
				const toMatchLatLng = this.coerceCoordinates(toMatch);

				const currentDistance =
					Math.abs(currentLatLng.latitude - toMatchLatLng.latitude) +
					Math.abs(currentLatLng.longitude - toMatchLatLng.longitude);
				const nextDistance =
					Math.abs(nextLatLng.latitude - toMatchLatLng.latitude) +
					Math.abs(nextLatLng.longitude - toMatchLatLng.longitude);

				return currentDistance - nextDistance;
			});

			match = rankedResults.at(-1);

			if (!match) throw new Error("No match found");
		}

		return match;
	}

	/**
	 * Coerces different coordinate formats into a standardized LatLngLiteralVerbose object.
	 *
	 * ## Workflow
	 * 1. Uses pattern matching to identify and validate input format
	 * 2. Transforms the input into a standardized format
	 * 3. Throws if no pattern matches or coordinates are invalid
	 *
	 * @param coordinates The coordinates in various formats (string, array, or object)
	 * @throws {Error} If coordinates are invalid or in an unsupported format
	 *
	 * @returns The coerced coordinates
	 * @example
	 * ```typescript
	 * // String format
	 * const coords1 = coerceCoordinates("37.7749,-122.4194");
	 *
	 * // Array format
	 * const coords2 = coerceCoordinates([37.7749, -122.4194]);
	 *
	 * // Object format with lat/lng
	 * const coords3 = coerceCoordinates({ lat: 37.7749, lng: -122.4194 });
	 *
	 * // Object format with latitude/longitude
	 * const coords4 = coerceCoordinates({ latitude: 37.7749, longitude: -122.4194 });
	 * ```
	 */
	private coerceCoordinates(coordinates: LatLng): LatLngLiteralVerbose {
		return match(coordinates)
			.with(P.string, (coords) => {
				const [latitude, longitude] = coords.split(",").map(Number);

				if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
					throw new Error("Invalid string coordinates format");
				}

				return { latitude, longitude };
			})
			.with(P.array(P.number), ([latitude, longitude]) => {
				if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
					throw new Error("Invalid array coordinates format");
				}

				return { latitude, longitude };
			})
			.with({ lat: P.number, lng: P.number }, ({ lat, lng }) => ({
				latitude: lat,
				longitude: lng,
			}))
			.with({ latitude: P.number, longitude: P.number }, (coords) => coords)
			.otherwise(() => {
				throw new Error("Invalid coordinates");
			});
	}
}

/**
 * Creates and exports a singleton instance of the GeoLib class using OpenStreetMap as the default provider.
 * This ensures all geolocation operations use the same instance and configuration.
 */
export const GeoCodingSingleton = new GeoCoding();
