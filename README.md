# Microsoft Teams Tab App with SSO and Tailwind CSS

This app demonstrates how to create a Microsoft Teams tab application with SSO (Single Sign-On) to Azure AD using React, TypeScript, and Tailwind CSS. After successful authentication, users are redirected to a "Hello, World" page styled with the Microsoft design language.

## Configuration Credentials

The app is configured with the following authentication details:
- **Client ID**: 38681428-5b78-4e82-97ff-e168419e7611
- **Client Secret**: Fxv8Q~xvOukzU2l5BX4kTH8OtvZH0FUznlUo1di3
- **Tenant ID**: 987eaa8d-6b2d-4a86-9b2e-8af581ec8056
- **Teams App ID**: af138b87-5e67-40bd-ad03-575faf285d97

## Features

- **Single Sign-On (SSO)** with Azure AD using Teams SDK
- **Modern UI** built with Tailwind CSS and Microsoft's Fluent UI
- **Responsive Design** that works across devices
- **Microsoft Brand Colors**:
  - Blue (#0078D4) - Primary buttons and highlights
  - Green (#28A745) - Approved statuses
  - Yellow (#FFC107) - Submitted
  - Red (#D13438) - Not Approved

## Prerequisites

- [Node.js](https://nodejs.org/), supported versions: 16, 18
- A [Microsoft 365 account for development](https://docs.microsoft.com/microsoftteams/platform/toolkit/accounts)
- [Teams Toolkit Visual Studio Code Extension](https://aka.ms/teams-toolkit) version 5.0.0 and higher or [Teams Toolkit CLI](https://aka.ms/teamsfx-cli)

## Getting Started

1. Clone this repository
2. Run the setup script to ensure all dependencies are installed:
   ```
   node setup.js
   ```
3. Install dependencies if needed:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev:teamsfx
   ```
5. Press F5 in VS Code with the Teams Toolkit extension installed to launch the app in Teams

## Project Structure

| Folder       | Contents                                            |
| ------------ | --------------------------------------------------- |
| `.vscode`    | VSCode files for debugging                          |
| `appPackage` | Templates for the Teams application manifest        |
| `env`        | Environment files                                   |
| `infra`      | Templates for provisioning Azure resources          |
| `src`        | The source code for the Teams application           |
| `public`     | Static assets                                       |

## Key Components

- **App.tsx**: Main application component with SSO handling
- **Tab.tsx**: Tab component that renders after authentication
- **HelloWorld.tsx**: Component shown after successful authentication
- **tailwind.config.js**: Tailwind CSS configuration with Microsoft brand colors

## Development

- Modify the `HelloWorld.tsx` component to customize the post-authentication view
- Adjust styling by modifying Tailwind CSS classes
- Update `tailwind.config.js` to extend the theme if needed

## Deployment

Follow the Teams Toolkit documentation to deploy your app:
1. [Provision cloud resources](https://learn.microsoft.com/microsoftteams/platform/toolkit/provision)
2. [Deploy the code to cloud](https://learn.microsoft.com/microsoftteams/platform/toolkit/deploy)
3. [Publish the app](https://learn.microsoft.com/microsoftteams/platform/toolkit/publish)
