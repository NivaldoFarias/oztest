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

/**
 * Constants for region templates.
 * These constants provide a centralized way to manage region templates.
 */
export const REGION_TEMPLATES = {
	PREFIXES: [
		"Downtown",
		"Central",
		"North",
		"South",
		"East",
		"West",
		"Modern",
		"Historic",
		"Urban",
		"Metropolitan",
	],
	SUFFIXES: [
		"District",
		"Quarter",
		"Hub",
		"Zone",
		"Park",
		"Center",
		"Area",
		"Complex",
		"Corridor",
		"Square",
	],
	SPECIALTIES: [
		"Business",
		"Tech",
		"Cultural",
		"Innovation",
		"Financial",
		"Commercial",
		"Industrial",
		"Residential",
		"Entertainment",
		"Research",
	],
};

/** Routes that are public and don't require authentication */
export const PUBLIC_ROUTES = ["/docs", "/users"];

export type Status = (typeof STATUS)[keyof typeof STATUS];
export type RegionTemplate = (typeof REGION_TEMPLATES)[keyof typeof REGION_TEMPLATES];
