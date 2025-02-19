/**
 * HTTP status codes used throughout the application.
 * These constants provide a centralized way to manage response status codes.
 */
export const STATUS = {
	OK: 200,
	CREATED: 201,
	UPDATED: 201,
	NOT_FOUND: 404,
	BAD_REQUEST: 400,
	INTERNAL_SERVER_ERROR: 500,
	DEFAULT_ERROR: 418,
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];
