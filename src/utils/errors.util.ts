import { createBadRequestError, createErrorResponse } from "@/schemas/error.schema";

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
		public readonly code: string,
	) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}

	/**
	 * Converts the error to a response object matching the API's error schema.
	 *
	 * @returns Standardized error response object
	 */
	public toResponse() {
		return createErrorResponse(this.statusCode, this.code, this.message);
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
	constructor(message: string) {
		super(message, 400, "Bad Request");
	}

	/**
	 * Creates a response object using the standard bad request format.
	 *
	 * @returns Bad request error response object
	 */
	public toResponse() {
		return createBadRequestError(this.message);
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
	constructor(message: string) {
		super(message, 404, "Not Found");
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
	constructor(message: string) {
		super(message, 401, "Unauthorized");
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
	constructor(message: string) {
		super(message, 409, "Conflict");
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
	constructor(message: string = "Internal server error") {
		super(message, 500, "Internal Server Error");
	}
}
