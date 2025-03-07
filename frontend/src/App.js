import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from './features/auth/authSlice';
import Header from './components/Header';
import Footer from './components/Footer';
import WebSocketNotifications from './components/WebSocketNotifications';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Import route configuration
import { routeConfig } from './routes/RoutesConfig';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './assets/styles/tenaga-theme.css';
import './App.css';

// Protected route component that handles authentication
const ProtectedRoute = ({ element, adminOnly }) => {
  const { isAuthenticated, userInfo } = useSelector((state) => state.auth);
  
  // Check if route requires admin access
  if (adminOnly && (!userInfo || userInfo.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // User is authenticated, render the component
  return element;
};

const App = () => {
  const dispatch = useDispatch();
  const { isCheckingAuth } = useSelector((state) => state.auth);
  
  // Check authentication status on app load
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);
  
  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }
  
  return (
    <Router>
      <Header />
      <WebSocketNotifications />
      <main className="py-3">
        <Container>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {routeConfig.map((route) => {
                  const RouteComponent = route.component;
                  
                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        route.public ? (
                          <RouteComponent {...(route.props || {})} />
                        ) : (
                          <ProtectedRoute 
                            element={<RouteComponent {...(route.props || {})} />}
                            adminOnly={route.adminOnly}
                          />
                        )
                      }
                    />
                  );
                })}
                
                {/* Fallback route for any unmatched routes */}
                <Route
                  path="*"
                  element={<Navigate to="/" replace />}
                />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Container>
      </main>
      <Footer />
    </Router>
  );
};

export default App;