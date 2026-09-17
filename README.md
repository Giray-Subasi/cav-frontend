# C.A.V Frontend

Frontend application for the C.A.V eSIM Management System.

This React application provides authentication, role-based eSIM profile management, filtering, sorting, pagination, and profile lifecycle operations.

The project is intended to be demonstrated locally as part of a full-stack portfolio project. Public internet deployment is not currently required.

## Technology Stack

- React
- Vite
- JavaScript
- React Router
- JWT authentication
- CSS
- Nginx
- Docker
- GitHub Actions

## Features

- Login with JWT authentication
- Protected routes
- USER and ADMIN role support
- Profile listing and detail pages
- Filtering by status and operator
- Sorting and pagination
- ADMIN profile creation, editing, and deletion
- Profile lifecycle actions:
  - Start Download
  - Complete Download
  - Enable
- Responsive interface
- Docker build with Nginx

## User Roles

### USER

Users can log in, view profiles, filter and sort results, navigate between pages, and view profile details.

### ADMIN

Administrators can additionally create, edit, and delete profiles and manage their lifecycle states.

Newly registered accounts receive the `USER` role by default.

## Architecture

```text
Browser
   |
   v
React Frontend / Nginx
   |
   | /api requests
   v
Spring Boot REST API
   |
   v
PostgreSQL
```

In the Docker setup, Nginx forwards requests beginning with `/api/` to the backend container.

For example:

```text
Browser:  /api/profiles
Backend:  /profiles
```

This avoids embedding a machine-specific backend hostname in the Docker frontend build.

## Local Development

### Prerequisites

Install Node.js and npm. The project uses Node.js 24 in its Docker build and GitHub Actions workflow.

The backend must also be running.

### Install dependencies

From the frontend project directory:

```bash
npm ci
```

### Configure the development API address

Create a `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

This address is used when running the frontend directly through the Vite development server.

**Do not use `/api` for the standalone Vite development server unless you also configure a Vite proxy.** The `/api` reverse proxy described in this README belongs to the Docker/Nginx setup.

### Start the development server

```bash
npm run dev
```

Vite displays the frontend's local address in the terminal. Its usual address is:

```text
http://localhost:5173
```

If Docker is already using port 5173, stop the Docker frontend or use another available port for the Vite development server.

## Frontend Checks

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

The generated files are stored in `dist/`.

## Running the Complete Application with Docker

The recommended way to demonstrate the project is through the Docker Compose configuration in the backend repository.

Place both repositories next to each other using the folder structure expected by the backend's `compose.yaml`.

From the backend directory containing `compose.yaml`:

```bash
docker compose up -d --build
docker compose ps
```

Open:

```text
http://localhost:5173
```

The Compose configuration builds the frontend with:

```text
VITE_API_BASE_URL=/api
```

The frontend Docker image contains an Nginx configuration that forwards `/api/` requests to the backend service.

For initial setup, environment variables, and PostgreSQL volume instructions, see the backend README.

## Running the Published Docker Images

The backend repository also contains `compose.deploy.yaml`.

This configuration downloads the published backend and frontend Docker images from GitHub Container Registry instead of building them from source.

From the backend directory:

```bash
docker compose -f compose.deploy.yaml pull
docker compose -f compose.deploy.yaml up -d
docker compose -f compose.deploy.yaml ps
```

Open:

```text
http://localhost:5174
```

This local deployment demonstration uses:

- Published frontend and backend Docker images
- The backend's `prod` Spring profile
- A separate PostgreSQL volume

Accounts and profiles from the standard `localhost:5173` environment are **not automatically available** in the `localhost:5174` environment.

This is a local deployment demonstration, not a publicly hosted application.

## CI/CD

The frontend repository uses GitHub Actions.

The workflow is:

```text
Push to main
    |
    v
Frontend CI
    |
    | npm ci
    | npm run lint
    | npm run build
    v
Frontend Docker Publish
    |
    v
GitHub Container Registry
```

Docker image:

```text
ghcr.io/giray-subasi/cav-frontend:latest
```

The published frontend image is built with:

```text
VITE_API_BASE_URL=/api
```

The pipeline automates validation, building, and Docker image publishing. It does not deploy the application to a public server.

## Backend Repository

https://github.com/Giray-Subasi/cav-backend

## Frontend Repository

https://github.com/Giray-Subasi/cav-frontend

## Security

- JWT tokens are stored in browser session storage.
- The frontend sends JWT bearer tokens when accessing protected backend endpoints.
- Database passwords and JWT signing secrets must not be stored in frontend code.
- `VITE_API_BASE_URL` is public build-time configuration, not a secret.
- Authorization is enforced by the backend, not only by frontend route protection.

## Project Status

Core frontend functionality is complete.

Verified locally:

- Frontend integration with the backend and PostgreSQL
- Login and dashboard
- Role-based interface
- Docker/Nginx API forwarding
- Frontend lint and production build
- Automated Docker image publishing
- Local deployment using published images

Current focus: documentation, reproducible local setup, and internship demonstration.