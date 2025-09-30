import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, User } from 'lucide-react';
import { signIn, signOut, isAuthenticated, getCurrentAccount } from '../../services/authService';

const LoginButton = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const authStatus = isAuthenticated();
    setAuthenticated(authStatus);
    if (authStatus) {
      const account = getCurrentAccount();
      setUser(account);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn();
      checkAuthStatus();
    } catch (error) {
      console.error('Sign in failed:', error);
      alert('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      alert('Sign out failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authenticated && user) {
    return (
      <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <User size={20} className="text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">
              Signed in as: {user.name || user.username}
            </p>
            <p className="text-xs text-green-600">{user.username}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          <LogOut size={16} />
          <span>{loading ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-800 mb-3">
        Please sign in with your Microsoft account to submit the form to SharePoint.
      </p>
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        <LogIn size={20} />
        <span>{loading ? 'Signing in...' : 'Sign in with Microsoft'}</span>
      </button>
    </div>
  );
};

export default LoginButton; 