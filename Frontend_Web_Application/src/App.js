import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import FusionAuthLogin from "./auth/FusionAuthLogin";
import { useAuth } from "./auth/AuthContext";

/**
 * Navigation bar displaying login/logout options and user info.
 */
function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "#f4f4f4",
      padding: "0.75rem 1.5rem",
      marginBottom: "2rem"
    }}>
      <a href="/" style={{ textDecoration: "none", fontWeight: "bold", color: "#3874c2" }}>AIPredictionsPlatform</a>
      <div>
        {isAuthenticated ? (
          <>
            <span style={{ marginRight: "1rem" }}>
              {user && user.email ? `Hello, ${user.email}` : "Logged in"}
            </span>
            <button style={{
              padding: "0.4rem 1.1rem",
              background: "#3874c2",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer"
            }} onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <a href="/login">
            <button style={{
              padding: "0.4rem 1.1rem",
              background: "#3874c2",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer"
            }}>Login</button>
          </a>
        )}
      </div>
    </nav>
  );
}

/**
 * ProtectedRoute requiring authentication, else redirects to login.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/** Example Home - demonstrates authenticated API use */
function HomePage() {
  const { apiFetch } = useAuth();
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState(null);

  const testApi = async () => {
    try {
      // Example endpoint, adjust to your Django REST API
      const resp = await apiFetch("http://localhost:8000/api/protected/", { method: "GET" });
      if (!resp.ok) throw new Error(`Error: ${resp.status}`);
      const data = await resp.json();
      setResult(data);
    } catch (e) {
      setError(e.message || "Failed to fetch protected resource.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Welcome to AIPredictionsPlatform!</h2>
      <p>You are logged in. Test a protected API call:</p>
      <button onClick={testApi} style={{ padding: "0.5rem 1rem" }}>
        Call Protected Backend API
      </button>
      {result && (
        <pre style={{ background: "#e4e4e4", marginTop: "1rem", padding: "1rem" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
      {error && (
        <pre style={{ color: "red", marginTop: "1rem" }}>
          {error}
        </pre>
      )}
    </div>
  );
}

/**
 * App with authentication, routes, and navigation integrated.
 * For production, expand with user profile, dataset upload, etc.
 */
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/auth/callback" element={<FusionAuthLogin />} />
        <Route path="/login" element={<FusionAuthLogin />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
