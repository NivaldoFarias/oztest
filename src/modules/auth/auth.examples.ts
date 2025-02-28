import { faker } from "@faker-js/faker";

/** Example of an API key regeneration response */
export const regenerateApiKeyResponseExample = {
	apiKey: `api_${faker.string.alphanumeric(24)}`,
	message: "API key successfully regenerated",
};
