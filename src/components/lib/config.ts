/**
 * Config for the application
 */
const config = {
  initiateLoginEndpoint: process.env.REACT_APP_START_LOGIN_PAGE_URL || "https://localhost:53000/auth-start.html",
  clientId: process.env.REACT_APP_CLIENT_ID || "38681428-5b78-4e82-97ff-e168419e7611",
  apiEndpoint: process.env.REACT_APP_FUNC_ENDPOINT || "http://localhost:7071",
  apiName: process.env.REACT_APP_FUNC_NAME || "getUserProfile",
};

export default config; 