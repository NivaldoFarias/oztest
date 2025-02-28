# OZmap Geolocation API

A robust RESTful API for managing users and geographic regions with advanced geolocation capabilities.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
  - [Runtime & Build](#runtime--build)
  - [Framework & Libraries](#framework--libraries)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Project](#running-the-project)
  - [Development Workflow](#development-workflow)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Regions](#regions)
  - [Error Handling](#error-handling)
- [Database Seeding](#database-seeding)
  - [Seed Options](#seed-options)
  - [Seeding Process](#seeding-process)
  - [Running the Seeder](#running-the-seeder)
- [Project Structure](#project-structure)
- [Technical Decisions](#technical-decisions)
- [Testing](#testing)
- [Deployment](#deployment)
- [License](#license)

## Overview

This API was developed as part of the OZmap Technical Challenge, simulating a real-world scenario for managing users and geographic locations. It provides a comprehensive solution for geolocation-based services, allowing for user management and geographic region operations with API key authentication.

> [!NOTE]
> This project demonstrates best practices in RESTful API design, data validation, error handling, and MongoDB geospatial operations.

## Features

### User Management

- Complete CRUD operations for users
- Geocoding conversion between addresses and coordinates
- Intelligent handling of address/coordinate updates
- API key authentication system

### Geographic Regions

- Complete CRUD operations for regions
- Region definition using GeoJSON polygons
- Spatial queries to find regions containing specific points
- Distance-based region filtering
- User-specific region management

### API Design

- RESTful architecture
- OpenAPI documentation with schema validation
- Consistent error handling
- Pagination support
- Rate limiting for security

## Tech Stack

### Runtime & Build

- **Build Tool**: [Bun](https://bun.sh/) (for development and bundling)
- **Production Runtime**: Node.js 20+ (as required)
- **Package Manager**: [Bun](https://bun.sh/)

### Framework & Libraries

- **API Framework**: [Fastify](https://www.fastify.io/) with Zod type provider
- **Validation**: [Zod](https://zod.dev/) + [OpenAPI](https://github.com/asteasolutions/zod-to-openapi)
- **ORM**: [Typegoose](https://typegoose.com/) with Mongoose
- **Database**: [MongoDB](https://www.mongodb.com/) with geospatial capabilities
- **Documentation**: Scalar API Reference + Fastify Swagger
- **Testing**: Bun's test runner
- **Data Generation**: Faker.js for realistic test data

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose (for MongoDB container)
- Bun (optional, for development)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/ozmap-geo-api.git
cd ozmap-geo-api
```

2. Install dependencies:

```bash
# Using npm
npm install

# Or using Bun (recommended for development)
bun install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB container:

```bash
bun docker:up
```

### Running the Project

```bash
# Development mode with hot reloading
bun dev

# Seed the database with sample data
bun dev:seed

# Production build
bun build

# Run production build
bun start
```

### Development Workflow

1. Local development using Bun
2. Testing with Bun test runner
3. Building with Bun targeting Node.js
4. Production deployment running on Node.js 20+

## API Reference

> [!IMPORTANT]
> This API documentation is a simplified overview. The complete, interactive OpenAPI documentation is available at runtime through the `/docs` endpoint, providing detailed request/response schemas, examples, and playground functionality.

### Authentication

The API uses API key authentication. API keys are provided in the `X-API-KEY` header.

#### Regenerate API Key

```http
POST /auth/regenerate-key
```

Regenerates an API key for the authenticated user.

**Responses:**

| Status Code | Description           | Content                                             |
| ----------- | --------------------- | --------------------------------------------------- |
| `200`       | Success               | `{ "apiKey": "new-api-key", "message": "Success" }` |
| `401`       | Unauthorized          | Error message when API key is missing or invalid    |
| `500`       | Internal Server Error | Error message                                       |

### Users

#### Get Users

```http
GET /users?page=1&limit=10
```

Retrieves a paginated list of users.

**Query Parameters:**

| Parameter | Type     | Description                            |
| --------- | -------- | -------------------------------------- |
| `page`    | `number` | Page number (optional, default: 1)     |
| `limit`   | `number` | Items per page (optional, default: 10) |

**Responses:**

| Status Code | Description           | Content                                      |
| ----------- | --------------------- | -------------------------------------------- |
| `200`       | Success               | JSON array of users with pagination metadata |
| `204`       | No Content            | Empty response when no users are found       |
| `400`       | Bad Request           | Error message                                |
| `401`       | Unauthorized          | Error message when API key is invalid        |
| `500`       | Internal Server Error | Error message                                |

**Example Response (200):**

```json
{
	"rows": [
		{
			"_id": "60d21b4667d0d8992e610c85",
			"name": "John Doe",
			"email": "john@example.com",
			"address": "123 Main St, City",
			"coordinates": [-73.935242, 40.73061],
			"apiKeyHash": "hashed-api-key"
		}
	],
	"page": 1,
	"limit": 10,
	"total": 1
}
```

#### Get User by ID

```http
GET /users/:id
```

Retrieves a specific user by their ID.

**URL Parameters:**

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `id`      | `string` | User ID     |

**Responses:**

| Status Code | Description           | Content                               |
| ----------- | --------------------- | ------------------------------------- |
| `200`       | Success               | User object                           |
| `400`       | Bad Request           | Error message                         |
| `401`       | Unauthorized          | Error message when API key is invalid |
| `404`       | Not Found             | Error message when user doesn't exist |
| `500`       | Internal Server Error | Error message                         |

#### Create User

```http
POST /users
```

Creates a new user.

**Request Body:**

```json
{
	"name": "Jane Smith",
	"email": "jane@example.com",
	"address": "456 Park Ave, City"
}
```

> [!TIP]
> You must provide either `address` or `coordinates`, but not both. The API will automatically convert between them using a geocoding service.

**Responses:**

| Status Code | Description           | Content                               |
| ----------- | --------------------- | ------------------------------------- |
| `201`       | Created               | The created user object               |
| `400`       | Bad Request           | Error message                         |
| `401`       | Unauthorized          | Error message when API key is invalid |
| `500`       | Internal Server Error | Error message                         |

#### Update User

```http
PUT /users/:id
```

Updates an existing user.

**URL Parameters:**

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `id`      | `string` | User ID     |

**Request Body:**

```json
{
	"update": {
		"name": "Jane Smith Updated",
		"email": "jane.updated@example.com",
		"address": "789 New Address, City"
	}
}
```

> [!IMPORTANT]
> When updating location data, you must provide either `address` or `coordinates`, but not both. The API will automatically update the other field using a geocoding service.

**Responses:**

| Status Code | Description           | Content                               |
| ----------- | --------------------- | ------------------------------------- |
| `200`       | Success               | `{ "status": 200 }`                   |
| `400`       | Bad Request           | Error message                         |
| `401`       | Unauthorized          | Error message when API key is invalid |
| `404`       | Not Found             | Error message                         |
| `500`       | Internal Server Error | Error message                         |

#### Delete User

```http
DELETE /users/:id
```

Deletes a user by ID.

**URL Parameters:**

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `id`      | `string` | User ID     |

**Responses:**

| Status Code | Description           | Content                                                     |
| ----------- | --------------------- | ----------------------------------------------------------- |
| `200`       | Success               | `{ "status": 200, "message": "User deleted successfully" }` |
| `401`       | Unauthorized          | Error message when API key is invalid                       |
| `404`       | Not Found             | Error message                                               |
| `500`       | Internal Server Error | Error message                                               |

### Regions

#### Get Regions

```http
GET /regions?page=1&limit=10
```

Retrieves a paginated list of regions.

**Query Parameters:**

| Parameter | Type     | Description                            |
| --------- | -------- | -------------------------------------- |
| `page`    | `number` | Page number (optional, default: 1)     |
| `limit`   | `number` | Items per page (optional, default: 10) |

**Responses:**

| Status Code | Description           | Content                                        |
| ----------- | --------------------- | ---------------------------------------------- |
| `200`       | Success               | JSON array of regions with pagination metadata |
| `400`       | Bad Request           | Error message                                  |
| `401`       | Unauthorized          | Error message when API key is invalid          |
| `500`       | Internal Server Error | Error message                                  |

#### Get User Regions

```http
GET /users/:userId/regions?page=1&limit=10
```

Retrieves regions belonging to a specific user.

**URL Parameters:**

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `userId`  | `string` | User ID     |

**Query Parameters:**

| Parameter | Type     | Description                            |
| --------- | -------- | -------------------------------------- |
| `page`    | `number` | Page number (optional, default: 1)     |
| `limit`   | `number` | Items per page (optional, default: 10) |

**Responses:**

| Status Code | Description           | Content                                        |
| ----------- | --------------------- | ---------------------------------------------- |
| `200`       | Success               | JSON array of regions with pagination metadata |
| `400`       | Bad Request           | Error message                                  |
| `401`       | Unauthorized          | Error message when API key is invalid          |
| `500`       | Internal Server Error | Error message                                  |

#### Get Region by ID

```http
GET /regions/:id
```

Retrieves a specific region by ID.

**URL Parameters:**

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `id`      | `string` | Region ID   |

**Responses:**

| Status Code | Description           | Content                                 |
| ----------- | --------------------- | --------------------------------------- |
| `200`       | Success               | Region object                           |
| `400`       | Bad Request           | Error message                           |
| `401`       | Unauthorized          | Error message when API key is invalid   |
| `404`       | Not Found             | Error message when region doesn't exist |
| `500`       | Internal Server Error | Error message                           |

#### Create Region

```http
POST /regions
```

Creates a new region.

**Request Body:**

```json
{
	"name": "Downtown Area",
	"polygon": {
		"type": "Polygon",
		"coordinates": [
			[
				[-73.9876, 40.7661],
				[-73.9665, 40.7721],
				[-73.9598, 40.7614],
				[-73.971, 40.7477],
				[-73.9876, 40.7661]
			]
		]
	}
}
```

**Responses:**

| Status Code | Description           | Content                               |
| ----------- | --------------------- | ------------------------------------- |
| `201`       | Created               | The created region object             |
| `400`       | Bad Request           | Error message                         |
| `401`       | Unauthorized          | Error message when API key is invalid |
| `500`       | Internal Server Error | Error message                         |

#### Update Region

```http
PUT /regions/:id
```

Updates an existing region.

**URL Parameters:**

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `id`      | `string` | Region ID   |

**Request Body:**

```json
{
	"update": {
		"name": "Updated Downtown Area",
		"polygon": {
			"type": "Polygon",
			"coordinates": [
				[
					[-73.9876, 40.7661],
					[-73.9665, 40.7721],
					[-73.9598, 40.7614],
					[-73.971, 40.7477],
					[-73.9876, 40.7661]
				]
			]
		}
	}
}
```

**Responses:**

| Status Code | Description           | Content                               |
| ----------- | --------------------- | ------------------------------------- |
| `200`       | Success               | `{ "status": 200 }`                   |
| `400`       | Bad Request           | Error message                         |
| `401`       | Unauthorized          | Error message when API key is invalid |
| `404`       | Not Found             | Error message                         |
| `500`       | Internal Server Error | Error message                         |

#### Delete Region

```http
DELETE /regions/:id
```

Deletes a region by ID.

**URL Parameters:**

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `id`      | `string` | Region ID   |

**Responses:**

| Status Code | Description           | Content                                                       |
| ----------- | --------------------- | ------------------------------------------------------------- |
| `200`       | Success               | `{ "status": 200, "message": "Region deleted successfully" }` |
| `401`       | Unauthorized          | Error message when API key is invalid                         |
| `404`       | Not Found             | Error message                                                 |
| `500`       | Internal Server Error | Error message                                                 |

### Error Handling

All API endpoints return standardized error responses:

```json
{
	"statusCode": 400,
	"message": "Bad request"
}
```

## Database Seeding

The project includes a robust database seeding system for populating the database with realistic test data. This is particularly useful for development and testing environments.

### Seed Options

The seeding process can be customized with the following options:

| Option             | Type                           | Description                                                 | Default              |
| ------------------ | ------------------------------ | ----------------------------------------------------------- | -------------------- |
| `userCount`        | `number`                       | Number of users to create                                   | `10`                 |
| `regionsPerUser`   | `{ min: number, max: number }` | Range of regions to create per user                         | `{ min: 2, max: 4 }` |
| `citiesCount`      | `number`                       | Number of unique cities to generate for location data       | `50`                 |
| `templatesCount`   | `number`                       | Number of region name templates to generate                 | `20`                 |
| `useRealGeocoding` | `boolean`                      | Whether to use real geocoding service or generate mock data | `false`              |

### Seeding Process

The seeding process follows these steps:

1. **City Generation**: Creates a set of unique cities with addresses and coordinates

   - Uses real geocoding service if `useRealGeocoding` is enabled
   - Falls back to mock data generation if geocoding fails or is disabled

2. **Region Template Generation**: Creates templates for naming regions

   - Combines business, urban, and technology-related terms
   - Ensures unique and realistic district names

3. **User Creation**: Generates users with realistic data

   - Processes users in batches for efficiency
   - Each user has a name, email, address, and coordinates

4. **Region Creation**: Creates regions for each user
   - Generates GeoJSON polygons around user coordinates
   - Associates regions with their respective users
   - Number of regions per user is randomized within the specified range

### Running the Seeder

You can run the database seeder using the following commands:

```bash
# Development mode with hot reloading
bun dev:seed

# One-time seed
bun seed

# Build and seed
bun build:seed
```

The seeder can be customized by modifying the options in `src/scripts/seed.script.ts`:

```typescript
const seedOptions = {
	userCount: 10,
	regionsPerUser: { min: 1, max: 3 },
	citiesCount: 100,
	templatesCount: 30,
	useRealGeocoding: false,
};
```

## Project Structure

```
src/
├── api/                	# API configuration
│   ├── adapters/       	# Fastify plugin adapters
│   ├── middlewares/    	# Authentication and rate limiting
│   └── routes.ts       	# Route registration
├── core/               	# Core application components
│   ├── config/         	# Environment and configuration
│   ├── database/       	# MongoDB connection and seeding
│   ├── errors/         	# Error handling and schemas
│   ├── server/         	# Fastify server setup
│   └── utils/          	# Utility functions
├── modules/            	# Feature modules
│   ├── auth/           	# Authentication functionality
│   ├── regions/        	# Region management
│   └── users/          	# User management
├── scripts/            	# Utility scripts
│   ├── build.script.ts 	# Build script
│   ├── seed.script.ts  	# Database seeding
│   └── server.script.ts	# Server startup
└── shared/             	# Shared resources
    ├── models/         	# Shared data models
    └── schemas/        	# Shared validation schemas
```

## Technical Decisions

1. **Using Bun as build tool** while targeting Node.js runtime for production provides optimal development experience with fast TypeScript compilation
2. **Choosing Fastify over Express** for better TypeScript support, schema validation, and superior performance
3. **Implementing OpenAPI with Zod** for runtime type validation and automatic documentation generation
4. **API Key Authentication** for secure access to endpoints
5. **Rate Limiting** to prevent abuse of authentication endpoints
6. **Modular Architecture** with feature-based organization for better maintainability
7. **Typegoose with MongoDB** for type-safe database interactions with geospatial capabilities
8. **Error Handling** with standardized error responses and logging
9. **Batch Processing** for efficient database seeding of large datasets
10. **Geocoding Integration** with fallback mechanisms for reliable location data

## Testing

The project includes both unit and integration tests:

```bash
# Run tests
bun test

# Run tests with coverage
bun test --coverage
```

## Deployment

This application is designed to be deployed in containerized environments:

```bash
# Build Docker image
docker build -t ozmap-geo-api .

# Run container
docker run -p 3000:3000 -e NODE_ENV=production ozmap-geo-api
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
