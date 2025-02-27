import crypto from "crypto";

/**
 * Service responsible for API key generation, hashing, and verification
 * This class provides utilities for creating secure API keys and validating them
 */
export class ApiKeyService {
	/**
	 * Generates a secure random API key with high entropy
	 * Creates a 48-character random string in hexadecimal format
	 *
	 * @returns A new random API key string
	 *
	 * @example
	 * ```typescript
	 * const apiKey = ApiKeyService.generate();
	 * // => "8f7d56a1c9b3e24f8a7d56a1c9b3e24f8a7d56a1c9b3e24f"
	 * ```
	 */
	public static generate(): string {
		return crypto.randomBytes(24).toString("hex");
	}

	/**
	 * Hashes an API key using SHA-256 algorithm for secure storage
	 * Converts the API key to a fixed-length hash to store in the database
	 *
	 * @param key The plain text API key to hash
	 * @returns The hashed API key as a hex string
	 *
	 * @example
	 * ```typescript
	 * const hashedKey = ApiKeyService.hash("8f7d56a1c9b3e24f8a7d56a1c9b3e24f8a7d56a1c9b3e24f");
	 * ```
	 */
	public static hash(key: string): string {
		return crypto.createHash("sha256").update(key).digest("hex");
	}

	/**
	 * Verifies if a provided API key matches a stored hash
	 * Hashes the input key and compares it with the stored hash
	 *
	 * @param providedApiKey The API key to verify
	 * @param storedHashedApiKey The previously stored hashed API key
	 * @returns Boolean indicating if the keys match
	 *
	 * @example
	 * ```typescript
	 * const isValid = ApiKeyService.verify(requestKey, userStoredHashedKey);
	 * if (isValid) {
	 *   // Proceed with authenticated request
	 * }
	 * ```
	 */
	public static verify(providedApiKey: string, storedHashedApiKey: string): boolean {
		const hashedProvidedKey = this.hash(providedApiKey);
		return crypto.timingSafeEqual(
			Buffer.from(hashedProvidedKey, "hex"),
			Buffer.from(storedHashedApiKey, "hex"),
		);
	}
}
