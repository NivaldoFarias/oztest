import { faker } from "@faker-js/faker";
import { afterAll, afterEach, beforeAll, beforeEach, mock } from "bun:test";
import mongoose from "mongoose";

import "@/database";

import server from "@/api/server";
import { UserModel } from "@/models";
import { GeoLib } from "@/utils/geo.util";

/**
 * Creates a test session and mocks external dependencies
 *
 * @returns The test session and mocked utilities
 */
export async function setupTestEnvironment() {
	const session = await mongoose.startSession();

	const geoLibMock = {
		getAddressFromCoordinates: mock(() =>
			Promise.resolve(faker.location.streetAddress({ useFullAddress: true })),
		),
		getCoordinatesFromAddress: mock(() =>
			Promise.resolve({
				lat: faker.location.latitude(),
				lng: faker.location.longitude(),
			}),
		),
	};

	Object.assign(GeoLib, geoLibMock);

	return { session, geoLibMock };
}

/**
 * Creates a test user for use in tests
 *
 * @returns The created test user
 */
export async function createTestUser() {
	return UserModel.create({
		name: faker.person.firstName(),
		email: faker.internet.email(),
		address: faker.location.streetAddress({ useFullAddress: true }),
	});
}

/**
 * Creates a test server instance for API testing
 *
 * @returns The server instance and its URL
 */
export async function createTestServer() {
	const port = 3001;

	await server.start(port);

	return {
		server,
		url: `http://localhost:${port}`,
		stop: () => server.stop(),
	};
}

beforeAll(() => {
	// Any global setup if needed
});

afterAll(async () => {
	await mongoose.disconnect();
});

beforeEach(async (done) => {
	const collections = await mongoose.connection.db.collections();

	for (const collection of collections) {
		await collection.deleteMany({});
	}

	done();
});

afterEach(() => {
	mock.restore();
});
