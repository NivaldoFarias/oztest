import type {
	CreateUserBody,
	CreateUserResponse,
	DeleteUserResponse,
	GetUsersResponse,
	RegenerateApiKeyResponse,
	UpdateUserBody,
	User,
} from "../user.schema";

/**
 * Example user data that matches the User schema
 * Used for documentation, testing, and development
 */
export const userExample = {
	_id: "1234567890",
	name: "John Doe",
	email: "john.doe@example.com",
	address: "123 Main St, Anytown, USA",
	coordinates: [123.456, 78.91] as [number, number],
	regions: ["north", "central"],
};

/** Example of a user with coordinates instead of address */
export const userWithCoordinatesExample = {
	_id: "0987654321",
	name: "Jane Smith",
	email: "jane.smith@example.com",
	address: "456 Oak Ave, Somewhere, USA",
	coordinates: [-74.006, 40.7128] as [number, number],
	regions: ["east", "south"],
};

/** Example of a paginated users response */
export const getUsersResponseExample = {
	rows: [userExample, userWithCoordinatesExample],
	page: 1,
	limit: 10,
	total: 2,
};

/** Example of a user update body with address */
export const updateUserBodyWithAddressExample = {
	update: {
		name: "John Doe Updated",
		email: "john.updated@example.com",
		address: "456 New Address St, Newtown, USA",
	},
};

/** Example of a user update body with coordinates */
export const updateUserBodyWithCoordinatesExample = {
	update: {
		name: "John Doe Updated",
		email: "john.updated@example.com",
		coordinates: [-122.419, 37.774] as [number, number],
	},
};

export const updateUserResponseExample = {
	status: 200,
};

/** Example of a create user body with address */
export const createUserBodyWithAddressExample = {
	name: "New User",
	email: "new.user@example.com",
	address: "789 New User St, Newville, USA",
};

/** Example of a create user body with coordinates */
export const createUserBodyWithCoordinatesExample = {
	name: "New User",
	email: "new.user@example.com",
	coordinates: [-0.1278, 51.5074] as [number, number],
};

/** Example of a delete user response */
export const deleteUserResponseExample = {
	status: 200,
	message: "User successfully deleted",
};

/** Example of a create user response */
export const createUserResponseExample = {
	user: userExample,
	apiKey: "api_key_example_12345abcdef",
};

/** Example of an API key regeneration response */
export const regenerateApiKeyResponseExample = {
	apiKey: "new_api_key_example_67890ghijkl",
	message: "API key successfully regenerated",
};
