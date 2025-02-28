import { faker } from "@faker-js/faker";

/**
 * Generates consistent user data using Faker
 *
 * @param seed Optional seed to ensure consistent generation
 * @returns A user object with consistent properties
 */
const generateUser = (seed?: number) => {
	if (seed !== undefined) faker.seed(seed);

	const userId = faker.string.alphanumeric(10);
	const userName = faker.person.fullName();
	const userEmail = faker.internet.email({
		firstName: userName.split(" ")[0],
		lastName: userName.split(" ")[1],
	});
	const userAddress = faker.location.streetAddress({ useFullAddress: true });
	const userCoordinates: [number, number] = [
		faker.location.longitude({ precision: 6 }),
		faker.location.latitude({ precision: 6 }),
	];
	const userRegions = [
		faker.location.county().toLowerCase(),
		faker.location.county().toLowerCase(),
	];

	return {
		_id: userId,
		name: userName,
		email: userEmail,
		address: userAddress,
		coordinates: userCoordinates,
		regions: userRegions,
	};
};

/**
 * Example user data that matches the User schema
 * Used for documentation, testing, and development
 */
export const userExample = generateUser(1);

/** Example of a user with coordinates instead of address */
export const userWithCoordinatesExample = generateUser(2);

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
		name: `${userExample.name} Updated`,
		email: faker.internet.email({ firstName: userExample.name.split(" ")[0], lastName: "Updated" }),
		address: faker.location.streetAddress({ useFullAddress: true }),
	},
};

/** Example of a user update body with coordinates */
export const updateUserBodyWithCoordinatesExample = {
	update: {
		name: `${userExample.name} Updated`,
		email: faker.internet.email({ firstName: userExample.name.split(" ")[0], lastName: "Updated" }),
		coordinates: [
			faker.location.longitude({ precision: 6 }),
			faker.location.latitude({ precision: 6 }),
		] as [number, number],
	},
};

export const updateUserResponseExample = {
	status: 200,
};

/** Example of a create user body with address */
export const createUserBodyWithAddressExample = {
	name: faker.person.fullName(),
	email: faker.internet.email(),
	address: faker.location.streetAddress({ useFullAddress: true }),
};

/** Example of a create user body with coordinates */
export const createUserBodyWithCoordinatesExample = {
	name: faker.person.fullName(),
	email: faker.internet.email(),
	coordinates: [
		faker.location.longitude({ precision: 6 }),
		faker.location.latitude({ precision: 6 }),
	] as [number, number],
};

/** Example of a delete user response */
export const deleteUserResponseExample = {
	status: 200,
	message: "User successfully deleted",
};

/** Example of a create user response */
export const createUserResponseExample = {
	user: {
		...userExample,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	apiKey: `api_${faker.string.alphanumeric(24)}`,
};
