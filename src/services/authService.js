import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../config/authConfig';

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL
export const initializeMsal = async () => {
  try {
    await msalInstance.initialize();
    console.log('MSAL initialized successfully');
  } catch (error) {
    console.error('Error initializing MSAL:', error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0;
};

// Get current user account
export const getCurrentAccount = () => {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
};

// Sign in user
export const signIn = async () => {
  try {
    const loginResponse = await msalInstance.loginPopup({
      scopes: ["User.Read", "Sites.ReadWrite.All", "Files.ReadWrite.All"],
      prompt: "select_account"
    });
    
    console.log('Login successful:', loginResponse);
    return loginResponse;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Sign out user
export const signOut = async () => {
  try {
    const logoutRequest = {
      account: getCurrentAccount(),
      postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri
    };
    
    await msalInstance.logoutPopup(logoutRequest);
    console.log('Logout successful');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}; 