import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import FusionAuthLogin from "./auth/FusionAuthLogin";

/**
 * For real production app, expand this with ProtectedRoute logic and fetch user/session on mount.
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth/callback" element={<FusionAuthLogin />} />
        <Route path="/login" element={<FusionAuthLogin />} />
        {/* Example: Home page protected route */}
        <Route path="/" element={<div>Welcome! <a href="/login">Sign in</a></div>} />
      </Routes>
    </Router>
  );
}

export default App;
