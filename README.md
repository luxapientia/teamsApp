# Microsoft Teams Performance Management App

A comprehensive performance management application built for Microsoft Teams, featuring employee development, training course management, and performance tracking capabilities.

## Features

- **Single Sign-On (SSO)** with Azure AD using Teams SDK
- **Employee Development**
  - Training course management
  - Performance tracking
  - Development planning
- **Role-Based Access Control**
  - Super User privileges
  - App Owner capabilities
  - Regular user access
- **Modern UI** built with Material-UI and Microsoft's Fluent UI
- **Responsive Design** that works across devices
- **Microsoft Brand Colors**:
  - Blue (#0078D4) - Primary buttons and highlights
  - Green (#28A745) - Approved statuses
  - Yellow (#FFC107) - Submitted
  - Red (#D13438) - Not Approved

## Configuration Credentials

The app is configured with the following authentication details:
- **Client ID**: 38681428-5b78-4e82-97ff-e168419e7611
- **Client Secret**: Fxv8Q~xvOukzU2l5BX4kTH8OtvZH0FUznlUo1di3
- **Tenant ID**: 987eaa8d-6b2d-4a86-9b2e-8af581ec8056
- **Teams App ID**: Generated during provisioning

## Prerequisites

- [Node.js](https://nodejs.org/), supported versions: 16, 18
- A [Microsoft 365 account for development](https://docs.microsoft.com/microsoftteams/platform/toolkit/accounts)
- [Teams Toolkit Visual Studio Code Extension](https://aka.ms/teams-toolkit) version 5.0.0 and higher or [Teams Toolkit CLI](https://aka.ms/teamsfx-cli)
- MongoDB database for backend storage

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create `.env` file in the root directory
   - Add required environment variables (see `.env.example`)
4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd frontend
   npm run dev:teamsfx
   ```
5. Press F5 in VS Code with the Teams Toolkit extension installed to launch the app in Teams

## Project Structure

| Folder       | Contents                                            |
| ------------ | --------------------------------------------------- |
| `backend`    | Node.js/Express backend with MongoDB integration    |
| `src`        | React frontend source code                          |
| `.vscode`    | VSCode files for debugging                          |
| `appPackage` | Templates for the Teams application manifest        |
| `env`        | Environment files                                   |
| `infra`      | Templates for provisioning Azure resources          |
| `public`     | Static assets                                       |

## Key Components

- **Backend**
  - Express server with RESTful API
  - MongoDB models and schemas
  - Authentication middleware
  - Training course management endpoints

- **Frontend**
  - React components with TypeScript
  - Material-UI components
  - Context providers (Auth, Socket)
  - Training course management interface

## Development

- Backend API endpoints are located in `backend/src/routes/`
- Frontend components are in `src/pages/` and `src/components/`
- Environment variables are managed in `.env` files
- API documentation is available in the codebase

## Deployment

Follow these steps to deploy the application:

1. **Backend Deployment**
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Frontend Deployment**
   ```bash
   cd frontend
   npm run build
   ```

3. **Teams App Deployment**
   - [Provision cloud resources](https://learn.microsoft.com/microsoftteams/platform/toolkit/provision)
   - [Deploy the code to cloud](https://learn.microsoft.com/microsoftteams/platform/toolkit/deploy)
   - [Publish the app](https://learn.microsoft.com/microsoftteams/platform/toolkit/publish)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
