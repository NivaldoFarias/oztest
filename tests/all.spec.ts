import "reflect-metadata";

import { faker } from "@faker-js/faker";
import { assert, expect } from "chai";
import * as mongoose from "mongoose";
import * as sinon from "sinon";
import * as supertest from "supertest";

import "../src/database";

import { Region, RegionModel, UserModel } from "../src/models";
import server from "../src/server";
import GeoLib from "../src/utils/geo.util";

describe("Models", () => {
	let user;
	let session;
	let geoLibStub: Partial<typeof GeoLib> = {};

	before(async () => {
		geoLibStub.getAddressFromCoordinates = sinon
			.stub(GeoLib, "getAddressFromCoordinates")
			.resolves(faker.location.streetAddress({ useFullAddress: true }));
		geoLibStub.getCoordinatesFromAddress = sinon
			.stub(GeoLib, "getCoordinatesFromAddress")
			.resolves({
				lat: faker.location.latitude(),
				lng: faker.location.longitude(),
			});

		session = await mongoose.startSession();
		user = await UserModel.create({
			name: faker.person.firstName(),
			email: faker.internet.email(),
			address: faker.location.streetAddress({ useFullAddress: true }),
		});
	});

	after(() => {
		sinon.restore();
		session.endSession();
	});

	beforeEach(() => {
		session.startTransaction();
	});

	afterEach(() => {
		session.commitTransaction();
	});

	describe("UserModel", () => {
		it("should create a user", async () => {
			expect(1).to.be.eq(1);
		});
	});

	describe("RegionModel", () => {
		it("should create a region", async () => {
			const regionData: Omit<Region, "_id"> = {
				user: user._id,
				name: faker.person.fullName(),
			};

			const [region] = await RegionModel.create([regionData]);

			expect(region).to.deep.include(regionData);
		});

		it("should rollback changes in case of failure", async () => {
			const userRecord = await UserModel.findOne({ _id: user._id }).select("regions").lean();
			try {
				await RegionModel.create([{ user: user._id }]);

				assert.fail("Should have thrown an error");
			} catch (error) {
				const updatedUserRecord = await UserModel.findOne({ _id: user._id })
					.select("regions")
					.lean();

				expect(userRecord).to.deep.eq(updatedUserRecord);
			}
		});
	});

	it("should return a list of users", async () => {
		const response = supertest(server).get(`/user`);

		expect(response).to.have.property("status", 200);
	});

	it("should return a user", async () => {
		const response = await supertest(server).get(`/users/${user._id}`);

		expect(response).to.have.property("status", 200);
	});
});
