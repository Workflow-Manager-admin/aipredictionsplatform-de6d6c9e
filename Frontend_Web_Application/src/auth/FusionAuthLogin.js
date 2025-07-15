import React, { useEffect } from "react";
import { useAuth } from "./AuthContext";

/**
 * Configuration points: Set these values for your FusionAuth application.
 */
const FUSIONAUTH_CLIENT_ID = "YOUR_FUSIONAUTH_CLIENT_ID";
const FUSIONAUTH_REDIRECT_URI = "http://localhost:3000/auth/callback"; // Change as appropriate for your deployment
const FUSIONAUTH_BASE_URL = "https://YOUR_FUSIONAUTH_DOMAIN"; // e.g. https://auth.example.com
const BACKEND_TOKEN_VERIFY_ENDPOINT = "http://localhost:8000/api/auth/verify/"; // Change as appropriate

/**
 * Utility function to build the FusionAuth OAuth2 authorization URL.
 */
function buildFusionAuthAuthorizeUrl() {
  const state = encodeURIComponent(Math.random().toString(36).substring(7)); // Could use a better CSRF protection in production
  const params = [
    `client_id=${FUSIONAUTH_CLIENT_ID}`,
    `redirect_uri=${encodeURIComponent(FUSIONAUTH_REDIRECT_URI)}`,
    "response_type=code",
    "scope=openid offline_access", // adjust scopes as needed
    `state=${state}`,
  ];
  return `${FUSIONAUTH_BASE_URL}/oauth2/authorize?${params.join("&")}`;
}

// PUBLIC_INTERFACE
function FusionAuthLogin() {
  const { login } = useAuth();

  /** Handler to initiate the OAuth flow. */
  const handleLogin = () => {
    window.location.href = buildFusionAuthAuthorizeUrl();
  };

  // If on the /auth/callback route, handle the code exchange and JWT storage via context.
  useEffect(() => {
    if (window.location.pathname === "/auth/callback") {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (code) {
        fetch(BACKEND_TOKEN_VERIFY_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Support secure cookie setting from backend
          body: JSON.stringify({ code }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Backend verification failed");
            return res.json();
          })
          .then((data) => {
            if (data && data.access_token) {
              // Use AuthContext login action for secure app-wide management
              login(data.access_token);
              window.location.href = "/";
            } else {
              alert("Authentication failed: No access token received.");
            }
          })
          .catch((err) => {
            alert("Authentication failed: " + err.message);
          });
      }
    }
  }, [login]);

  // Render login button if not on callback path.
  if (window.location.pathname === "/auth/callback") {
    return <div>Completing login, please wait...</div>;
  }

  return (
    <div style={{ margin: "2rem auto", textAlign: "center", maxWidth: "320px" }}>
      <h2>Sign In</h2>
      <button
        onClick={handleLogin}
        style={{
          padding: "0.65rem 1.5rem",
          background: "#3874c2",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        Login with FusionAuth
      </button>
      <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "#888" }}>
        (This will redirect you to FusionAuth for secure sign-in.)
      </p>
    </div>
  );
}

// PUBLIC_INTERFACE
export default FusionAuthLogin;

/**
 * For integration:
 * - Route /auth/callback to render a page containing this component (or render globally on all pages).
 * - Make sure Backend API endpoint exchanges `code` for JWT, sets secure cookie or responds with access_token.
 * - Securely store JWT (prefer HTTP-only SameSite cookie set by backend, NOT localStorage for production!).
 * - Use an AuthProvider/context for full-featured session/user management in the app.
 *
 * Usage:
 * - AuthProvider wraps App to manage authentication state/context.
 * - This component handles only UI and login/callback code flow.
 * - Logout, session expiry, and secure API calls supported via AuthContext.
 */
