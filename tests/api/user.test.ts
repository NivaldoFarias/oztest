import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { createTestServer, createTestUser } from "@tests/setup";

describe("User API", () => {
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

	it("should get all users", async () => {
		// Arrange
		const user = await createTestUser();

		// Act
		const response = await fetch(`${baseUrl}/users`);
		const data = await response.json();

		// Assert
		expect(response.status).toBe(200);
		expect(Array.isArray(data.rows)).toBe(true);
		expect(data.rows).toContainEqual(
			expect.objectContaining({
				_id: user._id.toString(),
				name: user.name,
				email: user.email,
			}),
		);
	});

	it("should get a single user", async () => {
		// Arrange
		const user = await createTestUser();

		// Act
		const response = await fetch(`${baseUrl}/users/${user._id}`);
		const data = await response.json();

		// Assert
		expect(response.status).toBe(200);
		expect(data).toEqual(
			expect.objectContaining({
				_id: user._id.toString(),
				name: user.name,
				email: user.email,
			}),
		);
	});

	it("should create a new user", async () => {
		// Arrange
		const userData = {
			name: faker.person.firstName(),
			email: faker.internet.email(),
			address: faker.location.streetAddress({ useFullAddress: true }),
		};

		// Act
		const response = await fetch(`${baseUrl}/users`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(userData),
		});
		const data = await response.json();

		// Assert
		expect(response.status).toBe(201);
		expect(data).toEqual(
			expect.objectContaining({
				name: userData.name,
				email: userData.email,
				address: userData.address,
			}),
		);
	});

	it("should update a user", async () => {
		// Arrange
		const user = await createTestUser();
		const updateData = {
			name: faker.person.firstName(),
		};

		// Act
		const response = await fetch(`${baseUrl}/users/${user._id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(updateData),
		});
		const data = await response.json();

		// Assert
		expect(response.status).toBe(200);
		expect(data).toEqual(
			expect.objectContaining({
				_id: user._id.toString(),
				name: updateData.name,
			}),
		);
	});

	it("should delete a user", async () => {
		// Arrange
		const user = await createTestUser();

		// Act
		const response = await fetch(`${baseUrl}/users/${user._id}`, {
			method: "DELETE",
		});

		// Assert
		expect(response.status).toBe(204);

		const getResponse = await fetch(`${baseUrl}/users/${user._id}`);
		expect(getResponse.status).toBe(404);
	});
});
