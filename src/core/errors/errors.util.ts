export const ERROR_CODES = {
	DATABASE_READ_ONLY: "DATABASE_READ_ONLY",
	USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
	INVALID_ADDRESS: "INVALID_ADDRESS",
	INVALID_COORDINATES: "INVALID_COORDINATES",
	INVALID_API_KEY: "INVALID_API_KEY",
	INVALID_REQUEST: "INVALID_REQUEST",
	INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
	SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
	NOT_FOUND: "NOT_FOUND",
	UNAUTHORIZED: "UNAUTHORIZED",
	CONFLICT: "CONFLICT",
	BAD_REQUEST: "BAD_REQUEST",
	FORBIDDEN: "FORBIDDEN",
	UNPROCESSABLE_ENTITY: "UNPROCESSABLE_ENTITY",
	PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
	REQUEST_TIMEOUT: "REQUEST_TIMEOUT",
	TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
} as const;

/**
 * Base application error class that all custom errors will extend.
 * Maintains compatibility with the error schema format used by the API.
 */
export class AppError extends Error {
	/**
	 * Creates a new AppError with standardized structure.
	 *
	 * @param message Human-readable error message
	 * @param statusCode HTTP status code
	 * @param code Error code
	 */
	constructor(
		message: string,
		public readonly statusCode: number,
		public readonly code: (typeof ERROR_CODES)[keyof typeof ERROR_CODES],
	) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Error thrown when a request contains invalid data.
 * Maps to 400 Bad Request responses.
 */
export class BadRequestError extends AppError {
	/**
	 * Creates a new BadRequestError.
	 *
	 * @param message Human-readable description of the bad request
	 */
	constructor(message = "Bad Request") {
		super(message, 400, ERROR_CODES.BAD_REQUEST);
	}
}

/**
 * Error thrown when a requested resource cannot be found.
 * Maps to 404 Not Found responses.
 */
export class NotFoundError extends AppError {
	/**
	 * Creates a new NotFoundError.
	 *
	 * @param message Human-readable description of the missing resource
	 */
	constructor(message = "Not Found") {
		super(message, 404, ERROR_CODES.NOT_FOUND);
	}
}

/**
 * Error thrown when authentication fails.
 * Maps to 401 Unauthorized responses.
 */
export class UnauthorizedError extends AppError {
	/**
	 * Creates a new UnauthorizedError.
	 *
	 * @param message Human-readable description of the authentication failure
	 */
	constructor(message = "Unauthorized") {
		super(message, 401, ERROR_CODES.UNAUTHORIZED);
	}
}

/**
 * Error thrown when there's a conflict with the current state of a resource.
 * Maps to 409 Conflict responses.
 */
export class ConflictError extends AppError {
	/**
	 * Creates a new ConflictError.
	 *
	 * @param message Human-readable description of the conflict
	 */
	constructor(message = "Conflict") {
		super(message, 409, ERROR_CODES.CONFLICT);
	}
}

/**
 * Error thrown when an internal server error occurs.
 * Maps to 500 Internal Server Error responses.
 */
export class InternalServerError extends AppError {
	/**
	 * Creates a new InternalServerError.
	 *
	 * @param message Human-readable description of the error (defaults to generic message)
	 */
	constructor(message = "Internal server error") {
		super(message, 500, ERROR_CODES.INTERNAL_SERVER_ERROR);
	}
}
