# GitHub Workflows for OZMap

This directory contains GitHub Actions workflows for continuous integration and deployment of the OZMap application.

## Workflows

### CI Workflow (`ci.yml`)

The CI workflow runs on every push to the `main` and `develop` branches, as well as on pull requests to these branches. It performs the following tasks:

1. **Test**: Runs linting and tests against the codebase with a MongoDB service container
2. **Build**: Builds the server and seed scripts and uploads the artifacts

### CD Workflow (`cd.yml`)

The CD workflow runs on pushes to the `main` branch and can also be triggered manually via the GitHub Actions UI. It performs the following tasks:

1. **Deploy**:

   - Builds and pushes a Docker image to GitHub Container Registry
   - Deploys the application to a server using SSH
   - Sets up the application with Docker Compose

2. **Seed** (Optional, manual trigger only):
   - Seeds the database with initial data

## Required Secrets

To use these workflows, you need to set up the following secrets in your GitHub repository:

- `SSH_HOST`: The hostname or IP address of your deployment server
- `SSH_USERNAME`: The username to use for SSH authentication
- `SSH_PRIVATE_KEY`: The private SSH key for authentication

## Manual Deployment

To manually trigger a deployment:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "CD" workflow
3. Click "Run workflow"
4. Choose the branch to deploy from
5. Toggle "Seed Database" if you want to seed the database after deployment
6. Click "Run workflow"

## Local Development

For local development, you can use the following commands:

```bash
# Start MongoDB
bun run docker:up

# Start the development server
bun run dev

# Seed the database
bun run dev:seed

# Stop MongoDB
bun run docker:down
```

## Production Deployment

The production deployment uses Docker Compose to run both the application and MongoDB. The application image is built and pushed to GitHub Container Registry during the CD workflow.

The deployment server should have Docker and Docker Compose installed.
