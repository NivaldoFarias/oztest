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
- [CI/CD](#cicd)
  - [GitHub Workflows](#github-workflows)
  - [Required Secrets](#required-secrets)
  - [Manual Deployment](#manual-deployment)
- [Requirements Checklist](#requirements-checklist)
- [Next Steps](#next-steps)
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

## CI/CD

This project uses GitHub Actions for continuous integration and deployment.

### GitHub Workflows

#### CI Workflow

The CI workflow runs on every push to the `main` and `develop` branches, as well as on pull requests to these branches. It performs the following tasks:

1. **Test**: Runs linting and tests against the codebase with a MongoDB service container
2. **Build**: Builds the server and seed scripts and uploads the artifacts

#### CD Workflow

The CD workflow runs on pushes to the `main` branch and can also be triggered manually via the GitHub Actions UI. It performs the following tasks:

1. **Deploy**:

   - Builds and pushes a Docker image to GitHub Container Registry
   - Deploys the application to a server using SSH
   - Sets up the application with Docker Compose

2. **Seed** (Optional, manual trigger only):
   - Seeds the database with initial data

### Required Secrets

To use these workflows, you need to set up the following secrets in your GitHub repository:

- `SSH_HOST`: The hostname or IP address of your deployment server
- `SSH_USERNAME`: The username to use for SSH authentication
- `SSH_PRIVATE_KEY`: The private SSH key for authentication

### Manual Deployment

To manually trigger a deployment:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "CD" workflow
3. Click "Run workflow"
4. Choose the branch to deploy from
5. Toggle "Seed Database" if you want to seed the database after deployment
6. Click "Run workflow"

For more details, see the [GitHub Workflows README](.github/workflows/README.md).

## Requirements Checklist

This section tracks the implementation status of all requirements specified in the OZmap challenge:

### Technical Requirements

- [x] Node.js 20+ compatibility
- [x] MongoDB 7+ database
- [x] Mongoose/Typegoose ORM
- [x] TypeScript implementation
- [x] ESLint + Prettier for formatting and linting
- [x] MongoDB communication via container

### User Management

- [x] Complete CRUD operations for users
- [x] User model with name, email, address, and coordinates
- [x] Validation to ensure user provides either address OR coordinates (not both, not neither)
- [x] Geocoding service integration for address ↔ coordinates conversion
- [x] Proper handling of address/coordinate updates

### Region Management

- [x] Complete CRUD operations for regions
- [x] Region definition using GeoJSON polygons
- [x] Region ownership by users
- [x] Endpoint to list regions containing a specific point
- [x] Endpoint to list regions within a certain distance of a point
- [x] Filtering regions by user ownership

### Additional Features

- [x] API key authentication (beyond the basic requirement)
- [x] Complete API documentation
- [ ] Internationalization
- [ ] Basic user interface
- [x] Code organization and clarity
- [x] Efficient project structure
- [x] Standardized error handling
- [x] Organized commit history
- [x] Logging implementation
- [x] RESTful API best practices
- [x] MongoDB session utilization

### Extra Implemented Features

- [x] **Advanced API Documentation**: Integration with Scalar API Reference for interactive documentation
- [x] **OpenAPI Specification**: Auto-generated from Zod schemas for perfect schema/validation alignment
- [x] **Rate Limiting**: Protection against abuse with configurable limits per endpoint
- [x] **CORS Configuration**: Secure cross-origin resource sharing with environment-based configuration
- [x] **Pagination System**: Sophisticated pagination with metadata for all list endpoints
- [x] **Error Handling Framework**: Centralized error handling with consistent response format
- [x] **Environment Validation**: Runtime validation of environment variables with sensible defaults
- [x] **API Key Regeneration**: Endpoint to regenerate API keys for enhanced security
- [x] **Modular Architecture**: Feature-based organization with clear separation of concerns
- [x] **Database Seeding System**: Sophisticated seeding with realistic data generation
- [x] **Docker Compose Setup**: Complete containerization for development and production
- [x] **Comprehensive JSDoc Documentation**: Detailed code documentation with examples
- [x] **Type Safety**: End-to-end type safety with Zod validation and TypeScript

## Next Steps

If this project were to be continued, the following enhancements would be prioritized:

1. **Complete Test Suite**: Implement comprehensive unit and integration tests to achieve high code coverage.

2. **CI/CD Pipeline Finalization**: Complete the setup of GitHub Actions workflows for automated testing, building, and deployment.

3. **Internationalization**: Add multi-language support for error messages and API responses using i18n libraries.

4. **User Interface Development**: Create a basic frontend application to interact with the API, focusing on:

   - User management interface
   - Map visualization for regions
   - Region creation/editing with interactive polygon drawing

5. **Performance Optimization**:

   - Implement caching strategies for frequently accessed data
   - Optimize database queries for large datasets
   - Add database indexing for geospatial queries

6. **Enhanced Security**:

   - Implement JWT authentication with refresh tokens
   - Add role-based access control
   - Set up API rate limiting for all endpoints

7. **Advanced Geospatial Features**:

   - Region intersection and union operations
   - Proximity alerts for users entering/exiting regions
   - Historical location tracking and analysis

8. **Monitoring and Analytics**:

   - Set up application monitoring with tools like Prometheus and Grafana
   - Implement usage analytics for API endpoints
   - Create dashboards for system health and performance

9. **Documentation Expansion**:

   - Add detailed implementation guides for developers
   - Create tutorials for common use cases
   - Document database schema and relationships

10. **Scalability Improvements**:
    - Implement horizontal scaling capabilities
    - Set up database sharding for large datasets
    - Optimize for cloud deployment with Kubernetes

These next steps would transform the current implementation into a production-ready, scalable geolocation platform suitable for enterprise use.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
