import { faker } from "@faker-js/faker";
import { describe, expect, it } from "bun:test";

import { UserModel } from "@/models";

import { createTestUser } from "@tests/setup";

describe("UserModel", () => {
	it("should create a user with valid data", async () => {
		const userData = {
			name: faker.person.firstName(),
			email: faker.internet.email(),
			address: faker.location.streetAddress({ useFullAddress: true }),
		};

		const user = await UserModel.create(userData);

		expect(user.name).toBe(userData.name);
		expect(user.email).toBe(userData.email);
		expect(user.address).toBe(userData.address);
	});

	it("should fail to create user without required fields", async () => {
		const invalidUserData = {
			name: faker.person.firstName(),
		};

		try {
			await UserModel.create(invalidUserData);
			throw new Error("Should not reach this point");
		} catch (error) {
			expect(error).toBeInstanceOf(Error);
		}
	});

	it("should update user data", async () => {
		const user = await createTestUser();
		const newName = faker.person.firstName();

		await UserModel.updateOne({ _id: user._id }, { name: newName });
		const updatedUser = await UserModel.findById(user._id);

		expect(updatedUser?.name).toBe(newName);
	});

	it("should delete user", async () => {
		const user = await createTestUser();

		await UserModel.deleteOne({ _id: user._id });
		const deletedUser = await UserModel.findById(user._id);

		expect(deletedUser).toBeNull();
	});
});
