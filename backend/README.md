# Teams App Backend

This is the backend service for the Teams App.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration values.

4. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot reload
- `npm run build`: Build the TypeScript code
- `npm run lint`: Run ESLint
- `npm test`: Run tests

## API Endpoints

### Authentication

- `GET /api/auth/login`: Initiate Azure AD login
- `GET /api/auth/callback`: Handle Azure AD callback
- `GET /api/auth/profile`: Get user profile (protected)
- `POST /api/auth/logout`: Logout user (protected)

## Project Structure

```
src/
├── config/         # Configuration files
├── middleware/     # Express middleware
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript type definitions
└── server.ts       # Main application file
``` 