// Azure AD Configuration
export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID || "YOUR_CLIENT_ID_HERE", // Azure AD App Registration Client ID
    authority: process.env.REACT_APP_AUTHORITY || "https://login.microsoftonline.com/YOUR_TENANT_ID_HERE", // Azure AD Tenant
    redirectUri: process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000", // Must be registered as a redirect URI
    postLogoutRedirectUri: process.env.REACT_APP_POST_LOGOUT_REDIRECT_URI || "http://localhost:3000"
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  }
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: ["User.Read", "Sites.ReadWrite.All", "Files.ReadWrite.All"]
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphSitesEndpoint: "https://graph.microsoft.com/v1.0/sites"
}; 