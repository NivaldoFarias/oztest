import { faker } from "@faker-js/faker";
import { createTestServer, createTestUser } from "@tests/setup";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";

describe("Region API", () => {
	let baseUrl: string;
	let stopServer: () => Promise<void>;

	beforeAll(async () => {
		const { url, stop } = await createTestServer();
		baseUrl = url;
		stopServer = stop;
	});

	afterAll(async () => {
		await stopServer();
	});

	it("should get all regions", async () => {
		// Arrange
		const user = await createTestUser();
		const regionData = {
			user: user._id,
			name: faker.location.city(),
			geometry: {
				type: "Polygon" as const,
				coordinates: [
					[
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
					],
				],
			},
		};

		const createResponse = await fetch(`${baseUrl}/regions`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(regionData),
		});
		const region = await createResponse.json();

		// Act
		const response = await fetch(`${baseUrl}/regions`);
		const data = await response.json();

		// Assert
		expect(response.status).toBe(200);
		expect(Array.isArray(data.rows)).toBe(true);
		expect(data.rows).toContainEqual(
			expect.objectContaining({
				_id: region._id,
				name: region.name,
				user: user._id.toString(),
			}),
		);
	});

	it("should get a single region", async () => {
		// Arrange
		const user = await createTestUser();
		const regionData = {
			user: user._id,
			name: faker.location.city(),
			geometry: {
				type: "Polygon" as const,
				coordinates: [
					[
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
					],
				],
			},
		};

		const createResponse = await fetch(`${baseUrl}/regions`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(regionData),
		});
		const region = await createResponse.json();

		// Act
		const response = await fetch(`${baseUrl}/regions/${region._id}`);
		const data = await response.json();

		// Assert
		expect(response.status).toBe(200);
		expect(data).toEqual(
			expect.objectContaining({
				_id: region._id,
				name: region.name,
				user: user._id.toString(),
			}),
		);
	});

	it("should create a new region", async () => {
		// Arrange
		const user = await createTestUser();
		const regionData = {
			user: user._id,
			name: faker.location.city(),
			geometry: {
				type: "Polygon" as const,
				coordinates: [
					[
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
					],
				],
			},
		};

		// Act
		const response = await fetch(`${baseUrl}/regions`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(regionData),
		});
		const data = await response.json();

		// Assert
		expect(response.status).toBe(201);
		expect(data).toEqual(
			expect.objectContaining({
				name: regionData.name,
				user: user._id.toString(),
				geometry: regionData.geometry,
			}),
		);
	});

	it("should update a region", async () => {
		// Arrange
		const user = await createTestUser();
		const regionData = {
			user: user._id,
			name: faker.location.city(),
			geometry: {
				type: "Polygon" as const,
				coordinates: [
					[
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
					],
				],
			},
		};

		const createResponse = await fetch(`${baseUrl}/regions`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(regionData),
		});
		const region = await createResponse.json();

		const updateData = {
			name: faker.location.city(),
		};

		// Act
		const response = await fetch(`${baseUrl}/regions/${region._id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(updateData),
		});
		const data = await response.json();

		// Assert
		expect(response.status).toBe(200);
		expect(data).toEqual(
			expect.objectContaining({
				_id: region._id,
				name: updateData.name,
			}),
		);
	});

	it("should delete a region", async () => {
		// Arrange
		const user = await createTestUser();
		const regionData = {
			user: user._id,
			name: faker.location.city(),
			geometry: {
				type: "Polygon" as const,
				coordinates: [
					[
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
						[faker.location.longitude(), faker.location.latitude()],
					],
				],
			},
		};

		const createResponse = await fetch(`${baseUrl}/regions`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(regionData),
		});
		const region = await createResponse.json();

		// Act
		const response = await fetch(`${baseUrl}/regions/${region._id}`, {
			method: "DELETE",
		});

		// Assert
		expect(response.status).toBe(204);

		const getResponse = await fetch(`${baseUrl}/regions/${region._id}`);
		expect(getResponse.status).toBe(404);
	});
});
