import { z } from "zod";

/**
 * Environment configuration schema for runtime validation.
 * Uses Zod for type checking and validation of environment variables.
 *
 * ## Required Variables
 * - Server configuration (port, environment)
 * - MongoDB connection settings
 * - CORS configuration
 * - Rate limiting settings
 * - Optional: Geocoding service configuration
 */
const envSchema = z.object({
	PORT: z.coerce.number().positive().default(3003),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

	// MongoDB Configuration
	MONGO_URI: z.string().url("Invalid MongoDB connection string"),

	// Optional Geocoding Service
	GEOCODING_API_KEY: z.string().optional().default(""),

	// Logging Configuration
	LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("debug"),

	// CORS Configuration
	CORS_ORIGIN: z.string().url().default("http://localhost:3000"),
	CORS_METHODS: z.string().default("GET,POST,PUT,DELETE,OPTIONS"),
	CORS_CREDENTIALS: z.coerce.boolean().default(true),

	// Rate Limiting
	RATE_LIMIT_MAX: z.coerce.number().positive().default(100),
	RATE_LIMIT_WINDOW: z.coerce.number().positive().default(60_000),

	// Seed Configuration
	SEED_CONFIG_PATH: z.string().default(""),
});

/**
 * Type definition for the environment configuration.
 * Inferred from the Zod schema to ensure type safety.
 */
export type Environment = z.infer<typeof envSchema>;

/**
 * Validates all environment variables against the defined schema.
 * Performs runtime checks to ensure all required variables are present and correctly typed.
 *
 * ## Workflow
 * 1. Parses environment variables using Bun's `import.meta.env`
 * 2. Validates against the Zod schema
 * 3. Returns typed environment object
 *
 * @throws {Error} Detailed validation errors if environment variables are invalid
 *
 * @example
 * ```typescript
 * const env = validateEnv();
 * console.log(env.MONGO_URI); // Typed access to environment variables
 * ```
 */
export function validateEnv() {
	try {
		const env = envSchema.parse(import.meta.env);

		Object.assign(import.meta.env, env);

		return env;
	} catch (error) {
		if (error instanceof z.ZodError) {
			const issues = error.issues
				.map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
				.join("\n");
			throw new Error(`❌ Invalid environment variables:\n${issues}`);
		}
		throw error;
	}
}

/**
 * Validated environment configuration object.
 * Ensures all required variables are present and correctly typed.
 *
 * @see {@link validateEnv}
 */
export const env = validateEnv();
