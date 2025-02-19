/**
 * Represents a set of geographical coordinates with latitude and longitude values.
 * Used throughout the application for location-based operations.
 */
export interface Coordinates {
	lat: number;
	lng: number;
}

/**
 * Utility class for handling geolocation operations and coordinate transformations.
 * Provides methods for converting between coordinates and human-readable addresses.
 */
class GeoLib {
	/**
	 * Converts geographical coordinates to a human-readable address through reverse geocoding.
	 *
	 * @param coordinates The coordinates to convert, can be either:
	 *                   - A tuple of [longitude, latitude]
	 *                   - An object with lat and lng properties
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
		// TODO: Implement geocoding service integration
		return Promise.resolve("123 Main St, Anytown, USA");
	}

	/**
	 * Converts a human-readable address to geographical coordinates through forward geocoding.
	 *
	 * @param address A string containing the address to geocode (e.g., street address, city, country)
	 * @returns A promise that resolves to a Coordinates object containing lat and lng
	 *
	 * @example
	 * ```typescript
	 * const coords = await geoLib.getCoordinatesFromAddress('1600 Amphitheatre Parkway, Mountain View, CA');
	 * console.log(coords); // { lat: 37.42274, lng: -122.085091 }
	 * ```
	 */
	public async getCoordinatesFromAddress(address: string) {
		// TODO: Implement geocoding service integration
		return Promise.resolve({ lat: 37.42274, lng: -122.085091 });
	}
}

/**
 * A singleton instance of the GeoLib class for global use throughout the application.
 * This ensures all geolocation operations use the same instance and configuration.
 */
export default new GeoLib();
