import { faker } from "@faker-js/faker";
import { describe, expect, it } from "bun:test";

import { RegionModel } from "@/modules/regions/region.model";

import { createTestUser } from "@tests/setup";

describe("RegionModel", () => {
	it("should create a region with valid data", async () => {
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
					] as [number, number][],
				],
			},
		};

		const region = await RegionModel.create(regionData);

		expect(region.name).toBe(regionData.name);
		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		expect(region.user.toString()).toBe(user._id.toString());
		expect(region.geometry.type).toBe(regionData.geometry.type);
		expect(region.geometry.coordinates).toEqual(regionData.geometry.coordinates);
	});

	it("should fail to create region without required fields", async () => {
		const user = await createTestUser();
		const invalidRegionData = {
			user: user._id,
		};

		try {
			await RegionModel.create(invalidRegionData);
			throw new Error("Should not reach this point");
		} catch (error) {
			expect(error).toBeInstanceOf(Error);
		}
	});

	it("should update region data", async () => {
		const user = await createTestUser();
		const region = await RegionModel.create({
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
		});
		const newName = faker.location.city();

		await RegionModel.updateOne({ _id: region._id }, { name: newName });
		const updatedRegion = await RegionModel.findById(region._id);

		expect(updatedRegion?.name).toBe(newName);
	});

	it("should delete region", async () => {
		const user = await createTestUser();
		const region = await RegionModel.create({
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
		});

		await RegionModel.deleteOne({ _id: region._id });
		const deletedRegion = await RegionModel.findById(region._id);

		expect(deletedRegion).toBeNull();
	});
});
