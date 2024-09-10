import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignInPage from './components/SignInPage';
import HomePage from './components/HomePage';
import AdminPage from './components/AdminPage';
import QuestionPage from './components/QuestionPage';
import ProfilePage from './components/ProfilePage';
import CommentSection from './components/CommentSection';
import { AuthProvider } from './components/AuthContext';
import AuthContext from './components/AuthContext';
import Toolbar from './Toolbar';

// ProtectedRoute component to restrict access based on role
const ProtectedRoute = ({ children, role }) => {
  const { admin, authTokens, loading } = useContext(AuthContext);

  if (loading) return null; // Or a loading spinner/component

  if (!authTokens) {
    return <Navigate to="/login" />;
  }

  if (role === 'admin' && !admin) {
    return <Navigate to="/login" />;
  }

  return children;
};

const LoginRoute = ({ children }) => {
  let {user} = useContext(AuthContext)
  return !user ? children : <Navigate to="/home" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toolbar />
        <Routes>
          {/* Public routes */}
          <Route path="/register" element={<SignInPage />} />

          <Route
            path="/login"
            element={
              <LoginRoute>
                <LoginPage />
              </LoginRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/question/:id"
            element={
              <ProtectedRoute>
                <QuestionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comments/:questionId"
            element={
              <ProtectedRoute>
                <CommentSection />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} /> {/* Catch-all for undefined routes */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
