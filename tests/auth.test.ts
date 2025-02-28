import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import Fastify from "fastify";

import type { FastifyInstance } from "fastify";

import { UserModel } from "@/modules/users/user.model";

import { createAuthMiddleware } from "../src/api/middlewares/auth.middleware";
import { ApiKeyUtil } from "../src/core/utils/api-key.util";

describe("Authentication System", () => {
	describe("ApiKeyService", () => {
		test("generates secure API keys", () => {
			const apiKey = ApiKeyUtil.generate();
			expect(apiKey).toBeString();
			expect(apiKey.length).toBeGreaterThanOrEqual(32);
		});

		test("hashes API keys consistently", () => {
			const apiKey = "test-api-key";
			const hash1 = ApiKeyUtil.hash(apiKey);
			const hash2 = ApiKeyUtil.hash(apiKey);

			expect(hash1).toEqual(hash2);
			expect(hash1).not.toEqual(apiKey);
		});

		test("verifies API keys correctly", () => {
			const apiKey = ApiKeyUtil.generate();
			const hashedKey = ApiKeyUtil.hash(apiKey);

			expect(ApiKeyUtil.verify(apiKey, hashedKey)).toBeTrue();
			expect(ApiKeyUtil.verify("wrong-key", hashedKey)).toBeFalse();
		});
	});

	describe("Authentication Middleware", () => {
		let app: FastifyInstance;
		let testApiKey: string;
		let hashedApiKey: string;
		let user: any;

		beforeAll(async () => {
			// Set up a test Fastify instance
			app = Fastify();

			// Add test route
			app.get("/protected", (req, reply) => {
				return { user: req.user, message: "Authenticated" };
			});

			app.get("/public", (req, reply) => {
				return { message: "Public route" };
			});

			// Register auth middleware
			const authMiddleware = createAuthMiddleware(app, {
				publicRoutes: ["/public"],
			});

			app.addHook("onRequest", authMiddleware);

			// Create test user with API key
			testApiKey = ApiKeyUtil.generate();
			hashedApiKey = ApiKeyUtil.hash(testApiKey);

			// Mock UserModel and find method
			UserModel.find = async () => {
				user = {
					_id: "test-user-id",
					name: "Test User",
					email: "test@example.com",
					apiKeyHash: hashedApiKey,
				};
				return [user];
			};

			await app.ready();
		});

		afterAll(async () => {
			await app.close();
		});

		test("allows access to protected routes with valid API key", async () => {
			const response = await app.inject({
				method: "GET",
				url: "/protected",
				headers: {
					"X-API-Key": testApiKey,
				},
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.message).toBe("Authenticated");
			expect(body.user).toBeTruthy();
		});

		test("rejects access to protected routes without API key", async () => {
			const response = await app.inject({
				method: "GET",
				url: "/protected",
			});

			expect(response.statusCode).toBe(401);
			const body = JSON.parse(response.body);
			expect(body.message).toInclude("API key is missing");
		});

		test("rejects access to protected routes with invalid API key", async () => {
			const response = await app.inject({
				method: "GET",
				url: "/protected",
				headers: {
					"X-API-Key": "invalid-key",
				},
			});

			expect(response.statusCode).toBe(401);
			const body = JSON.parse(response.body);
			expect(body.message).toInclude("Invalid API key");
		});

		test("allows access to public routes without authentication", async () => {
			const response = await app.inject({
				method: "GET",
				url: "/public",
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.message).toBe("Public route");
		});
	});
});
