import React, { createContext, useState, useEffect, useContext, useCallback } from "react";

/**
 * AuthContext provides authentication state and auth-related actions to the app.
 * It manages storing/removing JWTs, tracking authenticated user, login/logout, and exposes a fetch wrapper for authorized API requests.
 */
const AuthContext = createContext();

/**
 * Utility to get the access token from localStorage (temporary, should move to httpOnly cookies in production).
 */
function getAccessToken() {
  return window.localStorage.getItem("access_token");
}

/**
 * Utility to remove the access token from localStorage.
 */
function clearAccessToken() {
  window.localStorage.removeItem("access_token");
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(getAccessToken());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());
  const [user, setUser] = useState(null); // Optional: Can be filled after decoding JWT or from backend

  // Load user info from token (decode or refetch from backend)
  useEffect(() => {
    if (accessToken) {
      // Optionally decode JWT and set user info here.
      // For simplicity, only mark as authenticated.
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [accessToken]);

  /**
   * API utility: Attach JWT Authorization header to any fetch request.
   * Usage: apiFetch('/api/endpoint', {method: "GET"})
   */
  const apiFetch = useCallback(async (url, options = {}) => {
    const token = getAccessToken();
    const headers = options.headers ? {...options.headers} : {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    // Default content-type for JSON POST by design
    if (!headers["Content-Type"] && (!options.method || options.method === "POST")) {
      headers["Content-Type"] = "application/json";
    }

    const resp = await fetch(url, { ...options, headers });
    
    // Handle 401/403 for automatic logout/session-expiry
    if (resp.status === 401 || resp.status === 403) {
      logout();
      throw new Error("Session expired. Please log in again.");
    }
    return resp;
  }, []);

  /**
   * Core login handler to securely store token after authentication.
   * Example: Used after successful authentication via OAuth or credentials.
   */
  const login = useCallback((token) => {
    window.localStorage.setItem("access_token", token);
    setAccessToken(token);
    setIsAuthenticated(true);
  }, []);

  /**
   * Log out the user: Remove token and reset context state.
   */
  const logout = useCallback(() => {
    clearAccessToken();
    setAccessToken(null);
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  // On mount, track cross-tab logout/login
  useEffect(() => {
    const handler = () => {
      setAccessToken(getAccessToken());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // PUBLIC_INTERFACE
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        accessToken,
        login,
        logout,
        apiFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// PUBLIC_INTERFACE
/**
 * Hook to access authentication context and actions.
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * For usage:
 *   - Wrap <AuthProvider> around your <App/> in index.js.
 *   - Use `useAuth()` to access login, logout, apiFetch, isAuthenticated, user, etc.
 *   - For API requests, substitute fetch() with apiFetch() to auto-attach JWT.
 */
