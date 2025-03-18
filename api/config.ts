const config = {
  authorityHost: process.env.M365_AUTHORITY_HOST || "https://login.microsoftonline.com",
  tenantId: process.env.M365_TENANT_ID || "987eaa8d-6b2d-4a86-9b2e-8af581ec8056",
  clientId: process.env.M365_CLIENT_ID || "38681428-5b78-4e82-97ff-e168419e7611",
  clientSecret: process.env.M365_CLIENT_SECRET || "Fxv8Q~xvOukzU2l5BX4kTH8OtvZH0FUznlUo1di3",
};

export default config;
