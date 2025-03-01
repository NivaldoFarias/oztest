import { faker } from "@faker-js/faker";

/**
 * Generates a polygon with random coordinates
 *
 * @param pointCount Number of points to generate for the polygon (minimum 4 to close the polygon)
 * @param centerLng Center longitude for the polygon
 * @param centerLat Center latitude for the polygon
 * @param radius Maximum distance from center in degrees
 * @returns Array of coordinate pairs forming a closed polygon
 */
const generatePolygon = (
	pointCount = 5,
	centerLng = 0,
	centerLat = 0,
	radius = 0.1,
): Array<[number, number]> => {
	// Ensure minimum 4 points (3 + 1 to close the polygon)
	const actualPointCount = Math.max(4, pointCount);

	// Generate points in a rough circle around the center
	const points: Array<[number, number]> = [];

	for (let i = 0; i < actualPointCount - 1; i++) {
		const angle = (i / (actualPointCount - 1)) * 2 * Math.PI;
		// Add some randomness to make the polygon irregular
		const distance = radius * (0.7 + 0.3 * faker.number.float({ min: 0, max: 1 }));

		const lng = centerLng + distance * Math.cos(angle);
		const lat = centerLat + distance * Math.sin(angle);

		// Ensure coordinates are within valid ranges
		const validLng = Math.max(-180, Math.min(180, lng));
		const validLat = Math.max(-90, Math.min(90, lat));

		points.push([validLng, validLat]);
	}

	// Close the polygon by adding the first point again
	points.push([...points[0]]);

	return points;
};

/**
 * Generates consistent region data using Faker
 *
 * @param seed Optional seed to ensure consistent generation
 * @returns A region object with consistent properties
 */
const generateRegion = (seed?: number) => {
	if (seed !== undefined) faker.seed(seed);

	const regionId = faker.string.uuid();
	const regionName = `${faker.location.county()} ${faker.helpers.arrayElement([
		"District",
		"Zone",
		"Area",
		"Region",
		"Territory",
	])}`;
	const userId = faker.string.alphanumeric(10);

	// Generate a random center point for the polygon
	const centerLng = faker.location.longitude({ precision: 6 });
	const centerLat = faker.location.latitude({ precision: 6 });

	// Generate polygon coordinates
	const polygonCoordinates = [generatePolygon(6, centerLng, centerLat, 0.05)];

	return {
		_id: regionId,
		name: regionName,
		user: userId,
		geometry: {
			type: "Polygon" as const,
			coordinates: polygonCoordinates,
		},
		createdAt: faker.date.recent(),
		updatedAt: faker.date.recent(),
	};
};

/**
 * Example region data that matches the Region schema
 * Used for documentation, testing, and development
 */
export const regionExample = generateRegion(1);

/**
 * Second example region with different properties
 */
export const regionExample2 = generateRegion(2);

/**
 * Example of a paginated regions response
 */
export const getRegionsResponseExample = {
	rows: [regionExample, regionExample2],
	page: 1,
	limit: 10,
	total: 2,
};

/**
 * Example of a region creation body
 */
export const createRegionBodyExample = {
	name: faker.location.county() + " District",
	geometry: {
		type: "Polygon" as const,
		coordinates: [generatePolygon(5, faker.location.longitude(), faker.location.latitude(), 0.08)],
	},
};

/**
 * Example of a region update body with name change
 */
export const updateRegionBodyNameExample = {
	update: {
		name: regionExample.name + " Updated",
	},
};

/**
 * Example of a region update body with geometry change
 */
export const updateRegionBodyGeometryExample = {
	update: {
		geometry: {
			type: "Polygon" as const,
			coordinates: [generatePolygon(4, faker.location.longitude(), faker.location.latitude(), 0.1)],
		},
	},
};

/**
 * Example of a region update body with both name and geometry changes
 */
export const updateRegionBodyFullExample = {
	update: {
		name: regionExample.name + " Renamed",
		geometry: {
			type: "Polygon" as const,
			coordinates: [
				generatePolygon(5, faker.location.longitude(), faker.location.latitude(), 0.07),
			],
		},
	},
};

/**
 * Example of an update region response
 */
export const updateRegionResponseExample = {
	status: 200,
};

/**
 * Example of a delete region response
 */
export const deleteRegionResponseExample = {
	status: 200,
	message: "Region successfully deleted",
};
