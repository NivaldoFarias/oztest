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
  - [Users](#users)
  - [Regions](#regions)
  - [Error Handling](#error-handling)
- [Project Structure](#project-structure)
- [Technical Decisions](#technical-decisions)
- [Testing](#testing)
- [Deployment](#deployment)
- [Additional Features](#additional-features)
- [License](#license)

## Overview

This API was developed as part of the OZmap Technical Challenge, simulating a real-world scenario for managing users and geographic locations. It provides a comprehensive solution for geolocation-based services, allowing for user management and geographic region operations.

> **Note:** This project demonstrates best practices in RESTful API design, data validation, error handling, and MongoDB geospatial operations.

## Features

### User Management

- Complete CRUD operations for users
- Geocoding conversion between addresses and coordinates
- Intelligent handling of address/coordinate updates

### Geographic Regions

- Complete CRUD operations for regions
- Region definition using GeoJSON polygons
- Spatial queries to find regions containing specific points
- Distance-based region filtering

### API Design

- RESTful architecture
- OpenAPI documentation with schema validation
- Consistent error handling
- Pagination support

## Tech Stack

### Runtime & Build

- **Build Tool**: [Bun](https://bun.sh/) (for development and bundling)
- **Production Runtime**: Node.js 20+ (as required)
- **Package Manager**: [Bun](https://bun.sh/)

### Framework & Libraries

- **API Framework**: [Fastify](https://www.fastify.io/) _(chosen for performance and TypeScript support)_
- **Validation**: [Zod](https://zod.dev/) + [OpenAPI](https://github.com/asteasolutions/zod-to-openapi)
- **ORM**: [Typegoose](https://typegoose.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with geospatial capabilities
- **Testing**: Bun's test runner with [Vitest](https://vitest.dev/)

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
docker-compose up -d
```

### Running the Project

```bash
# Development mode with hot reloading
bun dev

# Production build
bun build

# Run production build
node dist/index.js
```

### Development Workflow

1. Local development using Bun
2. Testing with Bun test runner
3. Building with Bun targeting Node.js
4. Production deployment running on Node.js 20+

## API Reference

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
			"regions": ["60d21b4667d0d8992e610c86"]
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
| `404`       | Not Found             | Error message when user doesn't exist |
| `500`       | Internal Server Error | Error message                         |

**Example Response (200):**

```json
{
	"_id": "60d21b4667d0d8992e610c85",
	"name": "John Doe",
	"email": "john@example.com",
	"address": "123 Main St, City",
	"coordinates": [-73.935242, 40.73061],
	"regions": ["60d21b4667d0d8992e610c86"]
}
```

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

> **Note:** You must provide either `address` or `coordinates`, but not both. The API will automatically convert between them using a geocoding service.

**Responses:**

| Status Code | Description           | Content                 |
| ----------- | --------------------- | ----------------------- |
| `201`       | Created               | The created user object |
| `400`       | Bad Request           | Error message           |
| `500`       | Internal Server Error | Error message           |

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

> **Note:** When updating location data, you must provide either `address` or `coordinates`, but not both. The API will automatically update the other field using a geocoding service.

**Responses:**

| Status Code | Description           | Content             |
| ----------- | --------------------- | ------------------- |
| `200`       | Success               | `{ "status": 200 }` |
| `404`       | Not Found             | Error message       |
| `500`       | Internal Server Error | Error message       |

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
| `404`       | Not Found             | Error message                                               |
| `500`       | Internal Server Error | Error message                                               |

### Regions

> **Note:** Regions API documentation will be implemented in the next phase.

### Error Handling

All API endpoints return standardized error responses:

```json
{
	"statusCode": 400,
	"message": "Bad request"
}
```

## Project Structure

```
src/
├── api/
│   ├── adapters/      # Route adapters and handlers
│   └── controllers/   # Business logic controllers
├── config/            # Configuration files
├── database/          # Database connection and utilities
├── models/            # Typegoose models
├── schemas/           # Zod validation schemas
├── scripts/           # Utility scripts
└── utils/             # Helper functions
```

## Technical Decisions

1. **Using Bun as build tool** while targeting Node.js runtime for production provides optimal development experience with fast TypeScript compilation
2. **Choosing Fastify over Express** for better TypeScript support, schema validation, and superior performance
3. **Implementing OpenAPI with Zod** for runtime type validation and automatic documentation generation
4. **Separating route adapters from business logic** for better testability and separation of concerns
5. **Using Typegoose** for type-safe MongoDB interactions
6. **Google Maps geocoding service implementation** for robust and reliable conversion between addresses and coordinates, leveraging the power and accuracy of Google's geolocation data
7. **Schema validation refinements** to enforce business rules such as providing either address or coordinates

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

## Additional Features

- [ ] Authentication
- [x] API Documentation
- [ ] Internationalization
- [ ] Code Coverage
- [ ] User Interface

## License

This project is licensed under the MIT License - see the LICENSE file for details.
