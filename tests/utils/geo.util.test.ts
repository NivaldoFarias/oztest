import Bun from "bun";
import { describe, expect, it } from "bun:test";

import type { GeocodeResult } from "@googlemaps/google-maps-services-js";

import { GeoCodingUtil } from "@/utils/";

import mockLocation from "@tests/mocks/location.mock.json";

describe("GeoLib", () => {
	const geoLib = new GeoCodingUtil();
	const exactCoordinates = mockLocation as GeocodeResult;

	it("should get address from coordinates", async () => {
		const location = await geoLib.getLocationFromCoordinates(exactCoordinates.geometry.location);

		await Bun.write("mocks/location.mock.json", JSON.stringify(location));

		expect(location).toBeDefined();
		expect(location.formatted_address).toBe(exactCoordinates.formatted_address);
	});

	it("should get coordinates from address", async () => {
		const location = await geoLib.getLocationFromAddress(exactCoordinates.formatted_address);

		expect(location).toBeDefined();
		expect(location.geometry.location.lat).toBe(exactCoordinates.geometry.location.lat);
		expect(location.geometry.location.lng).toBe(exactCoordinates.geometry.location.lng);
	});
});
