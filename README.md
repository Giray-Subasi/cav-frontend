# C.A.V Frontend

Frontend application for the C.A.V eSIM Management System.

The application provides a web interface for authentication, eSIM profile management, role-based operations, filtering, sorting, pagination, and profile lifecycle management.

## Technology Stack

- React
- Vite
- JavaScript
- React Router
- JWT
- CSS
- Nginx
- Docker

## Features

- Login with JWT authentication
- Protected routes
- USER and ADMIN role support
- Profile listing
- Profile details
- Filtering by status and operator
- Sorting
- Pagination
- ADMIN profile creation
- ADMIN profile editing
- ADMIN profile deletion
- eSIM lifecycle actions
  - Start Download
  - Complete Download
  - Enable
- Responsive interface
- Docker production build with Nginx

## User Roles

### USER

Users can:

- Log in
- View profiles
- Filter and sort profiles
- Use pagination
- View profile details

### ADMIN

Administrators can additionally:

- Create profiles
- Edit profiles
- Delete profiles
- Manage profile lifecycle states

## Local Development

Install dependencies:

```bash
npm install
```

Create a `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Start the development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

## Production Build

Create a production build with:

```bash
npm run build
```

The generated files are stored in:

```text
dist/
```

Test the production build locally:

```bash
npm run preview -- --port 5173
```

## Docker

Build the frontend Docker image:

```bash
docker build --build-arg VITE_API_BASE_URL=http://localhost:8080 -t cav-frontend .
```

The production image uses Nginx to serve the React application.

The complete frontend, backend, and PostgreSQL system can also be started through the Docker Compose configuration in the backend repository.

## Backend

The frontend communicates with the Spring Boot REST API using JWT Bearer authentication.

Backend repository:

```text
https://github.com/Giray-Subasi/cav-backend
```

## Repository

Frontend repository:

```text
https://github.com/Giray-Subasi/cav-frontend
```

## Security

JWT tokens are stored in browser session storage.

Sensitive backend configuration such as database passwords and JWT signing secrets is never stored in the frontend.

`VITE_API_BASE_URL` is a public frontend configuration value and is provided through environment configuration.

## Project Status

Core frontend functionality is complete.

Current focus:

- Documentation
- CI/CD
- Deployment
- Final project polish